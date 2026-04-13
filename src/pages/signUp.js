import React, { useEffect, useState } from "react";
import { getApp } from "../util/fetch";
import LoadingWrapper from "../components/loading-wrapper";
import SignUpForm from "../components/sign-up-form";

const SignUp = () => {
  const [serviceWarning, setServiceWarning] = useState("");

  useEffect(() => {
    let isActive = true;

    getApp()
      .then(() => {
        if (isActive) {
          setServiceWarning("");
        }
      })
      .catch(() => {
        if (isActive) {
          setServiceWarning(
            "The app could not confirm a server connection. You can still try signing up, but deployment API settings may need attention."
          );
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <LoadingWrapper>
      <div className="sign-up-container">
        <div className="sign-up-left"></div>
        <div className="sign-up-right">
          {serviceWarning && <div className="auth-error">{serviceWarning}</div>}
          <SignUpForm
            showGuestAction={true}
            title="Sign Up"
            subtitle="Start fresh, or dip in as a guest if you just want to explore."
          />
        </div>
      </div>
    </LoadingWrapper>
  );
};

export default SignUp;
