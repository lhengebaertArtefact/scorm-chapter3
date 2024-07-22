import React from "react";

function ProgressBar({ progress }) {
  return (
    <div style={{ width: "100%", backgroundColor: "#ccc" }}>
      <div
        style={{
          width: `${progress}%`,
          height: "24px",
          backgroundColor: "green",
        }}
      />
    </div>
  );
}

export default ProgressBar;
