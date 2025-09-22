// Button style utility functions and style objects

// Base styles common to all buttons
const base = {
  fontFamily: "Inter, sans-serif",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0px",
  fontWeight: 600,
  borderRadius: "4px",
  opacity: 1,
  cursor: "pointer",
};

// Utility function to create primary button styles
const createPrimaryStyle = (colors: {
  text: string;
  bg: string;
  hoverBg: string;
  focusOutline: string;
  selectedBg: string;
  boxShadow?: string;
  hoverBoxShadow?: string;
  selectedBoxShadow?: string;
}) => ({
  color: colors.text,
  bg: colors.bg,
  padding: "8px 16px",
  border: "none",
  "&:hover": {
    bg: colors.hoverBg,
    boxShadow: colors.hoverBoxShadow || colors.boxShadow || "1px 1px 4px 0 rgba(23, 23, 0, 0.40)",
  },
  "&:focus": {
    boxShadow: "none",
    outline: `4px solid ${colors.focusOutline}`,
    outlineOffset: "4px",
    borderRadius: "4px",
    bg: colors.bg
  },
  "&[data-selected=true]": {
    bg: colors.selectedBg,
    border: "none",
    boxShadow: colors.selectedBoxShadow || colors.boxShadow || "1px 1px 4px 0 rgba(23, 23, 0, 0.40)",
  },
});

// Utility function to create secondary button styles
const createSecondaryStyle = (colors: {
  text: string;
  borderColor: string;
  hoverBg: string;
  hoverText: string;
  hoverBorderColor: string;
  focusOutline: string;
  focusText?: string;
  selectedText: string;
  selectedBorderColor: string;
  selectedBg: string;
  boxShadow?: string;
  hoverBoxShadow?: string;
  selectedBoxShadow?: string;
}) => ({
  color: colors.text,
  bg: "transparent",
  border: "1px solid",
  borderColor: colors.borderColor,
  padding: "8px 16px",
  "&:hover": {
    bg: colors.hoverBg,
    color: colors.hoverText,
    borderColor: colors.hoverBorderColor,
    filter: "none",
    boxShadow: colors.hoverBoxShadow || colors.boxShadow || "1px 1px 4px 0 rgba(23, 23, 0, 0.40)",
  },
  "&:focus": {
    boxShadow: "none",
    outline: `4px solid ${colors.focusOutline}`,
    outlineOffset: "4px",
    borderRadius: "8px",
    bg: "transparent",
    color: colors.focusText || colors.focusOutline,
  },
  "&[data-selected=true]": {
    color: colors.selectedText,
    borderColor: colors.selectedBorderColor,
    border: "1px solid",
    bg: colors.selectedBg,
    boxShadow: colors.selectedBoxShadow || colors.boxShadow || "1px 1px 4px 0 rgba(23, 23, 0, 0.40)",
  },
});

// Utility function to create tertiary button styles
const createTertiaryStyle = (colors: {
  text: string;
  hoverBg?: string;
  hoverText: string;
  focusOutline?: string;
  focusText?: string;
  selectedText: string;
  selectedBg?: string;
  boxShadow?: string;
  hoverBoxShadow?: string;
  selectedBoxShadow?: string;
}) => ({
  color: colors.text,
  bg: "transparent",
  border: "none",
  padding: "0px",
  "&:hover": {
    bg: colors.hoverBg || "transparent",
    color: colors.hoverText,
    filter: "none",
    ...(colors.hoverBoxShadow || colors.boxShadow ? { boxShadow: colors.hoverBoxShadow || colors.boxShadow } : {}),
  },
  "&:focus": {
    boxShadow: "none",
    outline: colors.focusOutline ? `4px solid ${colors.focusOutline}` : "none",
    outlineOffset: "4px",
    borderRadius: "6px",
    bg: "transparent",
    color: colors.focusText || colors.text,
  },
  "&[data-selected=true]": {
    color: colors.selectedText,
    bg: colors.selectedBg || "transparent",
    border: "none",
    ...(colors.selectedBoxShadow ? { boxShadow: colors.selectedBoxShadow } : {}),
  },
});

