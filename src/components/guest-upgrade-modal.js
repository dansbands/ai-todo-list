import React from "react";
import SignUpForm from "./sign-up-form";

const GuestUpgradeModal = ({ isOpen, onClose, message = "" }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="guest-upgrade-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
          aria-label="Close sign up dialog"
        >
          x
        </button>
        <div className="auth-modal-copy">
          <div className="eyebrow">Guest Upgrade</div>
          <h2 id="guest-upgrade-title">Save this session before you lose it.</h2>
          <p>
            {message ||
              "Create an account and we will move your guest tasks into it so you can keep going."}
          </p>
        </div>
        <SignUpForm
          includeAuthOnSubmit={true}
          onSignedUp={onClose}
          showSignInLink={false}
          title="Create Your Account"
          subtitle="Your guest tasks and AI context will come with you."
        />
      </div>
    </div>
  );
};

export default GuestUpgradeModal;
