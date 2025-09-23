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
    return () => <MobileBottomNavMenu mobileBottomList={mobileBottomList} data-testid='mobilebottomnavmenu' />;
  }, []);

  return (
    <>
      <Box className={Styles?.globalContainer} data-testid='box'>
        <Box className={Styles?.globalSubContainer} data-testid='box-2'>
          <Flex flexDir={"row"} alignItems={"flex-start"} data-testid='flex'>
            <Box className={Styles?.globalSubbContainer} data-testid='box-3'>
              {
              <Box className={Styles?.vinImage} data-testid='box-4'>
                  <img
                  className={Styles?.vinImageInternal}
                  alt="Vin"
                  src={AssistantImg} data-testid='img-AssistantImg' />

                </Box>
              }
              <Box className={Styles?.optionRightContainer} data-testid='box-5'>
                <LearningCreditsContainer
                  userAdditionalDetails={userAdditionalDetails}
                  isTaskScreen={false}
                  isMobile={isMobile}
                  mode={mode}
                  requestSent={!nudgeObject?.canSend}
                  onCreditsRequest={handleCreditsRequest}
                  nudgeObject={nudgeObject}
                  setNudgeObject={setNudgeObject}
                  isNudgeLoading={isNudgeLoading} data-testid='learningcreditscontainer' />

                <Box className={Styles?.optionRightTopContainer} data-testid='box-6'>
                  <OptionContainer
                    isMobile={isMobile}
                    userAdditionalDetails={userAdditionalDetails}
                    isTaskScreen={false}
                    emotionalMessage={emotionalMessage}
                    hasUpdates={isNotEmptyOrNull(data)} data-testid='optioncontainer' />

                </Box>
                <Box className={Styles.mainContainer} data-testid='box-mainContainer'>
                  {isMobile &&
                  <Box paddingTop={"12px"} className={Styles.updatesTitle} data-testid='box-updatesTitle'>
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
                        onClick={() => onhandleUpdateClick(item)} data-testid='box-individualContainer'>

                          <Box className={Styles.leftContainer} data-testid='box-leftContainer'>
                            <Box className={Styles.updateIcon} data-testid='box-updateIcon'>
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
                              } data-testid='customtooltip' /> :


                            <Image
                              src={getEventTypeIcon(item)}
                              width={isMobile ? "24px" : "42px"}
                              height={isMobile ? "24px" : "42px"} data-testid='img' />

                            }
                            </Box>
                            <VStack
                            className={Styles.updateContentBox}
                            spacing={"8px"}
                            align={"start"} data-testid='vstack-updateContentBox'>

                              <Box className={Styles.updateEventType} data-testid='box-updateEventType'>
                                {/* UNLOCK ICON */}
                                {!isMobile &&
                              item?.update_type !== "sectionUnlocked" &&
                              <Image
                                src={getUnlockIcon(item)}
                                width={"24px"}
                                height={"24px"} data-testid='img-2' />

                              }
                                {/* UPDATE TITLE */}
                                <Box className={Styles.updateTypeText} data-testid='box-updateTypeText'>
                                  {updateType(item?.update_type)}
                                </Box>
                              </Box>
                              <Box className={Styles.subjectTopic} data-testid='box-subjectTopic'>
                                {/* SUBJECT NAME : TOPIC NAME */}
                                {getSubjectName(item)}: {getTopicName(item)}
                              </Box>
                              <Box className={Styles.subtopic} data-testid='box-subtopic'>
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
                              } data-testid='box-7'>

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
                          <Box className={Styles.rightContainer} data-testid='box-rightContainer'>
                            {isMobile &&
                          item?.update_type !== "sectionUnlocked" &&
                          // EVENT TYPE ICON
                          <Image
                            src={getUnlockIcon(item)}
                            width={"16px"}
                            height={"16px"} data-testid='img-3' />

                          }

                            {/* TASK TYPE ICON */}

                            {item?.update_type !== "sectionUnlocked" &&
                          item?.update_type !==
                          "experientialLearningAssigned" &&
                          <Image
                            src={getUpdatesTaskTypeIcons(item)}
                            width={isMobile ? "20px" : "70px"}
                            height={isMobile ? "20px" : "68px"} data-testid='img-4' />

                          }
                            {!isMobile &&
                          <Box className={Styles.taskTypeName} data-testid='box-taskTypeName'>
                                {/* TASK TYPE */}
                                {getUpdatesTaskType(item)}
                              </Box>
                          }
                          </Box>
                        </Box>);

                  }) :

                  <Box className={Styles.noUpdates} data-testid='box-noUpdates'>
                      <Image
                      src={accordion_images.noUpdates}
                      className={Styles.noUpdatesImage} data-testid='image-noUpdatesImage' />

                      <Box className={Styles.noUpdatesContent} data-testid='box-noUpdatesContent'>
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
        <Box sx={TaskScreenStyles(isMobile)?.bottomInput} data-testid='box-8'>
            {editor()}
            <Box sx={TaskScreenStyles()?.bottomBox} data-testid='box-9'></Box>
          </Box>
        }
      </Box>
      {/* modal will come here */}
      {showRequestModal &&
      <RequestSentModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        isMobile={isMobile}
        image={AssistantImg} data-testid='requestsentmodal' />

      }
      {showForbiddenLayout && <ForbiddenLayout isOpen={showForbiddenLayout} data-testid='forbiddenlayout' />}
    </>);

};

export default SchoolUpdatesView;