import React from "react";
import Mcq from "./Mcq";

function Quiz({ currentQuestionIndex, currentQuestions, updateAssessment }) {
  return (
    <div>
      <Mcq
        key={currentQuestionIndex}
        result={updateAssessment}
        question={currentQuestions[currentQuestionIndex]?.question}
        correctAnswer={currentQuestions[currentQuestionIndex]?.correctAnswer}
        answers={currentQuestions[currentQuestionIndex]?.answers}
      />
    </div>
  );
}

export default Quiz;
