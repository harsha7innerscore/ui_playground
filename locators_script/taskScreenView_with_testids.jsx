import React, { lazy, Suspense, useMemo } from "react";
// import ForbiddenLayout from "../../components/molecules/errorLayouts/ForbiddenLayout";
// import TaskScreenTour from "./TaskScreenTour";
import {
  capitalize,
  getMobileBottomList,
  isNotEmptyOrNull,
  taskTourData,
  taskTourDataWithoutTasks,
  urlString } from
"../../utils/common-utils";
import {
  Box,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
  Wrap,
  WrapItem } from
"@chakra-ui/react";
import styles from "../../components/molecules/ai-tutor/Assistant/assistant.module.css";
import AssistantImg from "../../assets/ai-tutor/assistant.svg";
import OptionContainer from "./OptionContainer";
import MobileTaskCardSkeleton from "../../components/molecules/SkeletonViews/MobileTaskScreenSkeleton";
import TaskCardSkeleton from "../../components/molecules/SkeletonViews/TaskScreenSkeleton";
import SubjectFilterComponent from "./SubjectFilterComponent";
import { TaskScreenStyles } from "./TaskScreenStyles";
import MobileTaskCard from "../../components/molecules/task/MobileTaskCard";
import TaskCard from "../../components/molecules/task/TaskCard";
import { useNavigate } from "@remix-run/react";
import {
  EmptyCardsDescription,
  EmptyCardsTitle,
  extractTaskData,
  FILTER_OPTIONS } from
"./TaskScreenHelper";
import PaginationComponent from "./PaginationComponent";
import accordion_images from "../../utils/accordion/accordion_images";
import CompletedTaskBox from "./CompletedTaskBox";
import TimeLogsModal from "../timeLogs/TimeLogs";
// import MobileWelcomeModal from "../../components/molecules/modal/MobileWelcomeModal";
// import WelcomeModal from "../../components/molecules/modal/WelcomeModal";
// import DemoOnBoarding from "../demo/DemoOnBoarding";
// import PlainInput from "../ai-tutor/Editor/PlainInput";
const ForbiddenLayout = lazy(() =>
import("../../components/molecules/errorLayouts/ForbiddenLayout")
);
const TaskScreenTour = lazy(() => import("./TaskScreenTour"));
const PlainInput = lazy(() => import("../ai-tutor/Editor/PlainInput"));
const MobileWelcomeModal = lazy(() =>
import("../../components/molecules/modal/MobileWelcomeModal")
);
const WelcomeModal = lazy(() =>
import("../../components/molecules/modal/WelcomeModal")
);
const DemoOnBoarding = lazy(() => import("../demo/DemoOnBoarding"));
import LearningCreditsContainer from "./LearningCreditsContainer";
import MobileBottomNavMenu from "../../components/molecules/mobileNavigation/MobileNavigation";
import wall_images from "../../utils/wall/wall-imges";
import pkg from "@inrscr/coschool-ui-components";

// Add this to app/pages/task/TaskScreenView.jsx, before the main component
const MemoizedTaskCard = React.memo(
  ({
    task,
    index,
    onCardClick,
    customAssessmentList,
    selectedOption,
    serverDate
  }) => {
    const {
      id,
      title,
      subjectName,
      finishedDate,
      category,
      dueDate,
      completedOn,
      subTopicName,
      topicName,
      reminder,
      isChapterEndAssessment,
      levelUpNudge,
      levelUpReference,
      autoLevelUp,
      proficientLevel,
      appreciation,
      experientialLearning,
      isCustomAssessment,
      assignedDate
    } = extractTaskData(task);

    const customAssessmentSubtopic = customAssessmentList?.find(
      (item) => item._id === id
    );

    const taskselectedname = selectedOption.name;

    return (
      <WrapItem
        key={`taskcard-${title}${id}`}
        sx={TaskScreenStyles()?.cardSuperContainer} data-testid='task-screen-view-wrapitem'>

        <TaskCard
          id={`taskcard-${taskselectedname}-${index}`}
          onClick={() => onCardClick(task)}
          cardData={{
            id,
            i: index,
            taskselectedname,
            title,
            finishedDate,
            subjectName,
            category,
            completedOn,
            dueDate,
            subTopicName,
            topicName,
            reminder,
            levelUpNudge,
            appreciation,
            isChapterEndAssessment,
            proficientLevel,
            experientialLearning,
            levelUpReference,
            autoLevelUp,
            isCustomAssessment,
            selectedOption,
            ...(customAssessmentSubtopic ? { customAssessmentSubtopic } : {}),
            assignedDate,
            serverDate
          }} data-testid='task-screen-view-taskcard-wrapitem' />

      </WrapItem>);

  }
);

