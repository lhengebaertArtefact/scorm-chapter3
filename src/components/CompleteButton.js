import React from "react";

function CompleteButton({ completeActivity }) {
  const handleClick = () => {
    completeActivity();
  };

  return (
    <div>
      <p>Click the button to report completion to the LMS.</p>
      <button onClick={handleClick}>Complete</button>
    </div>
  );
}

export default CompleteButton;
