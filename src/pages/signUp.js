import React from "react";
import { Link } from "react-router-dom";
import Input from "./input";

const SignUp = () => {
  const handleSubmit = () => {};

  return (
    <>
      <div className="sign-up-form">
        <div className="form-title">Sign Up</div>
        <Input name="firstName" title="First Name" />
        <Input name="lastName" title="Last Name" />
        <Input name="email" title="Email" />
        <Input name="password" title="Password" />
        <button type="submit" onClick={handleSubmit}>
          Sign Up
        </button>
        <div className="sign-up-links">
          <Link to="/sign-in">Sign In instead</Link>
          <Link to="/">Home</Link>
        </div>
      </div>
    </>
  );
};

export default SignUp;
