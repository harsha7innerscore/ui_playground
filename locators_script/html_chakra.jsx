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
  onPreview,
}) {
  const { selectedIndex, playgroundMode } = useRoot();
  const location = useLocation();
  let isPracticeScreen = location?.pathname.includes("/practice");
  let isDoubtScreen =
    location?.pathname.includes("/doubt") || playgroundMode === "Doubt";
  return (
    <div>
      <div
        className={styles.container}
        style={{
          marginTop: !isClassifier || selectedIndex === 2 ? "0" : "40px",
        }}
      >
        <div
          className={
            isBold
              ? styles["user-text-bold"]
              : isPracticeScreen
              ? styles["user-text-practice"]
              : isDoubtScreen
              ? styles["user-text-doubt"]
              : styles["user-text"]
          }
        >
          {renderContent(text)}
          {descImageList?.length > 0 && (
            <React.Fragment>
              <Divider borderColor={"#00000033"} my={2} />
              <HStack justifyContent={"space-between"} pr={3} w={"full"}>
                <Text
                  fontSize={"14px"}
                  color={"#000000A6"}
                >{`Transcribed response`}</Text>
                <HStack
                  cursor={"pointer"}
                  onClick={() => {
                    onPreview(true);
                  }}
                >
                  <Text
                    fontSize={"14px"}
                    fontWeight={"400"}
                    color={"#5F4DC7"}
                  >{`Show Preview`}</Text>
                  <LuMoveUpRight size={16} color="#5F4DC7" />
                </HStack>
              </HStack>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
