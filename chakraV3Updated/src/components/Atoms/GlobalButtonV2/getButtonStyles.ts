import { Styles, sizes } from "./GlobalButtonV2.styles";

interface GetButtonStylesParams {
  buttonType: any;
  size: any;
  imageSize: any;
  state: string;
  buttonSxOverride?: any;
  leftImgSxOverride?: any;
  rightImgSxOverride?: any;
}

export const getButtonStyles = ({
  buttonType,
  size,
  imageSize,
  state,
  buttonSxOverride,
  leftImgSxOverride,
  rightImgSxOverride,
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
    stateOverrides = baseButtonStyle["&:disabled"];
  }

  const buttonSx = {
    ...baseButtonStyle,
    ...stateOverrides,
    ...sizeStyle,              
    ...buttonSxOverride,
  };

  if (state === "Disabled") {
    buttonSx["&:hover"] = {
      ...baseButtonStyle["&:disabled"]
    };
  }


  const leftImgSx = {
    ...imageStyle,
    ...leftImgSxOverride,
  };

  const rightImgSx = {
    ...imageStyle,
    ...rightImgSxOverride,
  };

  return { buttonSx, leftImgSx, rightImgSx };
};
