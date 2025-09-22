import React, { useMemo } from "react";
import Styles from "./SchoolUpdates.module.css";
import {
  getMobileBottomList,
  isNotEmptyOrNull,
} from "../../../utils/common-utils";
import CustomToolTip from "../../atoms/chakraHelpers/customToolTip";
import accordion_images from "../../../utils/accordion/accordion_images";
import { Box, Flex, Image, VStack } from "@chakra-ui/react";
import {
  getCustomAssessmentSubtopics,
  getDueDate,
  getEventTypeIcon,
  getSubjectName,
  getSubtopicName,
  getTopicName,
  getUnlockIcon,
  getUpdatesTaskType,
  getUpdatesTaskTypeIcons,
  isDueDateColor,
  updateType,
} from "./schoolUpdatesHelper";
import OptionContainer from "../../../pages/task/OptionContainer";
import AssistantImg from "../../../assets/ai-tutor/assistant.svg";
import PlainInput from "../../../pages/ai-tutor/Editor/PlainInput";
import { TaskScreenStyles } from "../../../pages/task/TaskScreenStyles";
import LearningCreditsContainer from "../../../pages/task/LearningCreditsContainer";
import MobileBottomNavMenu from "../mobileNavigation/MobileNavigation";
import wall_images from "../../../utils/wall/wall-imges";
import pkg from "@inrscr/coschool-ui-components";
import ForbiddenLayout from "../errorLayouts/ForbiddenLayout";

