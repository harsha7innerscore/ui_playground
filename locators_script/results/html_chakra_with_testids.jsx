import React from "react";
import styles from "./assistant.module.css";
import { renderContent } from "../../../../utils/TutorConstants";
import { useRoot } from "../../../../context/RootContext";
import { useLocation } from "@remix-run/react";
import { LuMoveUpRight } from "react-icons/lu";
import { Divider, HStack, Text } from "@chakra-ui/react";

export default function UserText({
  text,
  isClassifier,
  isBold,
  descImageList,
  onPreview
}) {
  const { selectedIndex, playgroundMode } = useRoot();
  const location = useLocation();
  let isPracticeScreen = location?.pathname.includes("/practice");
  let isDoubtScreen =
  location?.pathname.includes("/doubt") || playgroundMode === "Doubt";
  return (
    <div data-testid='chakra-v8-container'>
      <div
        className={styles.container}
        style={{
          marginTop: !isClassifier || selectedIndex === 2 ? "0" : "40px"
        }} data-testid='chakra-v8-div-container'>

        <div
          className={
          isBold ?
          styles["user-text-bold"] :
          isPracticeScreen ?
          styles["user-text-practice"] :
          isDoubtScreen ?
          styles["user-text-doubt"] :
          styles["user-text"]
          } data-testid='chakra-v8-div'>

          {renderContent(text)}
          {descImageList?.length > 0 &&
          <React.Fragment>
              <Divider borderColor={"#00000033"} my={2} data-testid='chakra-v8-divider-fragment' />
              <HStack justifyContent={"space-between"} pr={3} w={"full"} data-testid='chakra-v8-hstack-fragment'>
                <Text
                fontSize={"14px"}
                color={"#000000A6"} data-testid='chakra-v8-text-hstack-transcribed-response'>
                {`Transcribed response`}</Text>
                <HStack
                cursor={"pointer"}
                onClick={() => {
                  onPreview(true);
                }} data-testid='chakra-v8-hstack-clickable'>

                  <Text
                  fontSize={"14px"}
                  fontWeight={"400"}
                  color={"#5F4DC7"} data-testid='chakra-v8-text-hstack-show-preview'>
                  {`Show Preview`}</Text>
                  <LuMoveUpRight size={16} color="#5F4DC7" data-testid='chakra-v8-lumoveupright-hstack' />
                </HStack>
              </HStack>
            </React.Fragment>
          }
        </div>
      </div>
    </div>);

}