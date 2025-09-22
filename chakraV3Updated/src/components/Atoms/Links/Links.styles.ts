
// Styles for the Links component

// Base styles applied to all links
const base = {
  fontFamily: "Inter, sans-serif", // Updated to Inter font family from Figma
  textDecoration: "none",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  width: "fit-content",
};

// Role-based styles with their respective interactive states
const roles = {
  student: {
    color: "#3366CC", // Already matches Figma specs
    "&:hover": {
      textDecoration: "underline",
    },
    "&:focus": {
      outline: "none", // Remove default outline
      border: "1px solid #3366CC", // 1px border as shown in Figma
      borderRadius: "2px", // Rounded corners
      padding: "2px 4px", // Vertical and horizontal padding from Figma
    },
    "&:visited": {
      opacity: 0.8,
    },
    "&[data-selected=true]": {
      fontWeight: "bold",
      textDecoration: "underline",
    },
  },
  teacher: {
    color: "#F8F8F8",
    "&:hover": {
      textDecoration: "underline",
    },
    "&:focus": {
      outline: "none", // Remove default outline
      border: "1px solid #EEF1F8", // 1px border as shown in Figma
      borderRadius: "2px", // Rounded corners
      padding: "2px 4px", // Vertical and horizontal padding from Figma
    },
    "&:visited": {
      opacity: 0.8,
    },
    "&[data-selected=true]": {
      fontWeight: "bold",
      textDecoration: "underline",
    },
  },
};

// Size styles (text and icon)
const sizes = {
  small: {
    fontSize: "12px",
    lineHeight: "14px", // Updated to match Figma specs
    fontWeight: 600, // Semi Bold as per Figma specs
  },
  smallIcon: {
    width: "14px",
    height: "14px",
  },
  medium: {
    fontSize: "14px",
    lineHeight: "20px",
  },
  mediumIcon: {
    width: "18px",
    height: "18px",
  },
};

// Underline styles
const underline = {
  underlined: {
    textDecoration: "underline",
  },
  notUnderlined: {
    textDecoration: "none",
  },
};

// State-based styles - only keeping disabled as explicit state
const states = {
  default: {},
  disabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    pointerEvents: "none",
    "&:hover": {
      textDecoration: "none",
    },
  },
};

// Layout styles for icon placement
const layout = {
  withIcon: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Updated gap to 8px as requested
  },
};

export { base, roles, sizes, underline, states, layout };