// Similar component for mobile
const MemoizedMobileTaskCard = React.memo(
  ({
    task,
    index,
    onCardClick,
    customAssessmentList,
    selectedOption,
    serverDate
  }) => {
    const {
      id,
      title,
      subjectName,
      finishedDate,
      category,
      dueDate,
      completedOn,
      subTopicName,
      topicName,
      reminder,
      isChapterEndAssessment,
      levelUpNudge,
      levelUpReference,
      autoLevelUp,
      proficientLevel,
      appreciation,
      experientialLearning,
      isCustomAssessment,
      assignedDate
    } = extractTaskData(task);

    const customAssessmentSubtopic = customAssessmentList?.find(
      (item) => item._id === id
    );

    const taskselectedname = selectedOption.name;

    return (
      <WrapItem
        key={`taskcard-${title}${id}`}
        sx={TaskScreenStyles()?.cardSuperContainer} data-testid='task-screen-view-wrapitem-2'>

        <MobileTaskCard
          onClick={() => onCardClick(task)}
          cardData={{
            id,
            i: index,
            taskselectedname,
            title,
            finishedDate,
            subjectName,
            category,
            completedOn,
            dueDate,
            subTopicName,
            topicName,
            reminder,
            levelUpNudge,
            appreciation,
            isChapterEndAssessment,
            proficientLevel,
            experientialLearning,
            levelUpReference,
            autoLevelUp,
            isCustomAssessment,
            selectedOption,
            ...(customAssessmentSubtopic ? { customAssessmentSubtopic } : {}),
            assignedDate,
            serverDate
          }} data-testid='task-screen-view-mobiletaskcard-wrapitem' />

      </WrapItem>);

  }
);

