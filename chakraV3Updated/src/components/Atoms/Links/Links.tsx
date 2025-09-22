import React from "react";
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from "@chakra-ui/react";
import { base, roles, sizes, underline, states, layout } from "./Links.styles";

export interface LinksProps extends Omit<ChakraLinkProps, "size"> {
  label?: string;
  user?: "teacher" | "student";
  size?: "small" | "medium";
  isUnderlined?: boolean;
  icon?: React.ReactNode;
  state?: "default" | "disabled"; // Removed visited state as it's now handled by CSS
  isSelected?: boolean; // Added for explicit selected state if needed
  styleOverrides?: Record<string, any>;
  isExternal?: boolean;
}

export const Links: React.FC<LinksProps> = ({
  label,
  children,
  user = "student",
  size = "medium",
  isUnderlined = false,
  icon,
  state = "default",
  isSelected = false,
  isExternal = false,
  styleOverrides = {},
  ...props
}) => {
  // Merge styles in order of precedence
  const mergedStyles = {
    ...base,
    ...(user && roles[user]),
    ...(size && sizes[size]),
    ...(isUnderlined ? underline.underlined : underline.notUnderlined),
    ...(state && states[state]),
    ...(icon && layout.withIcon),
    ...styleOverrides,
  };

  // For disabled state, add data-disabled attribute (Chakra UI v3 compatibility)
  const isDisabled = state === "disabled";

  return (
    <ChakraLink
      css={mergedStyles}
      data-disabled={isDisabled || undefined}
      data-selected={isSelected || undefined}
      tabIndex={isDisabled ? -1 : undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {label || children}
      {icon && (
        <span style={size === "small" ? sizes.smallIcon : sizes.mediumIcon}>
          {icon}
        </span>
      )}
    </ChakraLink>
  );
};

export default Links;