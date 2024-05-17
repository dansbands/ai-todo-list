import React from "react";
import { Link } from "react-router-dom";
import Input from "./input";

const SignIn = () => {
  const handleSubmit = () => {};

  return (
    <>
      <div className="sign-up-form">
        <div className="form-title">Sign In</div>
        <Input name="email" title="Email" />
        <Input name="password" title="Password" />
        <button type="submit" onClick={handleSubmit}>
          Sign In
        </button>
        <div className="sign-up-links">
          <Link to="/sign-up">Sign Up instead</Link>
          <Link to="/">Home</Link>
        </div>
      </div>
    </>
  );
};

export default SignIn;
