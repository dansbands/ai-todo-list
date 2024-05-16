import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightToBracket, faUser } from "@fortawesome/free-solid-svg-icons";

const Header = () => {
  let loggedIn = false; // replace with Auth, route "Log In" to /login screen

  return (
    <header className="App-header">
      <div className="App-header-main">
        <div className="App-title-container">
          <div className="App-title">A.I. To-Do List</div>
          <div className="App-subtitle">powered by ChatGPT</div>
        </div>
      </div>
      <div className="App-header-right">
        {loggedIn ? (
          <div className="App-user">
            <FontAwesomeIcon icon={faUser} />
            User Name
          </div>
        ) : (
          <a className="App-login" href="/sign-in">
            <FontAwesomeIcon icon={faRightToBracket} />
            Log In
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;
