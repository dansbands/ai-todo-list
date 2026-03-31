import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Input from "./input";
import { getApp, getRequestErrorMessage, postExistingUser } from "../util/fetch";
import { useAuth } from "../components/auth";

const SignIn = () => {
  const [, setPageLoadingState] = useState(null);
  const [showSignInForm, setShowSignInForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValue, setInputValue] = useState({
    email: "",
    password: "",
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
    <>
      {auth.user ? <Navigate to="/" replace /> : null}
      <div className="sign-up-container">
        <div className={showSignInForm ? "sign-up-left" : "sign-up-intro"}></div>
        <div className="sign-up-right">
          {showSignInForm ? (
            <div className="sign-up-form">
              <div className="form-title-block">
                <div className="form-title">Welcome back</div>
                <div className="form-subtitle">Pick up where you left off.</div>
              </div>
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
                <Link to="/sign-up">Need an account? Sign Up</Link>
                <button
                  type="button"
                  className="text-link-button"
                  onClick={() => setShowSignInForm(false)}
                >
                  Back to splash
                </button>
              </div>
            </div>
          ) : (
            <div className="help-container">
              <div>Does life feel like this lately?</div>
              <div>You need help!</div>
              <button className="get-started" onClick={() => navigate("/sign-up")}>
                Get Started!
              </button>
              <button
                type="button"
                className="get-started get-started-secondary"
                onClick={() => setShowSignInForm(true)}
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SignIn;
