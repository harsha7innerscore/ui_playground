// Button.styles.ts
// Styles for the Button component

// Base styles for all buttons
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
  cursor: "pointer", // Added from states.default
};

// The common pseudo states have been removed and inlined directly into each user style

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
      outline: "none",
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
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
      outline: "none",
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
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
      outline: "none",
      boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.6)",
    },
    "&[data-selected=true]": {
      border: "2px solid",
      borderColor: "red.500",
    },
  },
  TeacherDark: {
    // Teacher dark mode variant
    primary: {
      // Primary button style for TeacherDark - updated from Figma
      color: "#171717", // Text color from Figma (Neutral/850)
      bg: "#8bc34a", // Success/Dark/Main from Figma
      // Pseudo states
      "&:hover": {
        // Using the specific hover color from Figma (Success/Dark/400: #9ccc65)
        // instead of brightness filter
        bg: "#9ccc65",
      },
      "&:focus": {
        // Replace box-shadow with Figma's border approach
        boxShadow: "none",
        // From Figma: 4px border with color #c5e1a5 (Success/Dark/200)
        // Using outline instead of box-shadow for cleaner appearance
        outline: "4px solid #c5e1a5",
        outlineOffset: "4px", // Space between button and outline
        borderRadius: "4px", // Maintain rounded corners
      },
      "&[data-selected=true]": {
        // Using the specific selected color from Figma (Success/Dark/600: #79ba40)
        // instead of adding a border
        bg: "#79ba40",
        // Remove the default 2px border from pseudoStates.selected
        border: "none",
      },
    },
    // Secondary button type overrides for TeacherDark
    secondary: {
      color: "#8bc34a", // Success/Dark/Main from Figma
      bg: "transparent",
      border: "1px solid",
      borderColor: "#8bc34a",
      "&:hover": {
        bg: "transparent",
        color: "#9ccc65", // Success/Dark/400 from Figma
        borderColor: "#9ccc65",
        filter: "none", // Override default filter to ensure no brightness change
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #c5e1a5", // Success/Dark/200 from Figma
        outlineOffset: "4px",
        borderRadius: "8px", // Maintain rounded corners for outline
        bg: "transparent", // Keep transparent background in focused state
        color: "#8bc34a", // Keep text color as Success/Dark/Main
      },
      "&[data-selected=true]": {
        color: "#79ba40", // Success/Dark/600 from Figma
        borderColor: "#79ba40",
        border: "1px solid",
        bg: "#293a16", // Success/Dark/900 from Figma
      },
    },
    // Tertiary button type overrides for TeacherDark
    tertiary: {
      color: "#8bc34a", // Success/Dark/Main from Figma
      bg: "transparent",
      border: "none",
      padding: "0px", // Remove padding for tertiary buttons
      "&:hover": {
        bg: "transparent",
        color: "#aed581", // Success/Dark/300 from Figma
        filter: "none", // Override default filter to ensure no brightness change
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #c5e1a5", // Success/Dark/200 from Figma
        outlineOffset: "4px",
        borderRadius: "6px", // Rounded corners for outline from Figma (slightly less rounded)
        bg: "transparent",
        color: "#8bc34a", // Keep text color as Success/Dark/Main
        // Tertiary focused has no background color
      },
      "&[data-selected=true]": {
        color: "#79ba40", // Success/Dark/600 from Figma
        bg: "transparent",
        border: "none",
      },
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
      outline: "none",
      boxShadow: "0 0 0 3px rgba(255, 99, 99, 0.6)",
    },
    "&[data-selected=true]": {
      border: "2px solid",
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
    border: "none",
    position: "relative", // Needed for the absolute positioning of the focus border
    // Colors defined by userStyles
  },
  secondary: {
    // Secondary button style (outlined)
    bg: "transparent",
    border: "1px solid",
    borderColor: "currentColor", // Border color matches text color from userStyles
    position: "relative", // For focus outline positioning
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
    padding: "0px 8px",
    lineHeight: "16px", // Line Height/body/xs from Figma
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

// Image/icon sizes
const imageSizes = {
  small: {
    width: "16px", // From Figma (size 16px)
    height: "16px", // From Figma (size 16px)
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

// User-specific disabled styles
const userDisabledStyles = {
  // Default disabled style for most variants
  default: {
    opacity: 0.5,
    cursor: "not-allowed",
    pointerEvents: "none",
    "&:hover": {
      filter: "none",
    },
  },
  // Specific TeacherDark disabled style from Figma
  TeacherDark: {
    primary: {

      bg: "#707070", // Neutral/500 from Figma
      color: "#a0a0a0", // Neutral/400 from Figma
      border: "none",
      opacity: 1, // No opacity change, uses specific colors instead
      cursor: "not-allowed",
      pointerEvents: "none",
      "&:hover": {
        filter: "none",
        bg: "#707070", // Ensure hover doesn't change background
      },
    },
    // Secondary button specific disabled style
    secondary: {
      bg: "transparent", // Keep transparent background
      color: "#707070", // Neutral/500 from Figma
      border: "1px solid",
      borderColor: "#707070", // Neutral/500 from Figma
      opacity: 1,
      cursor: "not-allowed",
      pointerEvents: "none",
      "&:hover": {
        filter: "none",
        bg: "transparent",
        color: "#707070",
        borderColor: "#707070",
      },
    },
    // Tertiary button specific disabled style
    tertiary: {
      bg: "transparent", // Keep transparent background
      color: "#707070", // Neutral/500 from Figma
      border: "none",
      padding: "0px", // Keep the zero padding from default tertiary style
      opacity: 1,
      cursor: "not-allowed",
      pointerEvents: "none",
      "&:hover": {
        filter: "none",
        bg: "transparent",
        color: "#707070",
      },
    },
  },
};

// The states object has been removed.
// - Default state properties have been moved to the base object.
// - Disabled state is handled by userDisabledStyles.

export {
  base,
  userStyles,
  buttonTypes,
  sizes,
  imageSizes,
  userDisabledStyles,
};