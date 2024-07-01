import React from "react";

function Learner({ name }) {
  const lmsCheck = () => {
    if (name === "null") {
      return "Uh oh! It seems like we couldn't find your real name!";
    }
    return "";
  };

  return (
    <div>
      <p>Hi, {name}!</p>
      <p>{lmsCheck()}</p>
    </div>
  );
}

export default Learner;
