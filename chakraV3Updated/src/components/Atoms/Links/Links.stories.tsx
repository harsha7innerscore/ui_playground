import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Links, { LinksProps } from "./Links";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";

const meta: Meta<LinksProps> = {
  title: "Atoms/Links",
  component: Links,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Link text content",
    },
    user: {
      control: { type: "radio" },
      options: ["student", "teacher"],
      description: "User role that determines the default color scheme",
    },
    size: {
      control: { type: "radio" },
      options: ["small", "medium"],
      description: "Controls the font and icon size",
    },
    isUnderlined: {
      control: "boolean",
      description: "Toggle text decoration underline",
    },
    icon: {
      control: { type: "select" },
      options: ["none", "arrow", "external"],
      mapping: {
        none: null,
        arrow: <FiArrowRight />,
        external: <FiExternalLink />,
      },
      description: "Icon displayed on the right side of the link (optional)",
    },
    state: {
      control: { type: "select" },
      options: ["default", "hovered", "focused", "selected", "visited", "disabled"],
      description: "Visual state of the link",
    },
    href: {
      control: "text",
      description: "URL or path for the link",
    },
    isExternal: {
      control: "boolean",
      description: "If true, opens link in new tab with security attributes",
    },
  },
};

export default meta;
type Story = StoryObj<LinksProps>;

export const Default: Story = {
  args: {
    label: "Example Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const TeacherRole: Story = {
  args: {
    label: "Teacher Link",
    user: "teacher",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const StudentRole: Story = {
  args: {
    label: "Student Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const SmallSize: Story = {
  args: {
    label: "Small Link",
    user: "student",
    size: "small",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const MediumSize: Story = {
  args: {
    label: "Medium Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const UnderlinedLink: Story = {
  args: {
    label: "Underlined Link",
    user: "student",
    size: "medium",
    isUnderlined: true,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const NonUnderlinedLink: Story = {
  args: {
    label: "Non-Underlined Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
};

export const LinkWithRightIcon: Story = {
  args: {
    label: "Link with Right Icon",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
    icon: <FiArrowRight />,
  },
};

export const HoveredState: Story = {
  args: {
    label: "Hovered State Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "hovered",
    href: "#",
    isExternal: false,
  },
};

export const FocusedState: Story = {
  args: {
    label: "Focused State Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "focused",
    href: "#",
    isExternal: false,
  },
};

export const VisitedState: Story = {
  args: {
    label: "Visited State Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "visited",
    href: "#",
    isExternal: false,
  },
};

export const DisabledState: Story = {
  args: {
    label: "Disabled State Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "disabled",
    href: "#",
    isExternal: false,
  },
};

export const WithStyleOverrides: Story = {
  args: {
    label: "Custom Styled Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
    styleOverrides: {
      fontWeight: "bold",
      color: "purple.500",
      textDecoration: "wavy underline",
    },
  },
};