import React, { useMemo } from "react";
import Styles from "./SchoolUpdates.module.css";
import {
  getMobileBottomList,
  isNotEmptyOrNull } from
"../../../utils/common-utils";
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
  updateType } from
"./schoolUpdatesHelper";
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
  showForbiddenLayout = false
}) => {
  const { RequestSentModal } = pkg;

  const editor = useMemo(() => {
    const mobileBottomList = getMobileBottomList({
      location,
      isUpdatesDisplayed: true,
      wall_images
    });
    return () => <MobileBottomNavMenu mobileBottomList={mobileBottomList} data-testid='test-v8-mobilebottomnavmenu-select' />;
  }, []);

  return (
    <>
      <Box className={Styles?.globalContainer} data-testid='test-v8-box'>
        <Box className={Styles?.globalSubContainer} data-testid='test-v8-box'>
          <Flex flexDir={"row"} alignItems={"flex-start"} data-testid='test-v8-flex-box'>
            <Box className={Styles?.globalSubbContainer} data-testid='test-v8-box'>
              {
              <Box className={Styles?.vinImage} data-testid='test-v8-box'>
                  <img
                  className={Styles?.vinImageInternal}
                  alt="Vin"
                  src={AssistantImg} data-testid='test-v8-img-box' />

                </Box>
              }
              <Box className={Styles?.optionRightContainer} data-testid='test-v8-box'>
                <LearningCreditsContainer
                  userAdditionalDetails={userAdditionalDetails}
                  isTaskScreen={false}
                  isMobile={isMobile}
                  mode={mode}
                  requestSent={!nudgeObject?.canSend}
                  onCreditsRequest={handleCreditsRequest}
                  nudgeObject={nudgeObject}
                  setNudgeObject={setNudgeObject}
                  isNudgeLoading={isNudgeLoading} data-testid='test-v8-learningcreditscontainer-box' />

                <Box className={Styles?.optionRightTopContainer} data-testid='test-v8-box'>
                  <OptionContainer
                    isMobile={isMobile}
                    userAdditionalDetails={userAdditionalDetails}
                    isTaskScreen={false}
                    emotionalMessage={emotionalMessage}
                    hasUpdates={isNotEmptyOrNull(data)} data-testid='test-v8-optioncontainer-box' />

                </Box>
                <Box className={Styles.mainContainer} data-testid='test-v8-box'>
                  {isMobile &&
                  <Box paddingTop={"12px"} className={Styles.updatesTitle} data-testid='test-v8-box-updatesTitle'>
                      Updates
                    </Box>
                  }
                  {isNotEmptyOrNull(data) ?
                  data?.map((item, index) => {
                    let dueDateColor = isDueDateColor(item);
                    return (
                      <Box
                        className={Styles.individualContainer}
                        key={index}
                        cursor={"pointer"}
                        onClick={() => onhandleUpdateClick(item)} data-testid='test-v8-index'>

                          <Box className={Styles.leftContainer} data-testid='test-v8-box'>
                            <Box className={Styles.updateIcon} data-testid='test-v8-box'>
                              {/* EVENT TYPE ICON */}
                              {/* When custom assessment is assigned, tooltip will be shown for the icon
                              with the subtopics assgined, else the icon will be shown */}
                              {item?.update_type ===
                            "customAssessmentAssigned" ?
                            <CustomToolTip
                              data={getCustomAssessmentSubtopics(item)}
                              icon={getEventTypeIcon(item)}
                              variant={
                              isMobile ?
                              "UpdatesMobile" :
                              "UpdatesDesktop"
                              } data-testid='test-v8-customtooltip-box' /> :


                            <Image
                              src={getEventTypeIcon(item)}
                              width={isMobile ? "24px" : "42px"}
                              height={isMobile ? "24px" : "42px"} data-testid='test-v8-image-box' />

                            }
                            </Box>
                            <VStack
                            className={Styles.updateContentBox}
                            spacing={"8px"}
                            align={"start"} data-testid='test-v8-vstack-box-updateContentBox'>

                              <Box className={Styles.updateEventType} data-testid='test-v8-box'>
                                {/* UNLOCK ICON */}
                                {!isMobile &&
                              item?.update_type !== "sectionUnlocked" &&
                              <Image
                                src={getUnlockIcon(item)}
                                width={"24px"}
                                height={"24px"} data-testid='test-v8-image-box' />

                              }
                                {/* UPDATE TITLE */}
                                <Box className={Styles.updateTypeText} data-testid='test-v8-box'>
                                  {updateType(item?.update_type)}
                                </Box>
                              </Box>
                              <Box className={Styles.subjectTopic} data-testid='test-v8-box'>
                                {/* SUBJECT NAME : TOPIC NAME */}
                                {getSubjectName(item)}: {getTopicName(item)}
                              </Box>
                              <Box className={Styles.subtopic} data-testid='test-v8-box'>
                                {/* SUBTOPIC NAME */}
                                {getSubtopicName(item)}
                              </Box>
                              {item?.update_type !==
                            "learnSubtopicAssigned" &&
                            <Box
                              className={
                              dueDateColor === "red" ?
                              Styles.dueDate :
                              Styles.completedDate
                              } data-testid='test-v8-box'>

                                  {/* DUE DATE */}
                                  {dueDateColor === "red" ||
                              dueDateColor === "inProgressGrey" ?
                              "Due" :
                              dueDateColor === "sectionGrey" ?
                              "Unlocked On" :
                              "Finished on"}{" "}
                                  {getDueDate(item, serverDate)}
                                </Box>
                            }
                            </VStack>
                          </Box>
                          <Box className={Styles.rightContainer} data-testid='test-v8-box'>
                            {isMobile &&
                          item?.update_type !== "sectionUnlocked" &&
                          // EVENT TYPE ICON
                          <Image
                            src={getUnlockIcon(item)}
                            width={"16px"}
                            height={"16px"} data-testid='test-v8-image-box' />

                          }

                            {/* TASK TYPE ICON */}

                            {item?.update_type !== "sectionUnlocked" &&
                          item?.update_type !==
                          "experientialLearningAssigned" &&
                          <Image
                            src={getUpdatesTaskTypeIcons(item)}
                            width={isMobile ? "20px" : "70px"}
                            height={isMobile ? "20px" : "68px"} data-testid='test-v8-image-box' />

                          }
                            {!isMobile &&
                          <Box className={Styles.taskTypeName} data-testid='test-v8-box'>
                                {/* TASK TYPE */}
                                {getUpdatesTaskType(item)}
                              </Box>
                          }
                          </Box>
                        </Box>);

                  }) :

                  <Box className={Styles.noUpdates} data-testid='test-v8-box'>
                      <Image
                      src={accordion_images.noUpdates}
                      className={Styles.noUpdatesImage} data-testid='test-v8-image-box-noUpdatesImage' />

                      <Box className={Styles.noUpdatesContent} data-testid='test-v8-box'>
                        You don't have any updates now!
                      </Box>
                    </Box>
                  }
                </Box>
              </Box>
            </Box>
          </Flex>
        </Box>
        {/* PLAIN INPUT */}
        {isMobile &&
        <Box sx={TaskScreenStyles(isMobile)?.bottomInput} data-testid='test-v8-box-2'>
            {editor()}
            <Box sx={TaskScreenStyles()?.bottomBox} data-testid='test-v8-box-2'></Box>
          </Box>
        }
      </Box>
      {/* modal will come here */}
      {showRequestModal &&
      <RequestSentModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        isMobile={isMobile}
        image={AssistantImg} data-testid='test-v8-requestsentmodal' />

      }
      {showForbiddenLayout && <ForbiddenLayout isOpen={showForbiddenLayout} data-testid='test-v8-forbiddenlayout' />}
    </>);

};

export default SchoolUpdatesView;