import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./App.css";
import logo from "./logo.svg";
import Learner from "./components/Learner";
import Scorm from "./scorm/Scorm";
import Quiz from "./components/Quiz";
import Video from "./components/Video";
import Resources from "./components/Resources";
import FinalQuiz from "./components/FinalQuiz";
import ProgressBar from "./components/ProgressbBar";

function App() {
  const [learnerName, setLearnerName] = useState("");
  const [tabKeyPressed, setTabKeyPressed] = useState(false);
  const [assessment, setAssessment] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [completedObjectives, setCompletedObjectives] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const objectiveId = searchParams.get("objective");

  const objectives = {
    1: {
      questions: [
        {
          question: "What is 10*10?",
          correctAnswer: 0,
          answers: ["100", "20"],
        },
        {
          question: "What is the capital of Spain?",
          correctAnswer: 2,
          answers: ["Barcelona", "Lisbon", "Madrid"],
        },
        {
          question:
            "Which US President's office commissioned the creation of SCORM?",
          correctAnswer: 3,
          answers: [
            "Donald Trump",
            "Barack Obama",
            "Ronald Reagan",
            "Bill Clinton",
          ],
        },
      ],
    },
    2: {
      type: "video",
      src: "path_to_video_1.mp4",
    },
    3: {
      type: "game",
      questions: [
        {
          question: "What is 5+5?",
          correctAnswer: 0,
          answers: ["10", "15"],
        },
        {
          question: "What is the capital of France?",
          correctAnswer: 1,
          answers: ["Rome", "Paris", "Berlin"],
        },
        {
          question: "Who developed the theory of relativity?",
          correctAnswer: 2,
          answers: [
            "Isaac Newton",
            "Galileo Galilei",
            "Albert Einstein",
            "Nikola Tesla",
          ],
        },
      ],
    },
    4: {
      type: "resources",
      content: "Additional resources content",
    },
    5: {
      questions: [
        {
          question: "Final question 1?",
          correctAnswer: 0,
          answers: ["Answer 1", "Answer 2"],
        },
        {
          question: "Final question 2?",
          correctAnswer: 1,
          answers: ["Answer 1", "Answer 2"],
        },
      ],
    },
  };

  const currentObjective = objectives[objectiveId];

  const currentQuestions =
    currentObjective && currentObjective.questions
      ? currentObjective.questions
      : [];

  useEffect(() => {
    Scorm.init();
    const savedData = Scorm.getSuspendData();

    if (savedData) {
      setCurrentQuestionIndex(savedData.currentQuestionIndex);
      setAssessment(savedData.assessment);
      setCompletedObjectives(savedData.completedObjectives || []);
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

    const handleMouseDown = (event) => {
      event.preventDefault();
      setTabKeyPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      console.log("Terminating SCORM");
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  useEffect(() => {
    // Vérifiez le statut de chaque objectif et mettez à jour completedObjectives
    const objectivesStatus = Object.keys(objectives).map(
      (objectiveId, index) => {
        const status = Scorm.getObjectiveStatus(index);
        return { objectiveId, status };
      }
    );

    const completed = objectivesStatus
      .filter(({ status }) => status === "completed")
      .map(({ objectiveId }) => objectiveId);
    setCompletedObjectives(completed);
  }, []);

  const updateAssessment = useCallback(
    (correct, response) => {
      setAssessment((prevAssessment) => [...prevAssessment, correct]);
      Scorm.submitMCQ(correct, response);
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      if (nextIndex >= currentQuestions.length) {
        setQuizComplete(true);
      } else {
        Scorm.setSuspendData({
          currentQuestionIndex: nextIndex,
          assessment,
          objectiveId,
          completedObjectives,
        });
        const progress = nextIndex / currentQuestions.length;
        Scorm.setProgress(progress);
      }
    },
    [
      currentQuestionIndex,
      currentQuestions,
      assessment,
      objectiveId,
      completedObjectives,
    ]
  );

  const completeObjective = useCallback(() => {
    console.log("Completing objective:", objectiveId);
    const correctAnswers = assessment.filter(
      (answer) => answer === true
    ).length;
    const totalQuestionsAnswered = currentQuestions.length;
    const scorePercent = (correctAnswers / totalQuestionsAnswered) * 100;
    const scoreScaled = correctAnswers / totalQuestionsAnswered;
    Scorm.setScore(scorePercent, 100, 0, scoreScaled);

    // Mettre à jour l'état local
    setCompletedObjectives((prevCompleted) => [...prevCompleted, objectiveId]);

    // Mettre à jour le LMS
    Scorm.setObjectiveStatus(objectiveId, "completed");

    Scorm.setSuspendData({
      completedObjectives: [...completedObjectives, objectiveId],
    });

    setCurrentQuestionIndex(0);
    setAssessment([]);
    setQuizComplete(false);

    const allObjectivesCompleted =
      completedObjectives.length + 1 === Object.keys(objectives).length;
    if (allObjectivesCompleted) {
      console.log("All objectives completed. Marking course as completed.");
      Scorm.setCompletionStatus("completed"); // Marquer tout le cours comme complété
      Scorm.save();
    }

    navigate("/"); // Retour à la page d'accueil
  }, [
    assessment,
    currentQuestions.length,
    objectiveId,
    completedObjectives,
    navigate,
  ]);

  const progress =
    (completedObjectives.length / Object.keys(objectives).length) * 100;

  if (objectiveId) {
    if (completedObjectives.includes(objectiveId)) {
      return (
        <div className="App">
          <header className="App-header">
            <img
              src={logo}
              className="App-logo"
              alt="logo de l'application"
              tabIndex="0"
              aria-label="logo de l'application"
            />
            <Learner name={learnerName} />
          </header>
          <main>
            <p>Vous avez déjà complété cet objectif.</p>
          </main>
        </div>
      );
    }

    return (
      <div className="App">
        <header className="App-header">
          <img
            src={logo}
            className="App-logo"
            alt="logo de l'application"
            tabIndex="0"
            aria-label="logo de l'application"
          />
          <Learner name={learnerName} />
        </header>
        <main>
          {currentObjective.type === "video" ? (
            <Video
              src={currentObjective.src}
              completeObjective={completeObjective}
            />
          ) : currentObjective.type === "resources" ? (
            <Resources
              content={currentObjective.content}
              completeObjective={completeObjective}
            />
          ) : quizComplete ? (
            <FinalQuiz completeObjective={completeObjective} />
          ) : (
            <Quiz
              currentQuestionIndex={currentQuestionIndex}
              currentQuestions={currentQuestions}
              updateAssessment={updateAssessment}
            />
          )}
        </main>
        <ProgressBar progress={progress} />
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <img
          src={logo}
          className="App-logo"
          alt="logo de l'application"
          tabIndex="0"
          aria-label="logo de l'application"
        />
        <Learner name={learnerName} />
        <h1>Bienvenue sur le cours</h1>
        <ProgressBar progress={progress} />
        <button
          onClick={() => navigate("/?objective=1")}
          disabled={completedObjectives.includes("1")}
        >
          Commencer le premier objectif
        </button>
        <button
          onClick={() => navigate("/?objective=2")}
          disabled={
            !completedObjectives.includes("1") ||
            completedObjectives.includes("2")
          }
        >
          Commencer le second objectif
        </button>
        <button
          onClick={() => navigate("/?objective=3")}
          disabled={
            !completedObjectives.includes("2") ||
            completedObjectives.includes("3")
          }
        >
          Commencer le troisième objectif
        </button>
        <button
          onClick={() => navigate("/?objective=4")}
          disabled={
            !completedObjectives.includes("3") ||
            completedObjectives.includes("4")
          }
        >
          Accéder aux ressources
        </button>
        <button
          onClick={() => navigate("/?objective=5")}
          disabled={
            !completedObjectives.includes("4") ||
            completedObjectives.includes("5")
          }
        >
          Commencer le quiz final
        </button>
      </header>
    </div>
  );
}

export default App;