// Utility function for creating disabled styles
const createDisabledStyle = (colors: {
  bg: string;
  text: string;
  borderColor?: string;
}) => ({
  primary: {
    bg: colors.bg,
    color: colors.text,
    border: "none",
    opacity: 1,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  secondary: {
    bg: "transparent",
    color: colors.bg,
    border: "1px solid",
    borderColor: colors.borderColor || colors.bg,
    opacity: 1,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
  tertiary: {
    bg: "transparent",
    color: colors.bg,
    border: "none",
    padding: "0px",
    opacity: 1,
    cursor: "not-allowed",
    pointerEvents: "none",
  },
});

// Use utility functions to create the user styles
const userStyles = {
  StudentLight: {
    primary: createPrimaryStyle({
      text: "#F4F2FF",
      bg: "#5F4DC7",
      hoverBg: "#6E5DCF",
      focusOutline: "#B7ADF2",
      selectedBg: "#4A3BA3",
    }),
    secondary: createSecondaryStyle({
      text: "#5F4DC7",
      borderColor: "#5F4DC7",
      hoverBg: "#E9E5FF",
      hoverText: "#6E5DCF",
      hoverBorderColor: "#6E5DCF",
      focusOutline: "#B7ADF2",
      focusText: "#B7ADF2",
      selectedText: "#4A3BA3",
      selectedBorderColor: "#4A3BA3",
      selectedBg: "#DFDAFE",
    }),
    tertiary: createTertiaryStyle({
      text: "#265728",
      hoverText: "#8474DB",
      focusText: "#5F4DC7",
      focusOutline: "none",
      selectedText: "#4A3BA3",
    }),
  },
  StudentDark: {
    primary: createPrimaryStyle({
      text: "#171717",
      bg: "#ffbfb7",
      hoverBg: "#FFCCC5",
      focusOutline: "#FFDFDB",
      selectedBg: "#D9A39C",
    }),
    secondary: createSecondaryStyle({
      text: "#FFBFB7",
      borderColor: "#FFBFB7",
      hoverBg: "#332928",
      hoverText: "#FFCCC5",
      hoverBorderColor: "#FFCCC5",
      focusOutline: "#FFDFDB",
      focusText: "#FFDFDB",
      selectedText: "#D9A39C",
      selectedBorderColor: "#D9A39C",
      selectedBg: "#4C3937",
    }),
    tertiary: createTertiaryStyle({
      text: "#FFBFB7",
      hoverText: "#FFD2CD",
      focusOutline: "#FFDFDB",
      focusText: "#FFDFDB",
      selectedText: "#D9A39C",
    }),
  },
  TeacherLight: {
    primary: createPrimaryStyle({
      text: "#F1F1F1",
      bg: "#265728",
      hoverBg: "#357A38",
      focusOutline: "#173418",
      selectedBg: "#419544",
      hoverBoxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25)",
      selectedBoxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25) inset",
    }),
    secondary: createSecondaryStyle({
      text: "#265728",
      borderColor: "#265728",
      hoverBg: "#CAE7CB",
      hoverText: "#173418",
      hoverBorderColor: "#173418",
      focusOutline: "#173418",
      focusText: "#173418",
      selectedText: "#173418",
      selectedBorderColor: "#173418",
      selectedBg: "#A6D7A8",
      hoverBoxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25)",
      selectedBoxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25) inset",
    }),
    tertiary: createTertiaryStyle({
      text: "#265728",
      hoverBg: "#CAE7CB",
      hoverText: "#173418",
      focusOutline: "none",
      focusText: "#173418",
      selectedText: "#173418",
      selectedBg: "#A6D7A8",
      hoverBoxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25)",
      selectedBoxShadow: "2px 2px 4px 0 rgba(0, 0, 0, 0.25) inset",
    }),
  },
  TeacherDark: {
    primary: createPrimaryStyle({
      text: "#171717",
      bg: "#8bc34a",
      hoverBg: "#9ccc65",
      focusOutline: "#c5e1a5",
      selectedBg: "#79ba40",
    }),
    secondary: createSecondaryStyle({
      text: "#8bc34a",
      borderColor: "#8bc34a",
      hoverBg: "#1C270F",
      hoverText: "#9ccc65",
      hoverBorderColor: "#9ccc65",
      focusOutline: "#c5e1a5",
      focusText: "#8bc34a",
      selectedText: "#79ba40",
      selectedBorderColor: "#79ba40",
      selectedBg: "#293a16",
    }),
    tertiary: createTertiaryStyle({
      text: "#8bc34a",
      hoverText: "#aed581",
      focusOutline: "#c5e1a5",
      focusText: "#8bc34a",
      selectedText: "#79ba40",
    }),
  },
  Error: {
    primary: createPrimaryStyle({
      text: "#171717",
      bg: "#F44336",
      hoverBg: "#F65F54",
      focusOutline: "#FAA19B",
      selectedBg: "#D0392E",
    }),
    secondary: createSecondaryStyle({
      text: "#F44336",
      borderColor: "#F44336",
      hoverBg: "#332928",
      hoverText: "#F65F54",
      hoverBorderColor: "#F65F54",
      focusOutline: "#FAA19B",
      focusText: "#F44336",
      selectedText: "#D0392E",
      selectedBorderColor: "#D0392E",
      selectedBg: "#4C3937",
    }),
    tertiary: createTertiaryStyle({
      text: "#F44336",
      hoverText: "#F77C73",
      focusOutline: "#FAA19B", // Corrected the double # in the original
      focusText: "#F44336",
      selectedText: "#D0392E",
    }),
  },
};

// Define sizes
const sizes = {
  small: {
    fontSize: "12px",
    padding: "0px 8px",
    lineHeight: "16px",
  },
  medium: {
    fontSize: "14px",
    padding: "0px 8px",
    lineHeight: "20px",
  },
  large: {
    fontSize: "16px",
    padding: "0px 8px",
    lineHeight: "24px",
  },
  "extra-large": {
    fontSize: "20px",
    padding: "0px 8px",
    lineHeight: "28px",
  },
};

// Define image sizes
const imageSizes = {
  small: {
    width: "16px",
    height: "16px",
  },
  medium: {
    width: "20px",
    height: "20px",
  },
  large: {
    width: "24px",
    height: "24px",
  },
  "extra-large": {
    width: "28px",
    height: "28px",
  },
};

// Default disabled style
const defaultDisabled = {
  opacity: 0.5,
  cursor: "not-allowed",
  pointerEvents: "none",
};

// User-specific disabled styles
const userDisabledStyles = {
  default: defaultDisabled,
  StudentDark: createDisabledStyle({
    bg: "#707070",
    text: "#a0a0a0",
  }),
  TeacherDark: createDisabledStyle({
    bg: "#707070",
    text: "#a0a0a0",
  }),
  Error: createDisabledStyle({
    bg: "#707070",
    text: "#a0a0a0",
  }),
  TeacherLight: createDisabledStyle({
    bg: "#A0A0A0",
    text: "#707070",
  }),
  StudentLight: createDisabledStyle({
    bg: "#414141",
    text: "#707070",
  }),
};

export {
  base,
  userStyles,
  sizes,
  imageSizes,
  userDisabledStyles,
};