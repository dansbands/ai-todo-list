import { Navigate } from "react-router-dom";
import loadingGif from "../img/loading.gif";

const LoadingWrapper = ({ children, pageLoadingState }) => {
  if (localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  if (pageLoadingState && pageLoadingState === "loading") {
    return (
      <div className="page-loader-shell">
        <div className="loading-indicator">
          <img src={loadingGif} alt="loader" />
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (pageLoadingState && pageLoadingState === "error") {
    return (
      <div className="page-loader-shell">
        <div className="loading-indicator">
          <div>Something went wrong</div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default LoadingWrapper;
