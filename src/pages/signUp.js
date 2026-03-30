import React, { useEffect, useState } from "react";
import { getApp } from "../util/fetch";
import LoadingWrapper from "../components/loading-wrapper";
import SignUpForm from "../components/sign-up-form";

const SignUp = () => {
  const [pageLoadingState, setPageLoadingState] = useState(null);

  useEffect(() => {
    setPageLoadingState("loading");
    getApp()
      .then(() => null)
      .then(() => setPageLoadingState("complete"))
      .catch(() => setPageLoadingState("error"));
  }, []);

  return (
    <LoadingWrapper pageLoadingState={pageLoadingState}>
      <div className="sign-up-container">
        <div className="sign-up-left"></div>
        <div className="sign-up-right">
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
