import React, { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import Input from "./input";
import loadingGif from "../img/loading.gif";
import { getApp, postExistingUser } from "../util/fetch";
import { useAuth } from "../components/auth";

const SignIn = () => {
  const [pageLoadingState, setPageLoadingState] = useState(null);
  const [inputValue, setInputValue] = useState({ email: "", password: "" });
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
      await postExistingUser(inputValue)
        .then((res) => {
          auth.signIn(res.data, () => navigate("/"));
        }) // handle res from from server/index.js
        .then(() => {
          setInputValue({ email: "", password: "" });
        })
        .catch((err) =>
          setAuthError(err?.response?.data?.error || "Error logging in")
        );
    } else {
      setInputError({
        email: !inputValue.email,
        password: !inputValue.password,
      });
    }
  };

  if (localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  if (pageLoadingState && pageLoadingState === "loading") {
    return (
      <div className="sign-up-form">
        <div className="loading-indicator">
          <img src={loadingGif} alt="loader" />
          <div>Loading...</div>
          <div>This usually takes a minute</div>
        </div>
      </div>
    );
  }

  if (pageLoadingState && pageLoadingState === "error") {
    return (
      <div className="sign-up-form">
        <div className="loading-indicator">
          <div>Something went wrong</div>
        </div>
      </div>
    );
  }

  return (
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
      <button type="submit" onClick={handleSubmit}>
        Sign In
      </button>
      <div className="sign-up-links">
        <Link to="/sign-up">Sign Up instead</Link>
      </div>
    </div>
  );
};

export default SignIn;
