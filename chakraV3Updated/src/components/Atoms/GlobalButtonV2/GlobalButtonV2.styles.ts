import Theme from "../../themes/Theme";

const sizes = {
    small: {
        height: "32px",
        px: "12px",
        fontSize: "12px",
    },
    smallImage: {
        width: "14px",
        height: "14px",
        margin: "4px",
    },
    medium: {
        height: "40px",
        px: "16px",
        fontSize: "14px",
    },
    mediumImage: {
        width: "16px",
        height: "16px",
        margin: "4px",
    },
    large: {
        height: "48px",
        px: "20px",
        fontSize: "16px",
    },
    largeImage: {
        width: "20px",
        height: "20px",
        margin: "4px",
    },
    extraLarge: {
        height: "56px",
        px: "24px",
        fontSize: "18px",
    },
    extraLargeImage: {
        width: "24px",
        height: "24px",
        margin: "4px",
    },
};

const Styles = {
    Primary: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        backgroundColor: Theme.BUTTONCOLORS.ENABLED,
        border: "1px solid white",
        borderRadius: "8px",
        margin: "5px",
        py: "10px",
        "&:hover": {
          backgroundColor: Theme.BUTTONCOLORS.HOVERED,
          border: "none",
        },
        "&:active": {
          backgroundColor: Theme.BUTTONCOLORS.SELECTED,
          border: "none",
        },
        "&[data-disabled]": {
          color: Theme.FONT_COLOURS.GREY,
          backgroundColor: Theme.BUTTONCOLORS.DISABLED,
          border: "none",
          cursor: "not-allowed",
        },
      },
    
      Secondary: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: Theme.BUTTONCOLORS.ENABLED,
        backgroundColor: "white",
        border: "2px solid " + Theme.BUTTONCOLORS.ENABLED,
        borderRadius: "8px",
        margin: "5px",
        py: "10px",
        "&:hover": {
          color: Theme.BUTTONCOLORS.HOVERED,
          border: "1px solid " + Theme.BUTTONCOLORS.HOVERED,
        },
        "&:active": {
          color: Theme.BUTTONCOLORS.SELECTED,
          border: "1px solid " + Theme.BUTTONCOLORS.SELECTED,
        },
        "&[data-disabled]": {
          color: Theme.FONT_COLOURS.GREY,
          border: "1px solid " + Theme.FONT_COLOURS.GREY,
          cursor: "not-allowed",
        },
      },
    
      Tertiary: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: Theme.BUTTONCOLORS.ENABLED,
        backgroundColor: "white",
        border: "1px solid white",
        borderRadius: "8px",
        margin: "5px",
        py: "10px",
        "&:hover": {
          backgroundColor: Theme.BUTTONCOLORS.HOVERED_TERTIARY,
          border: "none",
        },
        "&:active": {
          backgroundColor: Theme.BUTTONCOLORS.SELECTED_TERTIARY,
          border: "none",
        },
        "&[data-disabled]": {
          color: Theme.FONT_COLOURS.GREY,
          border: "none",
          cursor: "not-allowed",
        },
      },
}

export { Styles, sizes }; 