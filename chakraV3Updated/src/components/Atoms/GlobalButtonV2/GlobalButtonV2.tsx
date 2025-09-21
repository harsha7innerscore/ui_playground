import React from "react";
import {
  Button as ChakraButtonV2,
  Image,
  ButtonProps,
  ChakraProvider,
} from "@chakra-ui/react";
import { getButtonStyles } from "./getButtonStyles";

export interface GlobalButtonV2Props extends ButtonProps {
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
  buttonSx?: any;
  leftImgSx?: any;
  rightImgSx?: any;
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
  buttonSx,
  leftImgSx,
  rightImgSx,
  ...rest
}) => {
  const { buttonSx: finalButtonSx, leftImgSx: finalLeftImgSx, rightImgSx: finalRightImgSx } =
    getButtonStyles({
      buttonType,
      size,
      imageSize,
      state,
      buttonSxOverride: buttonSx,
      leftImgSxOverride: leftImgSx,
      rightImgSxOverride: rightImgSx,
    });

  const renderImage = (img: string | React.ReactNode, sx: any) => {
    if (typeof img === "string") {
      return <Image src={img} alt="button-icon" sx={sx} />;
    }
    return img;
  };

  return (
    <ChakraProvider>
      <ChakraButtonV2
        onClick={state === "Disabled" ? undefined : onClick}
        variant="unstyled"
        sx={finalButtonSx}
        {...rest}
      >
        {leftImg && renderImage(leftImg, finalLeftImgSx)}
        {buttonText}
        {rightImg && renderImage(rightImg, finalRightImgSx)}
      </ChakraButtonV2>
    </ChakraProvider>
  );
};

export default GlobalButtonV2;
