import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "./input";
import {
  getApp,
  getRequestErrorMessage,
  postExistingUser,
} from "../util/fetch";
import { useAuth } from "../components/auth";

// @TODO: revisit and fix after testing behavior in production
const SignIn = () => {
  const [, setPageLoadingState] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState({
    email: "guest@guest.com",
    password: "abc123",
  });
  const [authError, setAuthError] = useState("");
  const [inputError, setInputError] = useState({
    email: false,
    password: false,
  });

  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setPageLoadingState("loading");
    getApp()
      .then(() => setPageLoadingState("complete"))
      .catch(() => setPageLoadingState("error"));
  }, []);

  const handleSubmit = async () => {
    if (inputValue.email && inputValue.password) {
      setAuthError("");
      setIsSubmitting(true);

      await postExistingUser(inputValue)
        .then((res) => {
          auth.signIn(res.data, () => navigate("/"));
        })
        .then(() => {
          setInputValue({ email: "", password: "" });
        })
        .catch((err) => setAuthError(getRequestErrorMessage(err, "Error logging in")))
        .finally(() => setIsSubmitting(false));
    } else {
      setInputError({
        email: !inputValue.email,
        password: !inputValue.password,
      });
    }
  };

  return (
    <div className="sign-up-container">
      <div className={showSignUp ? "sign-up-left" : "sign-up-intro"}></div>
      <div className="sign-up-right">
        {showSignUp ? (
          <div className="sign-up-form">
            <div className="form-title">Sign In</div>
            <Input
              name="email"
              title="Email"
              inputValue={inputValue?.email}
              inputError={inputError?.email}
              setInputValue={setInputValue}
              setInputError={setInputError}
              handleSubmit={handleSubmit}
            />
            <Input
              name="password"
              title="Password"
              inputValue={inputValue?.password}
              inputError={inputError?.password}
              setInputValue={setInputValue}
              setInputError={setInputError}
              handleSubmit={handleSubmit}
            />
            {authError && <div className="auth-error">{authError}</div>}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={isSubmitting ? "auth-submit-button is-loading" : "auth-submit-button"}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner" aria-hidden="true"></span>
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
            <div className="sign-up-links">
              <Link to="/sign-up">Sign Up instead</Link>
            </div>
          </div>
        ) : (
          <div className="help-container">
            <div>Does life feel like this lately?</div>
            <div>You need help!</div>
            <button className="get-started" onClick={() => setShowSignUp(true)}>
              Get Started!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
