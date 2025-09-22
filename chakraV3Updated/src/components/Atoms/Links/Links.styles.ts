import Theme from "../../../components/themes/Theme";

// Styles for the Links component

// Base styles applied to all links
const base = {
  fontFamily: "Arial, sans-serif",
  textDecoration: "none",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  display: "flex",
  alignItems: "center",
  width: "fit-content",
};

// Role-based styles
const roles = {
  student: {
    color: Theme.TERTIARY.GREEN,
    "&:hover": {
      color: "#5E9B2C", // Darker green
    },
  },
  teacher: {
    color: Theme.SUPPORTED_COLOURS.RED,
    "&:hover": {
      color: "#CC001B", // Darker red
    },
  },
};

// Size styles (text and icon)
const sizes = {
  small: {
    fontSize: "12px",
    lineHeight: "16px",
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
    "&:hover": {
      textDecoration: "underline",
    },
  },
  notUnderlined: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
};

// State-based styles
const states = {
  default: {},
  hovered: {
    textDecoration: "underline",
  },
  focused: {
    outline: "2px solid",
    outlineColor: "currentColor",
    outlineOffset: "2px",
  },
  selected: {
    fontWeight: "bold",
    textDecoration: "underline",
  },
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