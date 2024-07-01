import React, { useState, useCallback } from "react";

function Mcq({ question, answers, correctAnswer, result }) {
  const [selectedOption, setSelectedOption] = useState(0);
  const [answered, setAnswered] = useState(false);

  const handleOptionChange = useCallback((changeEvent) => {
    setSelectedOption(Number(changeEvent.target.value));
  }, []);

  const renderAnswers = () => {
    return answers.map((answer, index) => (
      <div className="answer" key={index}>
        <input
          type="radio"
          value={index}
          checked={selectedOption === index}
          onChange={handleOptionChange}
        />
        <label>{answer}</label>
      </div>
    ));
  };

  const handleFormSubmit = useCallback(
    (formSubmitEvent) => {
      formSubmitEvent.preventDefault();
      setAnswered(true);
      result(selectedOption === correctAnswer, answers[selectedOption]);
    },
    [selectedOption, correctAnswer, answers, result]
  );

  const checkCorrectAnswer = () => {
    if (selectedOption === correctAnswer) {
      return `yes, ${answers[correctAnswer]} is the correct answer.`;
    } else {
      return `You answered ${answers[selectedOption]}. Sorry, but the correct answer is ${answers[correctAnswer]}.`;
    }
  };

  const currentState = () => {
    if (!answered) {
      return (
        <form onSubmit={handleFormSubmit}>
          {renderAnswers()}
          <button className="btn btn-default" type="submit">
            Submit
          </button>
        </form>
      );
    } else {
      return <div>{checkCorrectAnswer()}</div>;
    }
  };

  return (
    <div className="Mcq">
      <p>{question}</p>
      {currentState()}
    </div>
  );
}

export default Mcq;