const SchoolUpdatesView = ({
  data,
  onhandleUpdateClick,
  serverDate,
  isMobile,
  userAdditionalDetails,
  emotionalMessage,
  mode,
  showRequestModal,
  setShowRequestModal,
  handleCreditsRequest,
  location,
  nudgeObject = {},
  setNudgeObject,
  isNudgeLoading = false,
  showForbiddenLayout = false,
}) => {
  const { RequestSentModal } = pkg;

  const editor = useMemo(() => {
    const mobileBottomList = getMobileBottomList({
      location,
      isUpdatesDisplayed: true,
      wall_images,
    });
    return () => <MobileBottomNavMenu mobileBottomList={mobileBottomList} />;
  }, []);

  return (
    <>
      <Box className={Styles?.globalContainer}>
        <Box className={Styles?.globalSubContainer}>
          <Flex flexDir={"row"} alignItems={"flex-start"}>
            <Box className={Styles?.globalSubbContainer}>
              {
                <Box className={Styles?.vinImage}>
                  <img
                    className={Styles?.vinImageInternal}
                    alt="Vin"
                    src={AssistantImg}
                  />
                </Box>
              }
              <Box className={Styles?.optionRightContainer}>
                <LearningCreditsContainer
                  userAdditionalDetails={userAdditionalDetails}
                  isTaskScreen={false}
                  isMobile={isMobile}
                  mode={mode}
                  requestSent={!nudgeObject?.canSend}
                  onCreditsRequest={handleCreditsRequest}
                  nudgeObject={nudgeObject}
                  setNudgeObject={setNudgeObject}
                  isNudgeLoading={isNudgeLoading}
                />
                <Box className={Styles?.optionRightTopContainer}>
                  <OptionContainer
                    isMobile={isMobile}
                    userAdditionalDetails={userAdditionalDetails}
                    isTaskScreen={false}
                    emotionalMessage={emotionalMessage}
                    hasUpdates={isNotEmptyOrNull(data)}
                  />
                </Box>
                <Box className={Styles.mainContainer}>
                  {isMobile && (
                    <Box paddingTop={"12px"} className={Styles.updatesTitle}>
                      Updates
                    </Box>
                  )}
                  {isNotEmptyOrNull(data) ? (
                    data?.map((item, index) => {
                      let dueDateColor = isDueDateColor(item);
                      return (
                        <Box
                          className={Styles.individualContainer}
                          key={index}
                          cursor={"pointer"}
                          onClick={() => onhandleUpdateClick(item)}
                        >
                          <Box className={Styles.leftContainer}>
                            <Box className={Styles.updateIcon}>
                              {/* EVENT TYPE ICON */}
                              {/* When custom assessment is assigned, tooltip will be shown for the icon
                   with the subtopics assgined, else the icon will be shown */}
                              {item?.update_type ===
                              "customAssessmentAssigned" ? (
                                <CustomToolTip
                                  data={getCustomAssessmentSubtopics(item)}
                                  icon={getEventTypeIcon(item)}
                                  variant={
                                    isMobile
                                      ? "UpdatesMobile"
                                      : "UpdatesDesktop"
                                  }
                                />
                              ) : (
                                <Image
                                  src={getEventTypeIcon(item)}
                                  width={isMobile ? "24px" : "42px"}
                                  height={isMobile ? "24px" : "42px"}
                                />
                              )}
                            </Box>
                            <VStack
                              className={Styles.updateContentBox}
                              spacing={"8px"}
                              align={"start"}
                            >
                              <Box className={Styles.updateEventType}>
                                {/* UNLOCK ICON */}
                                {!isMobile &&
                                  item?.update_type !== "sectionUnlocked" && (
                                    <Image
                                      src={getUnlockIcon(item)}
                                      width={"24px"}
                                      height={"24px"}
                                    />
                                  )}
                                {/* UPDATE TITLE */}
                                <Box className={Styles.updateTypeText}>
                                  {updateType(item?.update_type)}
                                </Box>
                              </Box>
                              <Box className={Styles.subjectTopic}>
                                {/* SUBJECT NAME : TOPIC NAME */}
                                {getSubjectName(item)}: {getTopicName(item)}
                              </Box>
                              <Box className={Styles.subtopic}>
                                {/* SUBTOPIC NAME */}
                                {getSubtopicName(item)}
                              </Box>
                              {item?.update_type !==
                                "learnSubtopicAssigned" && (
                                <Box
                                  className={
                                    dueDateColor === "red"
                                      ? Styles.dueDate
                                      : Styles.completedDate
                                  }
                                >
                                  {/* DUE DATE */}
                                  {dueDateColor === "red" ||
                                  dueDateColor === "inProgressGrey"
                                    ? "Due"
                                    : dueDateColor === "sectionGrey"
                                    ? "Unlocked On"
                                    : "Finished on"}{" "}
                                  {getDueDate(item, serverDate)}
                                </Box>
                              )}
                            </VStack>
                          </Box>
                          <Box className={Styles.rightContainer}>
                            {isMobile &&
                              item?.update_type !== "sectionUnlocked" && (
                                // EVENT TYPE ICON
                                <Image
                                  src={getUnlockIcon(item)}
                                  width={"16px"}
                                  height={"16px"}
                                />
                              )}

                            {/* TASK TYPE ICON */}

                            {item?.update_type !== "sectionUnlocked" &&
                              item?.update_type !==
                                "experientialLearningAssigned" && (
                                <Image
                                  src={getUpdatesTaskTypeIcons(item)}
                                  width={isMobile ? "20px" : "70px"}
                                  height={isMobile ? "20px" : "68px"}
                                />
                              )}
                            {!isMobile && (
                              <Box className={Styles.taskTypeName}>
                                {/* TASK TYPE */}
                                {getUpdatesTaskType(item)}
                              </Box>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Box className={Styles.noUpdates}>
                      <Image
                        src={accordion_images.noUpdates}
                        className={Styles.noUpdatesImage}
                      />
                      <Box className={Styles.noUpdatesContent}>
                        You don't have any updates now!
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Flex>
        </Box>
        {/* PLAIN INPUT */}
        {isMobile && (
          <Box sx={TaskScreenStyles(isMobile)?.bottomInput}>
            {editor()}
            <Box sx={TaskScreenStyles()?.bottomBox}></Box>
          </Box>
        )}
      </Box>
      {/* modal will come here */}
      {showRequestModal && (
        <RequestSentModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          isMobile={isMobile}
          image={AssistantImg}
        />
      )}
      {showForbiddenLayout && <ForbiddenLayout isOpen={showForbiddenLayout} />}
    </>
  );
};

export default SchoolUpdatesView;
