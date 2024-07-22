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
  const objectiveId = searchParams.get("step");

  const objectives = {
    chat_quiz_1: {
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
    video_1: {
      type: "video",
      src: "path_to_video_1.mp4",
    },
    game_1: {
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
    resources: {
      type: "resources",
      content: "Additional resources content",
    },
    final_quiz: {
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
    // Vérifie le statut de chaque objectif et met à jour completedObjectives
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
    const correctAnswers = assessment.filter(
      (answer) => answer === true
    ).length;
    const totalQuestionsAnswered = currentQuestions.length;
    const scorePercent = (correctAnswers / totalQuestionsAnswered) * 100;
    const scoreScaled = correctAnswers / totalQuestionsAnswered;
    Scorm.setScore(scorePercent, 100, 0, scoreScaled);

    setCompletedObjectives((prevCompleted) => [...prevCompleted, objectiveId]);
    Scorm.setSuspendData({
      completedObjectives: [...completedObjectives, objectiveId],
    });

    // Marque l'objectif comme "completed"
    const objectiveIndex = Object.keys(objectives).indexOf(objectiveId);
    console.log("Objective index:", objectiveIndex);

    Scorm.setObjectiveStatus(objectiveIndex, "completed");

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
          onClick={() => navigate("/?step=chat_quiz_1")}
          disabled={completedObjectives.includes("chat_quiz_1")}
        >
          Commencer le premier objectif
        </button>
        <button
          onClick={() => navigate("/?step=video_1")}
          disabled={
            !completedObjectives.includes("chat_quiz_1") ||
            completedObjectives.includes("video_1")
          }
        >
          Commencer le second objectif
        </button>
        <button
          onClick={() => navigate("/?step=game_1")}
          disabled={
            !completedObjectives.includes("video_1") ||
            completedObjectives.includes("game_1")
          }
        >
          Commencer le troisième objectif
        </button>
        <button
          onClick={() => navigate("/?step=resources")}
          disabled={
            !completedObjectives.includes("game_1") ||
            completedObjectives.includes("resources")
          }
        >
          Accéder aux ressources
        </button>
        <button
          onClick={() => navigate("/?step=final_quiz")}
          disabled={
            !completedObjectives.includes("resources") ||
            completedObjectives.includes("final_quiz")
          }
        >
          Commencer le quiz final
        </button>
      </header>
    </div>
  );
}

export default App;
