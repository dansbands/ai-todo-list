 "use client";

import { useState } from "react";
import { useNavigate } from "../util/router";
import { useAuth } from "./auth";
import LogoLight from "../img/logo-light.jpeg";
import LogoDark from "../img/logo-dark.jpeg";

const Header = ({ isLight }) => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isHoveringUser, setIsHoveringUser] = useState(false);
  const userLabel = auth.user?.firstName || auth.user?.email || "Account";

  return (
    <>
      <header className="App-header">
        <div className="App-header-main">
          <div className="App-title-container">
            <img
              src={(isLight ? LogoLight : LogoDark).src || (isLight ? LogoLight : LogoDark)}
              alt="Logo"
            />
          </div>
        </div>
        <div className="App-header-right">
          {auth.user ? (
            <button
              className={`App-user ${isHoveringUser ? "is-logging-out" : ""}`}
              onClick={() => {
                auth.signOut(() => navigate("/sign-in"));
              }}
              onMouseEnter={() => setIsHoveringUser(true)}
              onMouseLeave={() => setIsHoveringUser(false)}
              onFocus={() => setIsHoveringUser(true)}
              onBlur={() => setIsHoveringUser(false)}
            >
              <span aria-hidden="true">{isHoveringUser ? "↪" : "👤"}</span>
              {isHoveringUser ? "Log Out" : userLabel}
            </button>
          ) : null}
        </div>
      </header>
      <p style={{ fontSize: "10px" }}>v.1.3</p>
    </>
  );
};

export default Header;
