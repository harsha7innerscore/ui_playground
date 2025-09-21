import Theme from "../../themes/Theme";

const sizes = {
  small: {
    fontSize: "12px",
  },
  medium: {
    fontSize: "14px",
  },
  large: {
    fontSize: "16px",
  },
  extraLarge: {
    fontSize: "18px",
  },
};

const Styles = {
  Primary: {
    color: Theme.BUTTONCOLORS.ENABLED,
    textDecoration: "none",
    position: "relative",
    "&:after": {
      content: '""',
      position: "absolute",
      width: "100%",
      height: "1px",
      bottom: 0,
      left: 0,
      backgroundColor: Theme.BUTTONCOLORS.ENABLED,
      transform: "scaleX(1)",
      transformOrigin: "bottom left",
      transition: "transform 0.3s ease-in-out",
    },
    "&:hover": {
      color: Theme.BUTTONCOLORS.HOVERED,
      "&:after": {
        backgroundColor: Theme.BUTTONCOLORS.HOVERED,
        transform: "scaleX(0)",
        transformOrigin: "bottom right",
      },
    },
    "&:active": {
      color: Theme.BUTTONCOLORS.SELECTED,
      "&:after": {
        backgroundColor: Theme.BUTTONCOLORS.SELECTED,
      },
    },
    "&[data-disabled]": {
      color: Theme.FONT_COLOURS.GREY,
      cursor: "not-allowed",
      "&:after": {
        backgroundColor: Theme.FONT_COLOURS.GREY,
      },
    },
  },

  Secondary: {
    color: Theme.BUTTONCOLORS.ENABLED,
    textDecoration: "none",
    position: "relative",
    "&:hover": {
      color: Theme.BUTTONCOLORS.HOVERED,
      textDecoration: "underline",
    },
    "&:active": {
      color: Theme.BUTTONCOLORS.SELECTED,
      textDecoration: "underline",
    },
    "&[data-disabled]": {
      color: Theme.FONT_COLOURS.GREY,
      cursor: "not-allowed",
      textDecoration: "none",
    },
  },

  Tertiary: {
    color: Theme.BUTTONCOLORS.ENABLED,
    textDecoration: "none",
    "&:hover": {
      color: Theme.BUTTONCOLORS.HOVERED,
    },
    "&:active": {
      color: Theme.BUTTONCOLORS.SELECTED,
    },
    "&[data-disabled]": {
      color: Theme.FONT_COLOURS.GREY,
      cursor: "not-allowed",
    },
  },
};

export { Styles, sizes };