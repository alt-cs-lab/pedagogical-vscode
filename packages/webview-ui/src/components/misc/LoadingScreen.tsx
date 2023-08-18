import { VSCodeProgressRing } from "@vscode/webview-ui-toolkit/react";

import "./LoadingScreen.css";

export default function LoadingScreen(props: { enabled: boolean }) {
  if (!props.enabled) {
    return null;
  }

  return (
    <div className="loading-screen">
      <div className="loading-screen-background"></div>
      <div className="loading-screen-content">
        <VSCodeProgressRing className="loading-screen-spinner" />
        {/* <div className="loading-screen-text">Loading...</div> */}
      </div>
    </div>
  );
}
