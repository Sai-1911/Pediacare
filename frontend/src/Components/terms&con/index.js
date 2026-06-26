import React from 'react'

function TermsConditions() {
  return (
    <div className="container py-5" style={{fontFamily: "'Nunito', sans-serif"}}>
      {/* Page Header */}
      <div className="row mb-5 text-center">
        <div className="col">
          <h2 className="fw-bold" style={{color: '#0077B6'}}>
            <i className="bi bi-file-earmark-text me-3 text-warning"></i>
            Terms & Conditions
          </h2>
          <p className="text-muted mt-2" style={{fontSize: '1.1rem'}}>
            Please read the following terms and conditions carefully before using our services.
          </p>
        </div>
      </div>

      {/* Terms Sections */}
      <div className="row">
        <div className="col-md-10 col-lg-8 mx-auto">
          <div className="modern-card p-5">
            {/* General Information */}
            <div className="mb-4 pb-4 border-bottom">
              <h4 className="fw-bold text-dark mb-3">
                <i className="bi bi-info-circle-fill me-2 text-primary"></i>1. General Information
              </h4>
              <p className="text-muted" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>
                Welcome to our pediatric clinic. By accessing our website, you agree to these terms. These terms govern your use of our services and ensure a safe, secure, and supportive environment for all patients and caregivers.
              </p>
            </div>

            {/* User Responsibilities */}
            <div className="mb-4 pb-4 border-bottom">
              <h4 className="fw-bold text-dark mb-3">
                <i className="bi bi-person-check-fill me-2 text-info"></i>2. User Responsibilities
              </h4>
              <ul className="text-muted" style={{fontSize: '1.05rem', lineHeight: '1.8', paddingLeft: '1.5rem'}}>
                <li className="mb-2">Users must provide accurate health details for better service.</li>
                <li className="mb-2">Appointments must be scheduled in advance.</li>
                <li className="mb-2">Misuse of the platform may result in restricted access.</li>
              </ul>
            </div>

            {/* Privacy Policy */}
            <div className="mb-4 pb-4 border-bottom">
              <h4 className="fw-bold text-dark mb-3">
                <i className="bi bi-shield-lock-fill me-2 text-success"></i>3. Privacy Policy
              </h4>
              <p className="text-muted" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>
                We prioritize your privacy. Your data will be handled securely and will not be shared without consent. All medical records are kept strictly confidential under healthcare guidelines.
              </p>
            </div>

            {/* Cancellation Policy */}
            <div className="mb-4 pb-4 border-bottom">
              <h4 className="fw-bold text-dark mb-3">
                <i className="bi bi-calendar-x-fill me-2 text-warning"></i>4. Cancellation Policy
              </h4>
              <p className="text-muted" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>
                Users can cancel appointments at least 24 hours in advance. Late cancellations may be subject to fees to accommodate other patients in need of medical attention.
              </p>
            </div>

            {/* Disclaimer */}
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-3">
                <i className="bi bi-exclamation-triangle-fill me-2 text-danger"></i>5. Disclaimer
              </h4>
              <p className="text-muted" style={{fontSize: '1.05rem', lineHeight: '1.7'}}>
                Our services provide general healthcare guidance and should not be used as a substitute for emergency medical attention. In case of a medical emergency, please contact your local emergency services immediately.
              </p>
            </div>
            
            <div className="text-center mt-5 pt-3 border-top">
              <p className="text-muted mb-0 small">Last updated: June 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions
