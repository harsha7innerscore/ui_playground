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

const userStyles = {
  StudentLight: {
    color: "green.500",
    bg: "white",
    border: "1px solid",
    borderColor: "green.500",
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
    primary: {
      color: "#171717",
      bg: "#ffbfb7",
      border: "none",
      padding: "8px 16px",
      "&:hover": {
        bg: "#FFCCC5",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #FFDFDB",
        outlineOffset: "4px",
        borderRadius: "4px",
      },
      "&[data-selected=true]": {
        bg: "#D9A39C",
        border: "none",
      },
    },
    secondary: {
      color: "#FFBFB7",
      bg: "transparent",
      border: "1px solid",
      borderColor: "#FFBFB7",
      padding: "8px 16px",
      "&:hover": {
        bg: "#332928",
        color: "#FFCCC5",
        borderColor: "#FFCCC5",
        filter: "none",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #FFDFDB",
        outlineOffset: "4px",
        borderRadius: "8px",
        bg: "transparent",
        color: "#FFDFDB",
      },
      "&[data-selected=true]": {
        color: "#D9A39C",
        borderColor: "#D9A39C",
        border: "1px solid",
        bg: "#4C3937",
      },
    },
    tertiary: {
      color: "#FFBFB7",
      bg: "transparent",
      border: "none",
      padding: "0px",
      "&:hover": {
        bg: "transparent",
        color: "#FFD2CD",
        filter: "none",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #FFDFDB",
        outlineOffset: "4px",
        borderRadius: "6px",
        bg: "transparent",
        color: "#FFDFDB",
      },
      "&[data-selected=true]": {
        color: "#D9A39C",
        bg: "transparent",
        border: "none",
      },
    },
  },
  TeacherLight: {
    color: "red.500",
    bg: "white",
    border: "1px solid",
    borderColor: "red.500",
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
    primary: {
      color: "#171717",
      bg: "#8bc34a",
      padding: "8px 16px",
      border: "none",
      "&:hover": {
        bg: "#9ccc65",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #c5e1a5",
        outlineOffset: "4px",
        borderRadius: "4px",
      },
      "&[data-selected=true]": {
        bg: "#79ba40",
        border: "none",
      },
    },
    secondary: {
      color: "#8bc34a",
      bg: "transparent",
      border: "1px solid",
      borderColor: "#8bc34a",
      padding: "8px 16px",
      "&:hover": {
        bg: "#1C270F",
        color: "#9ccc65",
        borderColor: "#9ccc65",
        filter: "none",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #c5e1a5",
        outlineOffset: "4px",
        borderRadius: "8px",
        bg: "transparent",
        color: "#8bc34a",
      },
      "&[data-selected=true]": {
        color: "#79ba40",
        borderColor: "#79ba40",
        border: "1px solid",
        bg: "#293a16",
      },
    },
    tertiary: {
      color: "#8bc34a",
      bg: "transparent",
      border: "none",
      padding: "0px",
      "&:hover": {
        bg: "transparent",
        color: "#aed581",
        filter: "none",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #c5e1a5",
        outlineOffset: "4px",
        borderRadius: "6px",
        bg: "transparent",
        color: "#8bc34a",
      },
      "&[data-selected=true]": {
        color: "#79ba40",
        bg: "transparent",
        border: "none",
      },
    },
  },
  Danger: {
    primary: {
      color: "#171717",
      bg: "#F44336",
      padding: "8px 16px",
      border: "none",
      "&:hover": {
        bg: "#F65F54",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #FAA19B",
        outlineOffset: "4px",
        borderRadius: "4px",
      },
      "&[data-selected=true]": {
        bg: "#D0392E",
        border: "none",
      },
    },
    secondary: {
      color: "#F44336",
      bg: "transparent",
      border: "1px solid",
      borderColor: "#F44336",
      padding: "8px 16px",
      "&:hover": {
        bg: "#332928",
        color: "#F65F54",
        borderColor: "#F65F54",
        filter: "none",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid #FAA19B",
        outlineOffset: "4px",
        borderRadius: "8px",
        bg: "transparent",
        color: "#F44336",
      },
      "&[data-selected=true]": {
        color: "#D0392E",
        borderColor: "#D0392E",
        border: "1px solid",
        bg: "#4C3937",
      },
    },
    tertiary: {
      color: "#F44336",
      bg: "transparent",
      border: "none",
      padding: "0px",
      "&:hover": {
        bg: "transparent",
        color: "#F77C73",
        filter: "none",
      },
      "&:focus": {
        boxShadow: "none",
        outline: "4px solid ##FAA19B",
        outlineOffset: "4px",
        borderRadius: "6px",
        bg: "transparent",
        color: "#F44336",
      },
      "&[data-selected=true]": {
        color: "#D0392E",
        bg: "transparent",
        border: "none",
      },
    },
  },
};

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

const userDisabledStyles = {
  default: {
    opacity: 0.5,
    cursor: "not-allowed",
    pointerEvents: "none",
    "&:hover": {
      filter: "none",
    },
  },
  StudentDark: {
    primary: {
      bg: "#707070",
      color: "#a0a0a0",
      border: "none",
      opacity: 1,
      cursor: "not-allowed",
      pointerEvents: "none",
      "&:hover": {
        filter: "none",
        bg: "#707070",
      },
    },
    secondary: {
      bg: "transparent",
      color: "#707070",
      border: "1px solid",
      borderColor: "#707070",
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
    tertiary: {
      bg: "transparent",
      color: "#707070",
      border: "none",
      padding: "0px",
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
  TeacherDark: {
    primary: {
      bg: "#707070",
      color: "#a0a0a0",
      border: "none",
      opacity: 1,
      cursor: "not-allowed",
      pointerEvents: "none",
      "&:hover": {
        filter: "none",
        bg: "#707070",
      },
    },
    secondary: {
      bg: "transparent",
      color: "#707070",
      border: "1px solid",
      borderColor: "#707070",
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
    tertiary: {
      bg: "transparent",
      color: "#707070",
      border: "none",
      padding: "0px",
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
  Danger: {
    primary: {
      bg: "#707070",
      color: "#a0a0a0",
      border: "none",
      opacity: 1,
      cursor: "not-allowed",
      pointerEvents: "none",
      "&:hover": {
        filter: "none",
        bg: "#707070",
      },
    },
    secondary: {
      bg: "transparent",
      color: "#707070",
      border: "1px solid",
      borderColor: "#707070",
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
    tertiary: {
      bg: "transparent",
      color: "#707070",
      border: "none",
      padding: "0px",
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

export {
  base,
  userStyles,
  sizes,
  imageSizes,
  userDisabledStyles,
};