const TaskScreenView = ({
  showForbiddenLayout,
  displayProductTour,
  handleStep4,
  isMenuOpen,
  isDemoRun,
  upcomingCount,
  overdueCount,
  completedCount,
  subjectList,
  selectedOption,
  selectedSubject,
  isMobile,
  userAdditionalDetails,
  handleOptionClick,
  isLoading,
  setSelectedSubject,
  currentLists,
  setStartTaskIndex,
  onCardClick,
  startTaskIndex,
  handleNextTaskCard,
  handlePreviousTaskCard,
  endTaskIndex,
  totalCount,
  cardsToShow,
  overdueTaskList,
  overdueCustomAssessmentList,
  isModalOpen,
  setIsModalOpen,
  handleDemoItemClick,
  saveDemoKafkaEvents,
  setIsDemoRun,
  subjectTaskCount,
  handleSubjectChange,
  handleMobileInfiniteScroll,
  isFetchingMore,
  setSentinelRef,
  showTimeLogs,
  toggleTimeLogsDrawer,
  mode,
  learningCreditsRequest,
  setLearningCreditsRequest,
  handleCreditsRequest,
  location,
  nudgeObject = {},
  setNudgeObject = () => {},
  isNudgeLoading = false,
  serverDate
}) => {
  const { RequestSentModal } = pkg;

  const { mainList, filteredList, customAssessmentList } = currentLists;
  // On mobile, show all loaded tasks; on desktop, slice for pagination
  const displayedTasks = useMemo(
    () =>
    isMobile ?
    mainList :
    mainList?.slice(startTaskIndex, startTaskIndex + cardsToShow),
    [mainList, isMobile, startTaskIndex, cardsToShow]
  );

  // Reusable subject filter renderer
  const renderSubjectFilter = useMemo(() => {
    if (!isNotEmptyOrNull(subjectList)) return null;
    return (
      <Box sx={TaskScreenStyles()?.subjectFilterParent} data-testid='task-screen-view-box'>
        <SubjectFilterComponent
          subjectList={subjectList}
          currentLists={currentLists}
          selectedSubject={selectedSubject}
          setSelectedSubject={handleSubjectChange}
          setStartTaskIndex={setStartTaskIndex} data-testid='task-screen-view-subjectfiltercomponent-box' />

      </Box>);

  }, [
  subjectList,
  currentLists,
  selectedSubject,
  handleSubjectChange,
  setStartTaskIndex]
  );

  const editor = useMemo(() => {
    const mobileBottomList = getMobileBottomList({
      location,
      isUpdatesDisplayed: false,
      wall_images
    });

    return () => <MobileBottomNavMenu mobileBottomList={mobileBottomList} data-testid='task-screen-view-mobilebottomnavmenu' />;
  }, []);

  return (
    <>
      {showForbiddenLayout &&
      <Suspense fallback={<></>} data-testid='task-screen-view-suspense'>
          <ForbiddenLayout isOpen={showForbiddenLayout} data-testid='task-screen-view-forbiddenlayout-suspense' />
        </Suspense>
      }
      {displayProductTour &&
      <Suspense fallback={<></>} data-testid='task-screen-view-suspense-2'>
          <TaskScreenTour
          onStep5={handleStep4}
          taskDataLength={filteredList}
          tourdata={taskTourData || taskTourDataWithoutTasks} data-testid='task-screen-view-taskscreentour-suspense' />

        </Suspense>
      }
      <Box
        sx={TaskScreenStyles()?.mainContainer}
        style={displayProductTour ? { pointerEvents: "none" } : {}} data-testid='task-screen-view-box-2'>

        <Box sx={TaskScreenStyles()?.subContainer} data-testid='task-screen-view-box-3'>
          <Flex flexDir={"row"} alignItems={"flex-start"} data-testid='task-screen-view-flex-box'>
            <Box sx={TaskScreenStyles()?.subbContainer} data-testid='task-screen-view-box-flex'>
              {
              <Box sx={TaskScreenStyles()?.vinImage} data-testid='task-screen-view-box-4'>
                  <Image
                // className={styles["assistant-img-tasks"]}
                sx={TaskScreenStyles()?.vinImageInternal}
                alt="Vin"
                src={AssistantImg} data-testid='task-screen-view-image-AssistantImg' />

                </Box>
              }
              <Box sx={TaskScreenStyles()?.rightContainer} data-testid='task-screen-view-box-5'>
                <LearningCreditsContainer
                  userAdditionalDetails={userAdditionalDetails}
                  isTaskScreen={true}
                  isMobile={isMobile}
                  onCreditsRequest={handleCreditsRequest}
                  requestSent={!nudgeObject?.canSend}
                  mode={mode}
                  nudgeObject={nudgeObject}
                  setNudgeObject={setNudgeObject}
                  isNudgeLoading={isNudgeLoading} data-testid='task-screen-view-learningcreditscontainer-box' />

                <Box sx={TaskScreenStyles()?.rightTopContainer} data-testid='task-screen-view-box-6'>
                  <OptionContainer
                    isMobile={isMobile}
                    userAdditionalDetails={userAdditionalDetails}
                    isTaskScreen={true}
                    upcomingCount={upcomingCount}
                    overdueCount={overdueCount}
                    completedCount={completedCount}
                    selectedOption={selectedOption}
                    handleOptionClick={handleOptionClick} data-testid='task-screen-view-optioncontainer-box' />

                </Box>
                {isMobile ?
                isLoading ?
                <MobileTaskCardSkeleton isInitialLoad={false} data-testid='task-screen-view-mobiletaskcardskeleton-box' /> :

                displayedTasks?.length > 0 &&
                <>
                        {renderSubjectFilter}
                        <Wrap
                    id={"cardsData"}
                    sx={TaskScreenStyles()?.taskCardWrapContainer} data-testid='task-screen-view-wrap-cardsdata'>

                          {displayedTasks?.map((task, index) =>
                    <MemoizedMobileTaskCard
                      key={`mobile-task-${task._id}`}
                      task={task}
                      index={index}
                      onCardClick={onCardClick}
                      customAssessmentList={customAssessmentList}
                      selectedOption={selectedOption}
                      serverDate={serverDate} data-testid='task-screen-view-memoizedmobiletaskcard-wrap' />

                    )}
                        </Wrap>
                        {/* Move infinite scroll skeleton and sentinel outside the main Wrap */}
                        {isFetchingMore &&
                  <Box width="100%" mt="10px" data-testid='task-screen-view-box-7'>
                            <Wrap
                      sx={TaskScreenStyles()?.taskCardWrapContainer} data-testid='task-screen-view-wrap-box'>

                              {[...Array(4)].map((_, index) =>
                      <WrapItem
                        key={index}
                        sx={TaskScreenStyles()?.cardSuperContainer} data-testid='task-screen-view-wrapitem-wrap'>

                                  <MobileTaskCardSkeleton
                          isInitialLoad={false} data-testid='task-screen-view-mobiletaskcardskeleton-wrapitem' />

                                </WrapItem>
                      )}
                            </Wrap>
                          </Box>
                  }
                        <div
                    ref={setSentinelRef}
                    style={{ height: 1, width: "100%" }} data-testid='task-screen-view-div-box' />

                      </> :


                isLoading ?
                <TaskCardSkeleton count={4} data-testid='task-screen-view-taskcardskeleton-box' /> :

                displayedTasks?.length > 0 &&
                <Box sx={TaskScreenStyles()?.taskCardContainer} data-testid='task-screen-view-box-8'>
                      <HStack sx={TaskScreenStyles()?.taskCardSubContainer} data-testid='task-screen-view-hstack-box'>
                        <Box sx={TaskScreenStyles()?.taskCardSubbContainer} data-testid='task-screen-view-box-hstack'>
                          <Box data-testid='task-screen-view-box-9'>
                            <VStack sx={TaskScreenStyles()?.taskCardSection} data-testid='task-screen-view-vstack-box'>
                              {!isMobile &&
                          <Text
                            sx={
                            TaskScreenStyles()?.
                            optionTitleTaskCardSection
                            } data-testid='task-screen-view-text-vstack'>

                                  {selectedOption?.name}
                                </Text>
                          }
                              {renderSubjectFilter}
                              <Wrap
                            id={"cardsData"}
                            sx={TaskScreenStyles()?.taskCardWrapContainer} data-testid='task-screen-view-wrap-cardsdata-2'>

                                {displayedTasks?.map((task, index) =>
                            <MemoizedTaskCard
                              key={`desktop-task-${task._id}`}
                              task={task}
                              index={index}
                              onCardClick={onCardClick}
                              customAssessmentList={customAssessmentList}
                              selectedOption={selectedOption}
                              serverDate={serverDate} data-testid='task-screen-view-memoizedtaskcard-wrap' />

                            )}
                              </Wrap>
                            </VStack>
                          </Box>
                          {!isMobile &&
                      <PaginationComponent
                        currentPage={
                        Math.floor(startTaskIndex / cardsToShow) + 1
                        }
                        totalPages={Math.ceil(
                          (subjectTaskCount !== null ?
                          subjectTaskCount :
                          totalCount) / cardsToShow
                        )}
                        handleNextTaskCard={handleNextTaskCard}
                        handlePreviousTaskCard={handlePreviousTaskCard}
                        disableNext={
                        endTaskIndex >= (
                        subjectTaskCount !== null ?
                        subjectTaskCount :
                        totalCount) ||
                        (subjectTaskCount !== null ?
                        subjectTaskCount :
                        totalCount) <= cardsToShow
                        }
                        disablePrevious={startTaskIndex === 0} data-testid='task-screen-view-paginationcomponent-box' />

                      }
                        </Box>
                      </HStack>
                    </Box>

                }

                {/* EMPTY TASK CONTAINER */}
                {displayedTasks?.length === 0 && !isLoading &&
                <Box
                  sx={TaskScreenStyles()?.emptyTasksMainContainer}
                  // marginBottom={isMobile ? "-30px" : "0px"}
                  data-testid='task-screen-view-box-10'>
                    {!isMobile &&
                  <>
                        <Text
                      sx={TaskScreenStyles()?.optionTitleTaskCardSection} data-testid='task-screen-view-text-box'>

                          {selectedOption.name}
                        </Text>
                      </>
                  }
                    {renderSubjectFilter}
                    <Box
                    id="noTasks"
                    sx={TaskScreenStyles()?.emptyTasksContainer} data-testid='task-screen-view-box-notasks'>

                      <img
                      src={accordion_images.noUpdates}
                      width={"200px"}
                      height={"150px"} data-testid='task-screen-view-img-noUpdates' />

                      <Box sx={TaskScreenStyles()?.emptyTasksContainerTitle} data-testid='task-screen-view-box-11'>
                        {EmptyCardsTitle(selectedOption?.value)}
                      </Box>
                      <Box
                      sx={TaskScreenStyles()?.emptyTasksContainerDescription} data-testid='task-screen-view-box-12'>

                        {EmptyCardsDescription(selectedOption?.value)}
                      </Box>
                    </Box>
                  </Box>
                }

                {/* DISPLAY OVERDUE BOX */}
                {!isMobile &&
                selectedOption?.name === FILTER_OPTIONS?.topPriority?.name &&
                overdueTaskList?.length > 0 &&
                <Box sx={TaskScreenStyles()?.taskCardContainer} data-testid='task-screen-view-box-13'>
                      <HStack sx={TaskScreenStyles()?.taskCardSubContainer} data-testid='task-screen-view-hstack-box-2'>
                        <Box sx={TaskScreenStyles()?.taskCardSubbContainer} data-testid='task-screen-view-box-hstack-2'>
                          <Box data-testid='task-screen-view-box-14'>
                            <Box data-testid='task-screen-view-box-15'>
                              <VStack sx={TaskScreenStyles()?.taskCardSection} data-testid='task-screen-view-vstack-box-2'>
                                {!isMobile &&
                            <Text
                              sx={
                              TaskScreenStyles()?.
                              optionTitleTaskCardSection
                              } data-testid='task-screen-view-text-overdue'>

                                    Overdue
                                  </Text>
                            }
                                <Wrap
                              sx={TaskScreenStyles()?.taskCardWrapContainer} data-testid='task-screen-view-wrap-vstack'>

                                  {overdueTaskList?.
                              slice(0, 2).
                              map((task, index) =>
                              <MemoizedTaskCard
                                key={`desktop-task-${task._id}`}
                                task={task}
                                index={index}
                                onCardClick={onCardClick}
                                customAssessmentList={
                                customAssessmentList
                                }
                                selectedOption={
                                FILTER_OPTIONS?.missedOpportunity
                                }
                                serverDate={serverDate} data-testid='task-screen-view-memoizedtaskcard-wrap-2' />

                              )}
                                </Wrap>
                              </VStack>
                            </Box>
                          </Box>
                          <Box
                        onClick={() => {
                          handleOptionClick({
                            name: "Overdue",
                            value: "missed_opportunity"
                          });
                        }}
                        sx={TaskScreenStyles()?.overdueBottomBox} data-testid='task-screen-view-box-16'>

                            <Text sx={TaskScreenStyles()?.overdueBottomBoxText} data-testid='task-screen-view-text-see-all'>
                              See All
                            </Text>
                          </Box>
                        </Box>
                      </HStack>
                    </Box>
                }
                {/* DISPLAY COMPLETED BOX */}
                {!isMobile &&
                selectedOption?.name === FILTER_OPTIONS?.topPriority?.name &&
                !isLoading &&
                <CompletedTaskBox
                  handleOptionClick={handleOptionClick}
                  count={completedCount} data-testid='task-screen-view-completedtaskbox-box' />

                }
              </Box>
            </Box>
          </Flex>
        </Box>

        {/* PLAIN INPUT */}
        {!showForbiddenLayout && isMobile &&
        <Box sx={TaskScreenStyles(isMobile)?.bottomInput} data-testid='task-screen-view-box-17'>
            {editor()}
            <Box sx={TaskScreenStyles()?.bottomBox} data-testid='task-screen-view-box-18'></Box>
          </Box>
        }
      </Box>

      {isMobile ?
      <Suspense fallback={<></>} data-testid='task-screen-view-suspense-3'>
          <MobileWelcomeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          name={
          isNotEmptyOrNull(userAdditionalDetails?.firstName) ?
          userAdditionalDetails?.firstName :
          ""
          } data-testid='task-screen-view-mobilewelcomemodal-suspense' />

        </Suspense> :

      <Suspense fallback={<></>} data-testid='task-screen-view-suspense-4'>
          <WelcomeModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          name={
          isNotEmptyOrNull(userAdditionalDetails?.firstName) ?
          userAdditionalDetails?.firstName :
          ""
          } data-testid='task-screen-view-welcomemodal-suspense' />

        </Suspense>
      }
      {isDemoRun &&
      <Suspense fallback={<></>} data-testid='task-screen-view-suspense-5'>
          <DemoOnBoarding
          isOpen={isDemoRun}
          onClose={!isDemoRun}
          handleDemoItemClick={handleDemoItemClick}
          handleCloseDemoClick={() => {
            saveDemoKafkaEvents("Continue Exploring");
            setIsDemoRun(false);
          }} data-testid='task-screen-view-demoonboarding-suspense' />

        </Suspense>
      }
      <TimeLogsModal isOpen={showTimeLogs} onClose={toggleTimeLogsDrawer} data-testid='task-screen-view-timelogsmodal' />
      {/* modal will come here */}
      {learningCreditsRequest &&
      <RequestSentModal
        isOpen={learningCreditsRequest}
        onClose={() => setLearningCreditsRequest(false)}
        isMobile={isMobile}
        image={AssistantImg} data-testid='task-screen-view-requestsentmodal' />

      }
    </>);

};

export default TaskScreenView;