import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../pages/input";
import {
  createGuestSession,
  getRequestErrorMessage,
  postNewUser,
} from "../util/fetch";
import { useAuth } from "./auth";

const SignUpForm = ({
  includeAuthOnSubmit = false,
  onSignedUp,
  showGuestAction = false,
  showSignInLink = true,
  title = "Sign Up",
  subtitle = "",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [inputValue, setInputValue] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [inputError, setInputError] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });

  const auth = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (userData) => {
    auth.signIn(userData, () => {
      if (onSignedUp) {
        onSignedUp(userData);
        return;
      }

      navigate("/");
    });
  };

  const handleSubmit = async () => {
    if (
      inputValue.firstName &&
      inputValue.lastName &&
      inputValue.email &&
      inputValue.password
    ) {
      setAuthError("");
      setIsSubmitting(true);

      await postNewUser(inputValue, { includeAuth: includeAuthOnSubmit })
        .then((res) => {
          handleSuccess(res.data);
        })
        .then(() => {
          setInputValue({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          });
        })
        .catch((err) => setAuthError(getRequestErrorMessage(err, "Error signing up")))
        .finally(() => setIsSubmitting(false));
    } else {
      setInputError({
        firstName: !inputValue.firstName,
        lastName: !inputValue.lastName,
        email: !inputValue.email,
        password: !inputValue.password,
      });
    }
  };

  const handleContinueAsGuest = async () => {
    setAuthError("");
    setIsGuestSubmitting(true);

    await createGuestSession()
      .then((res) => {
        auth.signIn(res.data, () => navigate("/"));
      })
      .catch((err) =>
        setAuthError(getRequestErrorMessage(err, "Error creating guest session"))
      )
      .finally(() => setIsGuestSubmitting(false));
  };

  return (
    <div className="sign-up-form">
      <div className="form-title-block">
        <div className="form-title">{title}</div>
        {subtitle ? <div className="form-subtitle">{subtitle}</div> : null}
      </div>
      <Input
        name="firstName"
        title="First Name"
        inputValue={inputValue?.firstName}
        inputError={inputError?.firstName}
        setInputValue={setInputValue}
        setInputError={setInputError}
        handleSubmit={handleSubmit}
      />
      <Input
        name="lastName"
        title="Last Name"
        inputValue={inputValue?.lastName}
        inputError={inputError?.lastName}
        setInputValue={setInputValue}
        setInputError={setInputError}
        handleSubmit={handleSubmit}
      />
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
            <span>Signing Up...</span>
          </>
        ) : (
          "Sign Up"
        )}
      </button>
      {showGuestAction ? (
        <button
          type="button"
          onClick={handleContinueAsGuest}
          disabled={isGuestSubmitting}
          className={
            isGuestSubmitting
              ? "auth-submit-button auth-submit-button-secondary is-loading"
              : "auth-submit-button auth-submit-button-secondary"
          }
        >
          {isGuestSubmitting ? (
            <>
              <span className="button-spinner" aria-hidden="true"></span>
              <span>Starting guest session...</span>
            </>
          ) : (
            "Continue as Guest"
          )}
        </button>
      ) : null}
      {showSignInLink ? (
        <div className="sign-up-links">
          <Link to="/sign-in">Already have an account? Sign In</Link>
        </div>
      ) : null}
    </div>
  );
};

export default SignUpForm;
