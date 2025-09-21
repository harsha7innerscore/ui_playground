import { Styles, sizes } from "./GlobalButtonV2.styles";

interface GetButtonStylesParams {
  buttonType: any;
  size: any;
  imageSize: any;
  state: string;
  buttonSxOverride?: any;
  leftImgSxOverride?: any;
  rightImgSxOverride?: any;
  buttonCssOverride?: any;
  leftImgCssOverride?: any;
  rightImgCssOverride?: any;
}

export const getButtonStyles = ({
  buttonType,
  size,
  imageSize,
  state,
  // Keeping these for backward compatibility
  buttonSxOverride = {},
  leftImgSxOverride = {},
  rightImgSxOverride = {},
  buttonCssOverride = {},
  leftImgCssOverride = {},
  rightImgCssOverride = {},
}: GetButtonStylesParams) => {
    const baseButtonStyle = { ...(Styles as any)[buttonType] };
    const sizeStyle = (sizes as any)[size] || sizes.medium;
    const imageStyle = (sizes as any)[`${imageSize}Image`] || sizes.mediumImage;

  // Determine overrides based on state
  let stateOverrides = {};
  if (state === "Hovered" ) {
    stateOverrides = baseButtonStyle["&:hover"];
  } else if (state === "Selected" ) {
    stateOverrides = baseButtonStyle["&:active"];
  } else if (state === "Disabled" ) {
    stateOverrides = baseButtonStyle["&[data-disabled]"];
  }

  const buttonCss = {
    ...baseButtonStyle,
    ...stateOverrides,
    ...sizeStyle,
    ...buttonCssOverride,
  };

  if (state === "Disabled") {
    buttonCss["&:hover"] = {
      ...baseButtonStyle["&[data-disabled]"]
    };
  }


  const leftImgCss = {
    ...imageStyle,
    ...leftImgCssOverride,
  };

  const rightImgCss = {
    ...imageStyle,
    ...rightImgCssOverride,
  };

  return { buttonCss, leftImgCss, rightImgCss };
};
