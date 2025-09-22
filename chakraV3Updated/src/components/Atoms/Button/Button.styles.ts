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

// User specific styles with integrated pseudo states
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
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      outline: "none",
    },
    "&[data-selected=true]": {
      border: "2px solid",
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
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      outline: "none",
    },
    "&[data-selected=true]": {
      border: "2px solid",
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
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      outline: "none",
    },
    "&[data-selected=true]": {
      border: "2px solid",
      borderColor: "red.500",
    },
  },
  TeacherDark: {
    // Teacher dark mode variant
    color: "red.200",
    bg: "gray.800",
    border: "1px solid",
    borderColor: "red.200",
    // Pseudo states
    "&:hover": {
      filter: "brightness(0.95)",
    },
    "&:focus": {
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
      outline: "none",
    },
    "&[data-selected=true]": {
      border: "2px solid",
      borderColor: "red.200",
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
      boxShadow: "0 0 0 3px rgba(255, 99, 99, 0.6)",
      outline: "none",
    },
    "&[data-selected=true]": {
      border: "2px solid white",
    },
  },
};

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
    fontSize: "12px",
    padding: "6px 12px",
    height: "28px",
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
    width: "14px",
    height: "14px",
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
};