import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import Link, { LinkProps } from "./Link";
import { ArrowForwardIcon, ExternalLinkIcon } from "@chakra-ui/icons";

const meta = {
  title: "Components/Atoms/Link",
  component: Link,
  parameters: {
    docs: {
      description: {
        component: 'A customizable link component built with Chakra UI v3'
      }
    }
  },
  argTypes: {
    linkType: {
      control: 'select',
      options: ['Primary', 'Secondary', 'Tertiary'],
      description: 'The visual style of the link'
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large', 'extraLarge'],
      description: 'The size of the link'
    },
    state: {
      control: 'select',
      options: ['Enabled', 'Disabled'],
      description: 'The state of the link'
    },
    href: {
      control: 'text',
      description: 'The URL the link points to'
    },
    isExternal: {
      control: 'boolean',
      description: 'Whether the link should open in a new tab'
    }
  }
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof Link>;

export const Primary: Story = {
  args: {
    linkType: 'Primary',
    size: 'medium',
    state: "Enabled",
    children: "Primary Link",
    href: "https://chakra-ui.com/",
    onClick: () => alert("Link Clicked!"),
  }
};

export const Secondary: Story = {
  args: {
    linkType: 'Secondary',
    children: "Secondary Link",
    href: "https://chakra-ui.com/",
    onClick: () => alert("Link Clicked!"),
  }
};

export const Tertiary: Story = {
  args: {
    linkType: 'Tertiary',
    children: "Tertiary Link",
    href: "https://chakra-ui.com/",
    onClick: () => alert("Link Clicked!"),
  }
};

export const WithLeftIcon: Story = {
  args: {
    linkType: 'Primary',
    children: "Link with Left Icon",
    href: "https://chakra-ui.com/",
    leftIcon: <ArrowForwardIcon />,
    onClick: () => alert("Link Clicked!"),
  }
};

export const WithRightIcon: Story = {
  args: {
    linkType: 'Primary',
    children: "Link with Right Icon",
    href: "https://chakra-ui.com/",
    rightIcon: <ExternalLinkIcon />,
    onClick: () => alert("Link Clicked!"),
  }
};

export const ExternalLink: Story = {
  args: {
    linkType: 'Primary',
    children: "External Link",
    href: "https://chakra-ui.com/",
    isExternal: true,
    rightIcon: <ExternalLinkIcon />,
  }
};

export const DisabledLink: Story = {
  args: {
    linkType: 'Primary',
    children: "Disabled Link",
    href: "https://chakra-ui.com/",
    state: "Disabled",
  }
};

export const LargeLink: Story = {
  args: {
    linkType: 'Primary',
    size: 'large',
    children: "Large Link",
    href: "https://chakra-ui.com/",
  }
};