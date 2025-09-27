import React, { lazy, Suspense, useMemo } from "react";
// import ForbiddenLayout from "../../components/molecules/errorLayouts/ForbiddenLayout";
// import TaskScreenTour from "./TaskScreenTour";
import {
  capitalize,
  getMobileBottomList,
  isNotEmptyOrNull,
  taskTourData,
  taskTourDataWithoutTasks,
  urlString,
} from "../../utils/common-utils";
import {
  Box,
  Flex,
  HStack,
  Image,
  Text,
  VStack,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
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
  FILTER_OPTIONS,
} from "./TaskScreenHelper";
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
    serverDate,
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
      assignedDate,
    } = extractTaskData(task);

    const customAssessmentSubtopic = customAssessmentList?.find(
      (item) => item._id === id
    );

    const taskselectedname = selectedOption.name;

    return (
      <WrapItem
        key={`taskcard-${title}${id}`}
        sx={TaskScreenStyles()?.cardSuperContainer}
      >
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
            serverDate,
          }}
        />
      </WrapItem>
    );
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
    serverDate,
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
      assignedDate,
    } = extractTaskData(task);

    const customAssessmentSubtopic = customAssessmentList?.find(
      (item) => item._id === id
    );

    const taskselectedname = selectedOption.name;

    return (
      <WrapItem
        key={`taskcard-${title}${id}`}
        sx={TaskScreenStyles()?.cardSuperContainer}
      >
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
            serverDate,
          }}
        />
      </WrapItem>
    );
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
  serverDate,
}) => {
  const { RequestSentModal } = pkg;

  const { mainList, filteredList, customAssessmentList } = currentLists;
  // On mobile, show all loaded tasks; on desktop, slice for pagination
  const displayedTasks = useMemo(
    () =>
      isMobile
        ? mainList
        : mainList?.slice(startTaskIndex, startTaskIndex + cardsToShow),
    [mainList, isMobile, startTaskIndex, cardsToShow]
  );

  // Reusable subject filter renderer
  const renderSubjectFilter = useMemo(() => {
    if (!isNotEmptyOrNull(subjectList)) return null;
    return (
      <Box sx={TaskScreenStyles()?.subjectFilterParent}>
        <SubjectFilterComponent
          subjectList={subjectList}
          currentLists={currentLists}
          selectedSubject={selectedSubject}
          setSelectedSubject={handleSubjectChange}
          setStartTaskIndex={setStartTaskIndex}
        />
      </Box>
    );
  }, [
    subjectList,
    currentLists,
    selectedSubject,
    handleSubjectChange,
    setStartTaskIndex,
  ]);

  const editor = useMemo(() => {
    const mobileBottomList = getMobileBottomList({
      location,
      isUpdatesDisplayed: false,
      wall_images,
    });

    return () => <MobileBottomNavMenu mobileBottomList={mobileBottomList} />;
  }, []);

  return (
    <>
      {showForbiddenLayout && (
        <Suspense fallback={<></>}>
          <ForbiddenLayout isOpen={showForbiddenLayout} />
        </Suspense>
      )}
      {displayProductTour && (
        <Suspense fallback={<></>}>
          <TaskScreenTour
            onStep5={handleStep4}
            taskDataLength={filteredList}
            tourdata={taskTourData || taskTourDataWithoutTasks}
          />
        </Suspense>
      )}
      <Box
        sx={TaskScreenStyles()?.mainContainer}
        style={displayProductTour ? { pointerEvents: "none" } : {}}
      >
        <Box sx={TaskScreenStyles()?.subContainer}>
          <Flex flexDir={"row"} alignItems={"flex-start"}>
            <Box sx={TaskScreenStyles()?.subbContainer}>
              {
                <Box sx={TaskScreenStyles()?.vinImage}>
                  <Image
                    // className={styles["assistant-img-tasks"]}
                    sx={TaskScreenStyles()?.vinImageInternal}
                    alt="Vin"
                    src={AssistantImg}
                  />
                </Box>
              }
              <Box sx={TaskScreenStyles()?.rightContainer}>
                <LearningCreditsContainer
                  userAdditionalDetails={userAdditionalDetails}
                  isTaskScreen={true}
                  isMobile={isMobile}
                  onCreditsRequest={handleCreditsRequest}
                  requestSent={!nudgeObject?.canSend}
                  mode={mode}
                  nudgeObject={nudgeObject}
                  setNudgeObject={setNudgeObject}
                  isNudgeLoading={isNudgeLoading}
                />
                <Box sx={TaskScreenStyles()?.rightTopContainer}>
                  <OptionContainer
                    isMobile={isMobile}
                    userAdditionalDetails={userAdditionalDetails}
                    isTaskScreen={true}
                    upcomingCount={upcomingCount}
                    overdueCount={overdueCount}
                    completedCount={completedCount}
                    selectedOption={selectedOption}
                    handleOptionClick={handleOptionClick}
                  />
                </Box>
                {isMobile ? (
                  isLoading ? (
                    <MobileTaskCardSkeleton isInitialLoad={false} />
                  ) : (
                    displayedTasks?.length > 0 && (
                      <>
                        {renderSubjectFilter}
                        <Wrap
                          id={"cardsData"}
                          sx={TaskScreenStyles()?.taskCardWrapContainer}
                        >
                          {displayedTasks?.map((task, index) => (
                            <MemoizedMobileTaskCard
                              key={`mobile-task-${task._id}`}
                              task={task}
                              index={index}
                              onCardClick={onCardClick}
                              customAssessmentList={customAssessmentList}
                              selectedOption={selectedOption}
                              serverDate={serverDate}
                            />
                          ))}
                        </Wrap>
                        {/* Move infinite scroll skeleton and sentinel outside the main Wrap */}
                        {isFetchingMore && (
                          <Box width="100%" mt="10px">
                            <Wrap
                              sx={TaskScreenStyles()?.taskCardWrapContainer}
                            >
                              {[...Array(4)].map((_, index) => (
                                <WrapItem
                                  key={index}
                                  sx={TaskScreenStyles()?.cardSuperContainer}
                                >
                                  <MobileTaskCardSkeleton
                                    isInitialLoad={false}
                                  />
                                </WrapItem>
                              ))}
                            </Wrap>
                          </Box>
                        )}
                        <div
                          ref={setSentinelRef}
                          style={{ height: 1, width: "100%" }}
                        />
                      </>
                    )
                  )
                ) : isLoading ? (
                  <TaskCardSkeleton count={4} />
                ) : (
                  displayedTasks?.length > 0 && (
                    <Box sx={TaskScreenStyles()?.taskCardContainer}>
                      <HStack sx={TaskScreenStyles()?.taskCardSubContainer}>
                        <Box sx={TaskScreenStyles()?.taskCardSubbContainer}>
                          <Box>
                            <VStack sx={TaskScreenStyles()?.taskCardSection}>
                              {!isMobile && (
                                <Text
                                  sx={
                                    TaskScreenStyles()
                                      ?.optionTitleTaskCardSection
                                  }
                                >
                                  {selectedOption?.name}
                                </Text>
                              )}
                              {renderSubjectFilter}
                              <Wrap
                                id={"cardsData"}
                                sx={TaskScreenStyles()?.taskCardWrapContainer}
                              >
                                {displayedTasks?.map((task, index) => (
                                  <MemoizedTaskCard
                                    key={`desktop-task-${task._id}`}
                                    task={task}
                                    index={index}
                                    onCardClick={onCardClick}
                                    customAssessmentList={customAssessmentList}
                                    selectedOption={selectedOption}
                                    serverDate={serverDate}
                                  />
                                ))}
                              </Wrap>
                            </VStack>
                          </Box>
                          {!isMobile && (
                            <PaginationComponent
                              currentPage={
                                Math.floor(startTaskIndex / cardsToShow) + 1
                              }
                              totalPages={Math.ceil(
                                (subjectTaskCount !== null
                                  ? subjectTaskCount
                                  : totalCount) / cardsToShow
                              )}
                              handleNextTaskCard={handleNextTaskCard}
                              handlePreviousTaskCard={handlePreviousTaskCard}
                              disableNext={
                                endTaskIndex >=
                                  (subjectTaskCount !== null
                                    ? subjectTaskCount
                                    : totalCount) ||
                                (subjectTaskCount !== null
                                  ? subjectTaskCount
                                  : totalCount) <= cardsToShow
                              }
                              disablePrevious={startTaskIndex === 0}
                            />
                          )}
                        </Box>
                      </HStack>
                    </Box>
                  )
                )}

                {/* EMPTY TASK CONTAINER */}
                {displayedTasks?.length === 0 && !isLoading && (
                  <Box
                    sx={TaskScreenStyles()?.emptyTasksMainContainer}
                    // marginBottom={isMobile ? "-30px" : "0px"}
                  >
                    {!isMobile && (
                      <>
                        <Text
                          sx={TaskScreenStyles()?.optionTitleTaskCardSection}
                        >
                          {selectedOption.name}
                        </Text>
                      </>
                    )}
                    {renderSubjectFilter}
                    <Box
                      id="noTasks"
                      sx={TaskScreenStyles()?.emptyTasksContainer}
                    >
                      <img
                        src={accordion_images.noUpdates}
                        width={"200px"}
                        height={"150px"}
                      />
                      <Box sx={TaskScreenStyles()?.emptyTasksContainerTitle}>
                        {EmptyCardsTitle(selectedOption?.value)}
                      </Box>
                      <Box
                        sx={TaskScreenStyles()?.emptyTasksContainerDescription}
                      >
                        {EmptyCardsDescription(selectedOption?.value)}
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* DISPLAY OVERDUE BOX */}
                {!isMobile &&
                  selectedOption?.name === FILTER_OPTIONS?.topPriority?.name &&
                  overdueTaskList?.length > 0 && (
                    <Box sx={TaskScreenStyles()?.taskCardContainer}>
                      <HStack sx={TaskScreenStyles()?.taskCardSubContainer}>
                        <Box sx={TaskScreenStyles()?.taskCardSubbContainer}>
                          <Box>
                            <Box>
                              <VStack sx={TaskScreenStyles()?.taskCardSection}>
                                {!isMobile && (
                                  <Text
                                    sx={
                                      TaskScreenStyles()
                                        ?.optionTitleTaskCardSection
                                    }
                                  >
                                    Overdue
                                  </Text>
                                )}
                                <Wrap
                                  sx={TaskScreenStyles()?.taskCardWrapContainer}
                                >
                                  {overdueTaskList
                                    ?.slice(0, 2)
                                    .map((task, index) => (
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
                                        serverDate={serverDate}
                                      />
                                    ))}
                                </Wrap>
                              </VStack>
                            </Box>
                          </Box>
                          <Box
                            onClick={() => {
                              handleOptionClick({
                                name: "Overdue",
                                value: "missed_opportunity",
                              });
                            }}
                            sx={TaskScreenStyles()?.overdueBottomBox}
                          >
                            <Text sx={TaskScreenStyles()?.overdueBottomBoxText}>
                              See All
                            </Text>
                          </Box>
                        </Box>
                      </HStack>
                    </Box>
                  )}
                {/* DISPLAY COMPLETED BOX */}
                {!isMobile &&
                  selectedOption?.name === FILTER_OPTIONS?.topPriority?.name &&
                  !isLoading && (
                    <CompletedTaskBox
                      handleOptionClick={handleOptionClick}
                      count={completedCount}
                    />
                  )}
              </Box>
            </Box>
          </Flex>
        </Box>

        {/* PLAIN INPUT */}
        {!showForbiddenLayout && isMobile && (
          <Box sx={TaskScreenStyles(isMobile)?.bottomInput}>
            {editor()}
            <Box sx={TaskScreenStyles()?.bottomBox}></Box>
          </Box>
        )}
      </Box>

      {isMobile ? (
        <Suspense fallback={<></>}>
          <MobileWelcomeModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            name={
              isNotEmptyOrNull(userAdditionalDetails?.firstName)
                ? userAdditionalDetails?.firstName
                : ""
            }
          />
        </Suspense>
      ) : (
        <Suspense fallback={<></>}>
          <WelcomeModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
            }}
            name={
              isNotEmptyOrNull(userAdditionalDetails?.firstName)
                ? userAdditionalDetails?.firstName
                : ""
            }
          />
        </Suspense>
      )}
      {isDemoRun && (
        <Suspense fallback={<></>}>
          <DemoOnBoarding
            isOpen={isDemoRun}
            onClose={!isDemoRun}
            handleDemoItemClick={handleDemoItemClick}
            handleCloseDemoClick={() => {
              saveDemoKafkaEvents("Continue Exploring");
              setIsDemoRun(false);
            }}
          />
        </Suspense>
      )}
      <TimeLogsModal isOpen={showTimeLogs} onClose={toggleTimeLogsDrawer} />
      {/* modal will come here */}
      {learningCreditsRequest && (
        <RequestSentModal
          isOpen={learningCreditsRequest}
          onClose={() => setLearningCreditsRequest(false)}
          isMobile={isMobile}
          image={AssistantImg}
        />
      )}
    </>
  );
};

export default TaskScreenView;
