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
    SCORM.set("cmi.interactions." + nextIndex + ".result", correct);
  },

  setSuspendData(data) {
    SCORM.set("cmi.suspend_data", JSON.stringify(data));
  },

  getSuspendData() {
    const data = SCORM.get("cmi.suspend_data");
    return data ? JSON.parse(data) : null;
  },

  finish() {
    console.log("you have finished!");
    SCORM.set("cmi.core.lesson_status", "completed");
    SCORM.save();
  },

  completeAndCloseCourse() {
    this.finish();
    SCORM.set("cmi.core.lesson_status", "completed");
    SCORM.save();
    SCORM.quit();
    window.close(); // Ferme la fenêtre du cours
  },
};

export default Scorm;
