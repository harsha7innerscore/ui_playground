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
    <div className="modal" data-testid='div-modal-1'>
      <LearnDashBoard
        key={refreshKeyRef.current}
        content={learningStepData?.contents}
        factual_rule_set={learningStepData?.factual_rule_set}
        learningStepData={learningStepData}
        learning_mode={learningStepData?.learning_mode?.toLowerCase()}
        handleButtonClick={handleFactual} data-testid='learndashboard-1' />

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
        }} data-testid='div-1'>

          <div
          style={{
            display: "flex"
          }} data-testid='div-2'>

            <div
            style={{
              marginRight: "20px"
            }} data-testid='div-3'>

              <CustomButton
              label={"Replay the video"}
              image={Summary}
              handleClick={() => {
                setRefreshKey(refreshKeyRef.current + 1);
                setDisplayPopup(false);
              }} data-testid='custombutton-1' />

            </div>
            <CustomButton
            label={"Answer the questions"}
            image={Summary}
            handleClick={() => {
              setIsPlayerOpen(false);
              handleShowBottomSheet(false);
            }} data-testid='custombutton-2' />

          </div>
        </div>
      }
    </div>);

};

export default Player;