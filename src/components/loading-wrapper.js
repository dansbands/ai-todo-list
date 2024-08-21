import { Navigate } from "react-router-dom";
import loadingGif from "../img/loading.gif";
import ElevatorPitch from "./elevator-pitch";
import { featureFlags } from "../util/feature-flags";

const LoadingWrapper = ({ children, pageLoadingState }) => {
  if (localStorage.getItem("token")) {
    return <Navigate to="/" />;
  }

  if (pageLoadingState && pageLoadingState === "loading") {
    return (
      <div className="sign-up-form">
        <div className="loading-indicator">
          <img src={loadingGif} alt="loader" />
          <div>Loading...</div>
          {featureFlags.hasElevatorPitch ? <ElevatorPitch /> : <div>This usually takes a minute</div>}
        </div>
      </div>
    );
  }

  if (pageLoadingState && pageLoadingState === "error") {
    return (
      <div className="sign-up-form">
        <div className="loading-indicator">
          <div>Something went wrong</div>
        </div>
      </div>
    );
  }
  return <>{children}</>;
};

export default LoadingWrapper;
