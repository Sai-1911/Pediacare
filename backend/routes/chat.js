const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const SlotModel = require('../models/slot');
const ScheduleModel = require('../models/schedule');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateContentWithRetry = async (options, maxRetries = 3, baseDelayMs = 1000) => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(options);
    } catch (error) {
      if (error.status === 503 || (error.message && error.message.includes('503'))) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        console.warn(`Gemini API 503 error, retrying attempt ${attempt}...`);
        await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
      } else {
        throw error;
      }
    }
  }
};

const checkAvailability = async (date, session) => {
  try {
    const schedule = await ScheduleModel.findOne({ date, session });
    const allSlots = schedule ? schedule.slots : [];
    
    const bookedSlots = await SlotModel.find({ date, session, available: false }).distinct("slot");
    const normalizedBookedSlots = bookedSlots.map((slot) => slot.trim().padStart(5, '0'));
    
    const availableSlots = allSlots.filter(
      (slot) => !normalizedBookedSlots.includes(slot.trim().padStart(5, '0'))
    );
    
    return {
      success: true,
      availableSlots: availableSlots.length > 0 ? availableSlots : ["No slots available for this session"]
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch slots from database" };
  }
};

const bookAppointment = async (date, slot, session, service, user) => {
  if (!user) {
    return { success: false, error: "User is not logged in. Cannot book appointment." };
  }

  try {
    const trimmedSlot = slot.trim().padStart(5, "0");
    const existingSlot = await SlotModel.findOne({ date, slot: trimmedSlot });
    
    if (existingSlot) {
      return { success: false, error: "Slot is already booked." };
    }

    const lastSlot = await SlotModel.findOne().sort({ appId: -1 });
    const newAppId = lastSlot ? lastSlot.appId + 1 : 1;

    // Determine age (defaulting to 1 if not parsed properly)
    let age = "1";
    if (user.dob) {
      const birthYear = new Date(user.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      age = Math.max(1, currentYear - birthYear).toString();
    }

    const newSlot = new SlotModel({
      date,
      slot: trimmedSlot,
      name: user.name || "Unknown Patient",
      parentName: user.fatherName || user.motherName || "Parent",
      age,
      session,
      service: service || "General Consultation",
      pId: user._id || user.patientNo?.toString(),
      available: false,
      appId: newAppId,
    });

    await newSlot.save();
    return { success: true, message: `Successfully booked for ${date} at ${slot}` };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Database error while booking slot." };
  }
};

router.post('/', async (req, res) => {
  try {
    const { message, user } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are a medical assistant for the Pediacare clinic. Follow these strict rules:
1. Keep your answers VERY short and concise. Avoid long paragraphs.
2. ONLY answer questions related to health, medical advice, and the Pediacare clinic.
3. You have tools to check slot availability and book appointments. Use them when requested!
4. If a user asks to book a slot, ask for the date and session (Morning/Evening) first. Then check availability. Then ask them to choose a time. Finally, book it.
5. If the user asks about anything unrelated (like coding, general knowledge, etc.), politely refuse.`;

    const chatSession = [
      { role: "user", parts: [{ text: message }] }
    ];

    let response = await generateContentWithRetry({
      model: 'gemini-2.5-flash',
      contents: chatSession,
      config: {
        systemInstruction: systemPrompt,
        tools: [{
          functionDeclarations: [
            {
              name: "checkAvailability",
              description: "Check available appointment slots for a given date and session.",
              parameters: {
                type: "OBJECT",
                properties: {
                  date: { type: "STRING", description: "Date in YYYY-MM-DD format" },
                  session: { type: "STRING", description: "Either 'Morning' or 'Evening'" }
                },
                required: ["date", "session"]
              }
            },
            {
              name: "bookAppointment",
              description: "Book an appointment slot for the patient.",
              parameters: {
                type: "OBJECT",
                properties: {
                  date: { type: "STRING", description: "Date in YYYY-MM-DD format" },
                  slot: { type: "STRING", description: "Time slot, e.g., '10:00'" },
                  session: { type: "STRING", description: "'Morning' or 'Evening'" },
                  service: { type: "STRING", description: "Service requested, default 'General Consultation'" }
                },
                required: ["date", "slot", "session", "service"]
              }
            }
          ]
        }]
      }
    });

    // Handle tool calls in a loop (the AI might need to call multiple tools sequentially)
    let loopCount = 0;
    while (response.functionCalls && response.functionCalls.length > 0 && loopCount < 5) {
      loopCount++;
      const call = response.functionCalls[0];
      let functionResult = {};

      if (call.name === "checkAvailability") {
        functionResult = await checkAvailability(call.args.date, call.args.session);
      } else if (call.name === "bookAppointment") {
        functionResult = await bookAppointment(call.args.date, call.args.slot, call.args.session, call.args.service, user);
      }

      // We append the AI's function call to history
      chatSession.push({ role: "model", parts: [{ functionCall: call }] });
      
      // We append the system's function response to history
      chatSession.push({
        role: "user",
        parts: [{
          functionResponse: {
            name: call.name,
            response: functionResult
          }
        }]
      });

      // Call the AI again
      response = await generateContentWithRetry({
        model: 'gemini-2.5-flash',
        contents: chatSession,
        config: { 
          systemInstruction: systemPrompt,
          tools: [{
            functionDeclarations: [
              {
                name: "checkAvailability",
                description: "Check available appointment slots for a given date and session.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    date: { type: "STRING", description: "Date in YYYY-MM-DD format" },
                    session: { type: "STRING", description: "Either 'Morning' or 'Evening'" }
                  },
                  required: ["date", "session"]
                }
              },
              {
                name: "bookAppointment",
                description: "Book an appointment slot for the patient.",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    date: { type: "STRING", description: "Date in YYYY-MM-DD format" },
                    slot: { type: "STRING", description: "Time slot, e.g., '10:00'" },
                    session: { type: "STRING", description: "'Morning' or 'Evening'" },
                    service: { type: "STRING", description: "Service requested, default 'General Consultation'" }
                  },
                  required: ["date", "slot", "session", "service"]
                }
              }
            ]
          }]
        }
      });
    }

    let finalMessage = "I'm sorry, I couldn't generate a response. Please try again.";
    if (response.text) {
        finalMessage = response.text;
    } else if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts.length > 0) {
        // Fallback to extract text manually if the getter fails
        finalMessage = response.candidates[0].content.parts.map(p => p.text || "").join("");
    }
    
    // Safety fallback just in case it is still completely empty
    if (!finalMessage || finalMessage.trim() === "") {
        finalMessage = "Done! Is there anything else I can help you with?";
    }

    res.json({ message: finalMessage });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: 'Failed to communicate with AI service' });
  }
});

module.exports = router;
