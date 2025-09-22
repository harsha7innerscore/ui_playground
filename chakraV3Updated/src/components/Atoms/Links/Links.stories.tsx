import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Links, { LinksProps } from "./Links";
import { FiArrowRight, FiExternalLink } from "react-icons/fi";

const meta: Meta<LinksProps> = {
  title: "Atoms/Links",
  component: Links,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Link component with automatic state transitions. Hover and focus states are handled automatically through CSS."
      }
    }
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
      options: ["default", "visited", "disabled"],
      description: "Visual state of the link",
    },
    isSelected: {
      control: "boolean",
      description: "Set link as selected",
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

export const FigmaDefault: Story = {
  args: {
    label: "default/link/small.com",
    user: "student",
    size: "small",
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
    label: "default/link/small.com",
    user: "student",
    size: "small",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Small link with 12px font size and 14px line height. Hover to see the underline effect."
      }
    }
  }
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

export const HoverableLink: Story = {
  args: {
    label: "hovered/link/small.com",
    user: "student",
    size: "small",
    isUnderlined: false,
    state: "default",
    href: "#",
    isExternal: false,
  },
  parameters: {
    docs: {
      description: {
        story: "This link will show underline on hover automatically. Try hovering over it."
      }
    }
  }
};

export const SelectedLink: Story = {
  args: {
    label: "Selected Link",
    user: "student",
    size: "medium",
    isUnderlined: false,
    state: "default",
    isSelected: true,
    href: "#",
    isExternal: false,
  },
  parameters: {
    docs: {
      description: {
        story: "This link has the selected state applied (bold and underlined)."
      }
    }
  }
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