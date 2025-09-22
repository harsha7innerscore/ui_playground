
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
  "&:hover": {
    textDecoration: "underline", // Automatic hover state from Figma
  },
  "&:focus": {
    outline: "2px solid",
    outlineColor: "currentColor",
    outlineOffset: "2px",
  },
  "&[data-selected=true]": {
    fontWeight: "bold",
    textDecoration: "underline",
  },
};

// Role-based styles
const roles = {
  student: {
    color: "#3366CC", // Already matches Figma specs
  },
  teacher: {
    color: "#F8F8F8",
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
    marginLeft: "4px",
  },
  medium: {
    fontSize: "14px",
    lineHeight: "20px",
  },
  mediumIcon: {
    width: "18px",
    height: "18px",
    marginLeft: "6px",
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

// State-based styles - only keeping disabled and visited as explicit states
const states = {
  default: {},
  visited: {
    opacity: 0.8,
  },
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
    gap: "4px",
  },
};

export { base, roles, sizes, underline, states, layout };