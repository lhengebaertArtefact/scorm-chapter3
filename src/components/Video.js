import React from "react";
import CompleteButton from "./CompleteButton";

function Video({ src, completeObjective }) {
  return (
    <div>
      <video src={src} controls />
      <CompleteButton completeActivity={completeObjective} />
    </div>
  );
}

export default Video;
