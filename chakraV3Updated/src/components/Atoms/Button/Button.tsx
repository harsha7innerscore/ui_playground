import React from "react";
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { base, userStyles, buttonTypes, sizes, imageSizes, states } from "./Button.styles";

export interface ButtonProps extends Omit<ChakraButtonProps, "size"> {
  user: "StudentLight" | "StudentDark" | "TeacherLight" | "TeacherDark" | "Danger";
  size: "small" | "medium" | "large" | "extra-large";
  buttonType: "primary" | "secondary" | "tertiary";
  buttonState: "default" | "disabled";
  leftImage?: React.ReactElement;
  rightImage?: React.ReactElement;
  text: string;
  imageSize?: "small" | "medium" | "large" | "extra-large";
  isSelected?: boolean;
  styleOverrides?: Record<string, any>;
}

export const Button: React.FC<ButtonProps> = ({
  user = "StudentLight",
  size = "medium",
  buttonType = "primary",
  buttonState = "default",
  leftImage,
  rightImage,
  text,
  imageSize,
  isSelected = false,
  styleOverrides = {},
  ...props
}) => {
  // Default image size to match button size if not specified
  const effectiveImageSize = imageSize || size;

  // Merge styles in order of precedence
  const mergedStyles = {
    ...base,
    ...(user && userStyles[user]),
    ...(buttonType && buttonTypes[buttonType]),
    ...(size && sizes[size]),
    ...(buttonState && states[buttonState]),
    ...styleOverrides,
  };

  // For disabled state, add data-disabled attribute (Chakra UI v3 compatibility)
  const isDisabled = buttonState === "disabled";

  // Process left and right images/icons with appropriate sizing
  const leftImageWithStyles = leftImage
    ? React.cloneElement(leftImage, {
        style: { ...imageSizes[effectiveImageSize] }
      })
    : null;

  const rightImageWithStyles = rightImage
    ? React.cloneElement(rightImage, {
        style: { ...imageSizes[effectiveImageSize] }
      })
    : null;

  return (
    <ChakraButton
      css={mergedStyles}
      data-disabled={isDisabled || undefined}
      data-selected={isSelected || undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {leftImageWithStyles}
      {text}
      {rightImageWithStyles}
    </ChakraButton>
  );
};

export default Button;