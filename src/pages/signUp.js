import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "./input";
import { postNewUser } from "../util/fetch";
import { useAuth } from "../components/auth";

const SignUp = () => {
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

  const handleSubmit = () => {
    if (
      inputValue.firstName &&
      inputValue.lastName &&
      inputValue.email &&
      inputValue.password
    ) {
      postNewUser(inputValue).then((res) => {
        console.log('res', res)
        // localStorage.setItem("token", res.data.token);
        auth.signIn(res.data, () => navigate("/"));
      }); // handle res from from server/index.js
      setInputValue({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
    } else {
      setInputError({
        firstName: !inputValue.firstName,
        lastName: !inputValue.lastName,
        email: !inputValue.email,
        password: !inputValue.password,
      });
    }
  };

  return (
    <>
      <div className="sign-up-form">
        <div className="form-title">Sign Up</div>
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
        <button type="submit" onClick={handleSubmit}>
          Sign Up
        </button>
        <div className="sign-up-links">
          <Link to="/sign-in">Sign In instead</Link>
        </div>
      </div>
    </>
  );
};

export default SignUp;
