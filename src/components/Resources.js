import React from "react";
import CompleteButton from "./CompleteButton";

function Resources({ content, completeObjective }) {
  return (
    <div>
      <p>{content}</p>
      <CompleteButton completeActivity={completeObjective} />
    </div>
  );
}

export default Resources;
