import React from "react";
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from "@chakra-ui/react";
import { base, userStyles, sizes, imageSizes, userDisabledStyles } from "./Button.styles";

export interface ButtonProps extends Omit<ChakraButtonProps, "size"> {
  user: "StudentLight" | "StudentDark" | "TeacherLight" | "TeacherDark" | "Error";
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

  // Get appropriate disabled style based on user type and button type
  let disabledStyle = {};
  if (buttonState === "disabled") {
    const userDisabledStyle = userDisabledStyles[user as keyof typeof userDisabledStyles] || userDisabledStyles.default;

    // Check if there's a button-type specific disabled style
    if ((userDisabledStyle as any)[buttonType]) {
      disabledStyle = (userDisabledStyle as any)[buttonType];
    } else {
      disabledStyle = userDisabledStyle;
    }
  }

  // Merge styles in order of precedence
  const mergedStyles = {
    ...base,
    // Apply the user-specific button type style
    ...(user && buttonType && (userStyles[user] as any)?.[buttonType]),
    // Apply size-specific styles
    ...(size && sizes[size]),
    // Apply disabled styles if button is disabled
    ...(buttonState === "disabled" && disabledStyle),
    // Apply any custom style overrides last
    ...styleOverrides,
  };

  // For disabled state, use data-disabled attribute for Chakra UI v3 compatibility
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