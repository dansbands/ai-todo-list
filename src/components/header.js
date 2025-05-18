import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, Navigate, redirect, useNavigate } from "react-router-dom";
import { useAuth } from "./auth";
import LogoLight from "../img/logo-light.jpeg";
import LogoDark from "../img/logo-dark.jpeg";

const Header = ({isLight}) => {
  const auth = useAuth();
  const navigate = useNavigate();

  return (
    <header className="App-header">
      <div className="App-header-main">
        <div className="App-title-container">
          <img src={isLight ? LogoLight : LogoDark} alt="Logo" height={100} />
        </div>
      </div>
      <div className="App-header-right">
        {auth.user ? (
          <Link className="App-login" to="/sign-in">
            <button
              className="App-user"
              onClick={() => {
                auth.signOut(() => navigate("/sign-in"));
              }}
            >
              <FontAwesomeIcon icon={faUser} />
              {auth.user.firstName}
            </button>
          </Link>
        ) : (
          <Link className="App-login" to="/sign-in">
            <FontAwesomeIcon icon={faRightToBracket} />
            Log In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
