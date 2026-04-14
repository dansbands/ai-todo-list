 "use client";

import { Navigate } from "../util/router";
import loadingGif from "../img/loading.gif";

const LoadingWrapper = ({ children, pageLoadingState }) => {
  if (typeof window !== "undefined" && localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  if (pageLoadingState && pageLoadingState === "loading") {
    return (
      <div className="page-loader-shell">
        <div className="loading-indicator">
          <img src={loadingGif.src || loadingGif} alt="loader" />
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
