import React from "react";
import "./Player.css";
import LearnDashBoard from "../factual/LearnDashboard";
import { useTutor } from "../../../context/AiTutorContext";
import useStateRef from "react-usestateref";
import CustomButton from "../../atoms/CustomButton/CustomButton";
import Summary from "../../../assets/ai-tutor/summary.svg";
import { usePractice } from "../../../context/PracticeContext";

const Player = ({}) => {
  const { setIsPlayerOpen } = useTutor();
  const [nextQuest, setNextQuestion, nextQuestRef] = useStateRef();
  const [displayPopUp, setDisplayPopup, displayPopUpRef] = useStateRef(false);
  const { handleShowBottomSheet, learningStepData } = usePractice();
  const [refreshKey, setRefreshKey, refreshKeyRef] = useStateRef(1);
  const handleFactual = () => {
    console.log("Hello");

    setDisplayPopup(true);
  };

  return (
    <div className="modal" data-testid='html-elements-div-modal'>
      <LearnDashBoard
        key={refreshKeyRef.current}
        content={learningStepData?.contents}
        factual_rule_set={learningStepData?.factual_rule_set}
        learningStepData={learningStepData}
        learning_mode={learningStepData?.learning_mode?.toLowerCase()}
        handleButtonClick={handleFactual} data-testid='html-elements-current' />

      {displayPopUpRef.current &&
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.8)", // Transparent black color
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }} data-testid='html-elements-div'>

          <div
          style={{
            display: "flex"
          }} data-testid='html-elements-div'>

            <div
            style={{
              marginRight: "20px"
            }} data-testid='html-elements-div'>

              <CustomButton
              label={"Replay the video"}
              image={Summary}
              handleClick={() => {
                setRefreshKey(refreshKeyRef.current + 1);
                setDisplayPopup(false);
              }} data-testid='html-elements-custombutton-div-button' />

            </div>
            <CustomButton
            label={"Answer the questions"}
            image={Summary}
            handleClick={() => {
              setIsPlayerOpen(false);
              handleShowBottomSheet(false);
            }} data-testid='html-elements-custombutton-div-button' />

          </div>
        </div>
      }
    </div>);

};

export default Player;