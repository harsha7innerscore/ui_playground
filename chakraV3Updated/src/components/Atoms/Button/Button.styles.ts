// Button.styles.ts
// Styles for the Button component

// Base styles for all buttons
const base = {
  fontFamily: "Inter, sans-serif",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontWeight: 600,
  borderRadius: "4px",
};

// Common pseudo states applied to all buttons
const pseudoStates = {
  hover: {
    "&:hover": {
      filter: "brightness(0.95)",
    },
  },
  focus: {
    "&:focus": {
      outline: "none",
    },
  },
  selected: {
    "&[data-selected=true]": {
      border: "2px solid",
    },
  },
};

// User specific styles (without duplicated pseudo states)
const userStyles = {
  StudentLight: {
    // Student light mode variant
    color: "green.500",
    bg: "white",
    border: "1px solid",
    borderColor: "green.500",
    // Pseudo states
    "&:hover": {
      filter: "brightness(0.95)",
    },
    "&:focus": {
      ...pseudoStates.focus["&:focus"],
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
    },
    "&[data-selected=true]": {
      ...pseudoStates.selected["&[data-selected=true]"],
      borderColor: "green.500",
    },
  },
  StudentDark: {
    // Student dark mode variant
    color: "green.200",
    bg: "gray.800",
    border: "1px solid",
    borderColor: "green.200",
    // Pseudo states
    "&:hover": {
      filter: "brightness(0.95)",
    },
    "&:focus": {
      ...pseudoStates.focus["&:focus"],
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
    },
    "&[data-selected=true]": {
      ...pseudoStates.selected["&[data-selected=true]"],
      borderColor: "green.200",
    },
  },
  TeacherLight: {
    // Teacher light mode variant
    color: "red.500",
    bg: "white",
    border: "1px solid",
    borderColor: "red.500",
    // Pseudo states
    "&:hover": {
      filter: "brightness(0.95)",
    },
    "&:focus": {
      ...pseudoStates.focus["&:focus"],
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
    },
    "&[data-selected=true]": {
      ...pseudoStates.selected["&[data-selected=true]"],
      borderColor: "red.500",
    },
  },
  TeacherDark: {
    // Teacher dark mode variant - updated from Figma
    color: "#171717", // Text color from Figma (Neutral/850)
    bg: "#8bc34a", // Success/Dark/Main from Figma
    border: "none",
    // Pseudo states
    "&:hover": {
      filter: "brightness(0.95)",
    },
    "&:focus": {
      ...pseudoStates.focus["&:focus"],
      boxShadow: "0 0 0 3px rgba(139, 195, 74, 0.6)", // Focus ring matching the green color
    },
    "&[data-selected=true]": {
      ...pseudoStates.selected["&[data-selected=true]"],
      borderColor: "white",
    },
  },
  Danger: {
    // Danger variant
    color: "white",
    bg: "red.600",
    border: "1px solid",
    borderColor: "red.600",
    // Pseudo states
    "&:hover": {
      filter: "brightness(0.95)",
    },
    "&:focus": {
      ...pseudoStates.focus["&:focus"],
      boxShadow: "0 0 0 3px rgba(255, 99, 99, 0.6)",
    },
    "&[data-selected=true]": {
      ...pseudoStates.selected["&[data-selected=true]"],
      borderColor: "white",
    },
  },
};

// Hover state is now added directly to each user style

// Button types
const buttonTypes = {
  primary: {
    // Primary button style (solid)
    fontWeight: 700,
    // Colors defined by userStyles
  },
  secondary: {
    // Secondary button style (outlined)
    bg: "transparent",
    // Colors defined by userStyles
  },
  tertiary: {
    // Tertiary button style (ghost)
    bg: "transparent",
    border: "none",
  },
};

// Size-specific styles
const sizes = {
  small: {
    fontSize: "12px", // Font Size/button/xs from Figma
    padding: "8px 16px", // Updated padding from Figma
    height: "32px", // Height adjusted to match Figma
    lineHeight: "16px", // Line Height/body/xs from Figma
  },
  medium: {
    fontSize: "14px",
    padding: "8px 16px",
    height: "36px",
  },
  large: {
    fontSize: "16px",
    padding: "10px 20px",
    height: "44px",
  },
  "extra-large": {
    fontSize: "18px",
    padding: "12px 24px",
    height: "52px",
  },
};

// Image/icon sizes
const imageSizes = {
  small: {
    width: "16px", // From Figma (size 16px)
    height: "16px", // From Figma (size 16px)
  },
  medium: {
    width: "16px",
    height: "16px",
  },
  large: {
    width: "18px",
    height: "18px",
  },
  "extra-large": {
    width: "20px",
    height: "20px",
  },
};

// Button states
const states = {
  default: {
    opacity: 1,
    cursor: "pointer",
  },
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    pointerEvents: "none",
    "&:hover": {
      filter: "none",
    },
  },
};

export {
  base,
  userStyles,
  buttonTypes,
  sizes,
  imageSizes,
  states,
  pseudoStates,
};