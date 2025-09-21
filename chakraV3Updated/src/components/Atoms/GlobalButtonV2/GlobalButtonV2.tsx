import React from "react";
import {
  Button as ChakraButtonV2,
  Image,
} from "@chakra-ui/react";
import { getButtonStyles } from "./getButtonStyles";

export interface GlobalButtonV2Props {
  buttonText: string;
  leftImg?: string | React.ReactNode;
  rightImg?: string | React.ReactNode;
  onClick?: () => void;

  // Style logic props
  buttonType?: string;
  size?: string;
  imageSize?: string;
  state?: string;

  // Optional overrides
  buttonCss?: any;
  leftImgCss?: any;
  rightImgCss?: any;

  // Additional props from ButtonProps that we want to support
  isDisabled?: boolean;
  className?: string;
  id?: string;
}

const GlobalButtonV2: React.FC<GlobalButtonV2Props> = ({
  buttonText,
  leftImg,
  rightImg,
  onClick,
  buttonType = "Primary",
  size = "Medium",
  imageSize = "Medium",
  state = "Enabled",
  buttonCss,
  leftImgCss,
  rightImgCss,
  className,
  id
}) => {
  const { buttonCss: finalButtonCss, leftImgCss: finalLeftImgCss, rightImgCss: finalRightImgCss } =
    getButtonStyles({
      buttonType,
      size,
      imageSize,
      state,
      buttonCssOverride: buttonCss,
      leftImgCssOverride: leftImgCss,
      rightImgCssOverride: rightImgCss,
    });

  const renderImage = (img: string | React.ReactNode, css: any) => {
    if (typeof img === "string") {
      return <Image src={img} alt="button-icon" css={css} />;
    }
    return img;
  };

  return (
      <ChakraButtonV2
        onClick={state === "Disabled" ? undefined : onClick}
        variant="plain"
        css={finalButtonCss}
        disabled={state === "Disabled"}
        className={className}
        id={id}
      >
        {leftImg && renderImage(leftImg, finalLeftImgCss)}
        {buttonText}
        {rightImg && renderImage(rightImg, finalRightImgCss)}
      </ChakraButtonV2>
  );
};

export default GlobalButtonV2;
