import React from "react";
import { Link } from "react-router-dom";

const SignIn = () => {
  return (
    <>
      <div>Sign In</div>
      <Link to="/sign-up">Sign Up instead</Link>
    </>
  );
};

export default SignIn;