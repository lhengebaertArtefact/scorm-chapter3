import React, { useEffect, useState, useCallback } from "react";
import logo from "./logo.svg";
import "./App.css";
import Learner from "./components/Learner";
import Scorm from "./scorm/Scorm";
import CompleteButton from "./components/CompleteButton";
import Mcq from "./components/Mcq";

function App() {
  const [learnerName, setLearnerName] = useState("cher visiteur");
  const [assessment, setAssessment] = useState([]);
  const [tabKeyPressed, setTabKeyPressed] = useState(false);

  useEffect(() => {
    console.log("Initializing SCORM...");
    const initialized = Scorm.init();
    if (initialized) {
      const name = Scorm.getLearnerName();
      setLearnerName(name);
      console.log("SCORM initialized, learner name:", name);
    } else {
      console.error("Failed to initialize SCORM");
    }

    const handleKeyDown = (event) => {
      if (event.key === "Tab") {
        setTabKeyPressed(true);

        requestAnimationFrame(() => {
          const activeElement = document.activeElement;
          if (activeElement) {
            const label =
              activeElement.getAttribute("aria-label") ||
              activeElement.innerText;
            if (label) {
              const utterance = new SpeechSynthesisUtterance(label);
              window.speechSynthesis.speak(utterance);
            }
          }
        });
      }
    };

    const handleMouseDown = (e) => {
      e.preventDefault();
      setTabKeyPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      console.log("Terminating SCORM...");
      Scorm.finish();
      window.removeEventListener("keydown", handleKeyDown);

      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, [tabKeyPressed]);

  const completeAndCloseCourse = useCallback(() => {
    Scorm.completeAndCloseCourse();
  }, []);

  const updateAssessment = useCallback((correct, response) => {
    setAssessment((prevAssessment) => [...prevAssessment, correct]);
    Scorm.submitMCQ(correct, response);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="logo en foime d'atome"
          tabIndex="0"
          aria-label="logo de l'application"
        />
        <Learner name={learnerName} />
      </header>
      <main>
        <Mcq
          result={updateAssessment}
          question="What is 10*10?"
          correctAnswer={0}
          answers={["100", "20"]}
        />
        <Mcq
          result={updateAssessment}
          question="What is the capital of Spain?"
          correctAnswer={2}
          answers={["Barcelona", "Lisbon", "Madrid"]}
        />
        <Mcq
          result={updateAssessment}
          question="Which US President's office commissioned the creation of SCORM?"
          correctAnswer={3}
          answers={[
            "Donald Trump",
            "Barack Obama",
            "Ronald Reagan",
            "Bill Clinton",
          ]}
        />
        <CompleteButton completeActivity={completeAndCloseCourse} />
      </main>
    </div>
  );
}

export default App;
