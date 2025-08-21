import React, { useState } from "react";
import GoalSelector from "./GeneralGoalCard"; // general goals
import GoalCard from "./ExactGoalCard";       // exact goals
import "./GoalSetting.css";

const GoalSetting = () => {
  const [selectedGoal, setSelectedGoal] = useState("general"); // 'general' or 'exact'

  return (
    <div className="set-goal-page-container">
      {/* SET GOAL Header */}
      <div className="set-goal-header">
        <button className="set-goal-main-btn">SET GOAL</button>
      </div>

      {/* Toggle Buttons */}
      <div className="toggle-btn-group">
        <div className="toggle-btn-wrapper">
          <button
            onClick={() => setSelectedGoal("general")}
            className={`toggle-btn ${
              selectedGoal === "general" ? "active" : ""
            }`}
          >
            General goal
          </button>
          <button
            onClick={() => setSelectedGoal("exact")}
            className={`toggle-btn ${
              selectedGoal === "exact" ? "active" : ""
            }`}
          >
            Exact goal
          </button>
        </div>
      </div>

      {/* Choose Label */}
      <div className="choose-label">Choose</div>

      {/* Card Section */}
      <div className="goal-card-section">
        {selectedGoal === "general" ? <GoalSelector /> : <GoalCard />}
      </div>
    </div>
  );
};

export default GoalSetting;
