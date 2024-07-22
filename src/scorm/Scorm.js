import { SCORM } from "pipwerks-scorm-api-wrapper";

let Scorm = {
  init() {
    SCORM.init();
  },

  getLearnerName() {
    return SCORM.get("cmi.core.student_name");
  },

  submitMCQ(correct, response) {
    let nextIndex = SCORM.get("cmi.interactions._count", true);
    SCORM.set("cmi.interactions." + nextIndex + ".id", "round_" + nextIndex);
    SCORM.set("cmi.interactions." + nextIndex + ".type", "choice");
    SCORM.set("cmi.interactions." + nextIndex + ".student_response", response);
    SCORM.set(
      "cmi.interactions." + nextIndex + ".result",
      correct ? "correct" : "incorrect"
    );
  },

  save() {
    SCORM.save();
  },

  setScormData(key, value) {
    SCORM.set(key, value);
    SCORM.save();
  },

  setSuspendData(data) {
    this.setScormData("cmi.suspend_data", JSON.stringify(data));
  },

  getSuspendData() {
    const data = SCORM.get("cmi.suspend_data");
    return data ? JSON.parse(data) : null;
  },

  setProgress(progress) {
    this.setScormData("cmi.progress_measure", progress);
  },

  setScore(score, maxScore = 100, minScore = 0) {
    this.setScormData("cmi.core.score.raw", score);
    this.setScormData("cmi.core.score.max", maxScore);
    this.setScormData("cmi.core.score.min", minScore);
  },

  //   setScore(correctAnswers, totalQuestions) {
  //     this.setScormData('cmi.core.score.raw', (correctAnswers / totalQuestions) * 100); // Convertir en pourcentage pour SCORM
  // }, // si on veut afficher le score sous forme "x/y"

  setCompletionStatus(status) {
    this.setScormData("cmi.core.lesson_status", status);
  },

  setSuccessStatus(status) {
    this.setScormData("cmi.core.lesson_status", status);
  },

  completeAndCloseCourse() {
    this.setScormData("cmi.core.lesson_status", "completed");
    SCORM.save();
    SCORM.quit();
    window.close(); // Ferme la fenêtre du cours
  },

  setObjectiveStatus(objectiveId, status) {
    SCORM.set(`cmi.objectives.${objectiveId}.status`, status);
  },

  getObjectiveStatus(objectiveId) {
    return SCORM.get(`cmi.objectives.${objectiveId}.status`);
  },
};

export default Scorm;
