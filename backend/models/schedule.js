const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  date: { type: String, required: true },
  session: { type: String, required: true }, // "Morning" or "Evening"
  slots: [{ type: String }] // Array of time strings like "08:00"
});

scheduleSchema.index({ date: 1, session: 1 }, { unique: true });

const ScheduleModel = mongoose.model('Schedule', scheduleSchema);

module.exports = ScheduleModel;
