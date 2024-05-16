import React from "react";
import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <>
      <div>Sign Up</div>
      <Link to="/sign-in">Sign In instead</Link>
      <Link to="/">Home</Link>
    </>
  );
};

export default SignUp;
