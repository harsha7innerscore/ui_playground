import React from "react";
import { Link as ChakraLink, Icon, forwardRef } from "@chakra-ui/react";
import { Styles, sizes } from "./Link.styles";

export interface LinkProps {
  href: string;
  children: React.ReactNode;
  leftIcon?: React.ReactElement;
  rightIcon?: React.ReactElement;
  onClick?: () => void;

  // Style logic props
  linkType?: "Primary" | "Secondary" | "Tertiary";
  size?: "small" | "medium" | "large" | "extraLarge";
  state?: "Enabled" | "Disabled";

  // Optional overrides
  linkCss?: any;
  leftIconCss?: any;
  rightIconCss?: any;

  // Additional props
  isExternal?: boolean;
  className?: string;
  id?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  download?: boolean | string;
}

const getLinkStyles = ({
  linkType = "Primary",
  size = "medium",
  state = "Enabled",
  linkCssOverride = {},
  leftIconCssOverride = {},
  rightIconCssOverride = {},
}: {
  linkType: LinkProps["linkType"];
  size: LinkProps["size"];
  state: LinkProps["state"];
  linkCssOverride?: any;
  leftIconCssOverride?: any;
  rightIconCssOverride?: any;
}) => {
  const baseLinkStyle = { ...(Styles as any)[linkType] };
  const sizeStyle = (sizes as any)[size] || sizes.medium;

  // Determine overrides based on state
  let stateOverrides = {};
  if (state === "Disabled") {
    stateOverrides = baseLinkStyle["&[data-disabled]"];
  }

  const linkCss = {
    ...baseLinkStyle,
    ...stateOverrides,
    ...sizeStyle,
    ...linkCssOverride,
  };

  const iconCss = {
    verticalAlign: "middle",
    mx: "0.5rem",
  };

  const leftIconCss = {
    ...iconCss,
    ml: 0,
    mr: "0.5rem",
    ...leftIconCssOverride,
  };

  const rightIconCss = {
    ...iconCss,
    ml: "0.5rem",
    mr: 0,
    ...rightIconCssOverride,
  };

  return { linkCss, leftIconCss, rightIconCss };
};

const Link = forwardRef<LinkProps, "a">((props, ref) => {
  const {
    href,
    children,
    leftIcon,
    rightIcon,
    onClick,
    linkType = "Primary",
    size = "medium",
    state = "Enabled",
    linkCss: linkCssOverride,
    leftIconCss: leftIconCssOverride,
    rightIconCss: rightIconCssOverride,
    isExternal,
    className,
    id,
    target,
    rel,
    download,
    ...rest
  } = props;

  const { linkCss, leftIconCss, rightIconCss } = getLinkStyles({
    linkType,
    size,
    state,
    linkCssOverride,
    leftIconCssOverride,
    rightIconCssOverride,
  });

  // Combine target and rel for external links
  const finalTarget = isExternal ? "_blank" : target;
  const finalRel = isExternal ? "noopener noreferrer" : rel;

  return (
    <ChakraLink
      ref={ref}
      href={state === "Disabled" ? undefined : href}
      onClick={state === "Disabled" ? undefined : onClick}
      variant="plain"
      css={linkCss}
      target={finalTarget}
      rel={finalRel}
      download={download}
      data-disabled={state === "Disabled" ? true : undefined}
      className={className}
      id={id}
      {...rest}
    >
      {leftIcon && <Icon as={leftIcon.type} css={leftIconCss} />}
      {children}
      {rightIcon && <Icon as={rightIcon.type} css={rightIconCss} />}
    </ChakraLink>
  );
});

Link.displayName = "Link";

export default Link;