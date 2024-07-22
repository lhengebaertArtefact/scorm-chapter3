import React from "react";
import CompleteButton from "./CompleteButton";

function FinalQuiz({ completeObjective }) {
  return (
    <div>
      <p>Merci d'avoir terminé le quiz!</p>
      <CompleteButton completeActivity={completeObjective} />
    </div>
  );
}

export default FinalQuiz;
