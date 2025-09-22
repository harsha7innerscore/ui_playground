import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Button, { ButtonProps } from "./Button";
import { FiArrowRight, FiDownload, FiUpload, FiPlus } from "react-icons/fi";

const meta: Meta<ButtonProps> = {
  title: "Atoms/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A customizable button component built on top of Chakra UI's latest version, supporting multiple themes, sizes, types, states, and optional left/right icons."
      }
    }
  },
  tags: ["autodocs"],
  argTypes: {
    user: {
      control: { type: "select" },
      options: ["StudentLight", "StudentDark", "TeacherLight", "TeacherDark", "Danger"],
      description: "Defines the user-specific or contextual variant of the button",
    },
    size: {
      control: { type: "select" },
      options: ["small", "medium", "large", "extra-large"],
      description: "Specifies the size of the button, including text and icon dimensions",
    },
    buttonType: {
      control: { type: "select" },
      options: ["primary", "secondary", "tertiary"],
      description: "Defines the style variation of the button",
    },
    buttonState: {
      control: { type: "select" },
      options: ["default", "disabled"],
      description: "Determines whether the button is interactive (default) or non-interactive (disabled)",
    },
    text: {
      control: "text",
      description: "The text label displayed at the center of the button",
    },
    leftImage: {
      control: { type: "select" },
      options: ["none", "arrow", "download", "upload", "plus"],
      mapping: {
        none: null,
        arrow: <FiArrowRight />,
        download: <FiDownload />,
        upload: <FiUpload />,
        plus: <FiPlus />,
      },
      description: "A React element positioned before the button text",
    },
    rightImage: {
      control: { type: "select" },
      options: ["none", "arrow", "download", "upload", "plus"],
      mapping: {
        none: null,
        arrow: <FiArrowRight />,
        download: <FiDownload />,
        upload: <FiUpload />,
        plus: <FiPlus />,
      },
      description: "A React element positioned after the button text",
    },
    imageSize: {
      control: { type: "select" },
      options: ["small", "medium", "large", "extra-large"],
      description: "Controls the size of left and right images/icons relative to the button size",
    },
    isSelected: {
      control: "boolean",
      description: "Set button as selected (applies a border)",
    },
    styleOverrides: {
      control: "object",
      description: "Optional custom style overrides applied on top of the predefined styles",
    },
  },
};

export default meta;
type Story = StoryObj<ButtonProps>;

// Default Story
export const Default: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Button",
  },
};

// Student Light Variants
export const StudentLightPrimary: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Student Light Primary",
  },
};

export const StudentLightSecondary: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "secondary",
    buttonState: "default",
    text: "Student Light Secondary",
  },
};

export const StudentLightTertiary: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "tertiary",
    buttonState: "default",
    text: "Student Light Tertiary",
  },
};

// Student Dark Variants
export const StudentDarkPrimary: Story = {
  args: {
    user: "StudentDark",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Student Dark Primary",
  },
};

export const StudentDarkSecondary: Story = {
  args: {
    user: "StudentDark",
    size: "medium",
    buttonType: "secondary",
    buttonState: "default",
    text: "Student Dark Secondary",
  },
};

// Teacher Light Variants
export const TeacherLightPrimary: Story = {
  args: {
    user: "TeacherLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Teacher Light Primary",
  },
};

export const TeacherLightSecondary: Story = {
  args: {
    user: "TeacherLight",
    size: "medium",
    buttonType: "secondary",
    buttonState: "default",
    text: "Teacher Light Secondary",
  },
};

// Teacher Dark Variants
export const TeacherDarkPrimary: Story = {
  args: {
    user: "TeacherDark",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Teacher Dark Primary",
  },
};

export const TeacherDarkFigmaExample: Story = {
  args: {
    user: "TeacherDark",
    size: "small",
    buttonType: "primary",
    buttonState: "default",
    text: "P. Default",
    leftImage: <FiPlus />,
    rightImage: <FiArrowRight />,
  },
  parameters: {
    docs: {
      description: {
        story: "TeacherDark button exactly as shown in the Figma design, with small size, plus icon on the left, and arrow icon on the right."
      }
    }
  }
};

export const TeacherDarkHoveredFigmaExample: Story = {
  args: {
    user: "TeacherDark",
    size: "small",
    buttonType: "primary",
    buttonState: "default",
    text: "P. Hovered",
    leftImage: <FiPlus />,
    rightImage: <FiArrowRight />,
  },
  parameters: {
    pseudo: { hover: true },
    docs: {
      description: {
        story: "TeacherDark button in hover state as shown in the Figma design (Success/Dark/400: #9ccc65). The hover effect is visible when previewing this story in Storybook."
      }
    }
  }
};

// Danger Variant
export const DangerButton: Story = {
  args: {
    user: "Danger",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Danger Button",
  },
};

// Size Variants
export const SmallButton: Story = {
  args: {
    user: "StudentLight",
    size: "small",
    buttonType: "primary",
    buttonState: "default",
    text: "Small Button",
  },
};

export const MediumButton: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Medium Button",
  },
};

export const LargeButton: Story = {
  args: {
    user: "StudentLight",
    size: "large",
    buttonType: "primary",
    buttonState: "default",
    text: "Large Button",
  },
};

export const ExtraLargeButton: Story = {
  args: {
    user: "StudentLight",
    size: "extra-large",
    buttonType: "primary",
    buttonState: "default",
    text: "Extra Large Button",
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "With Left Icon",
    leftImage: <FiArrowRight />,
  },
};

export const WithRightIcon: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "With Right Icon",
    rightImage: <FiArrowRight />,
  },
};

export const WithBothIcons: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "With Both Icons",
    leftImage: <FiUpload />,
    rightImage: <FiArrowRight />,
  },
};

// States
export const DisabledButton: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "disabled",
    text: "Disabled Button",
  },
};

export const SelectedButton: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Selected Button",
    isSelected: true,
  },
};

export const WithStyleOverrides: Story = {
  args: {
    user: "StudentLight",
    size: "medium",
    buttonType: "primary",
    buttonState: "default",
    text: "Custom Styled Button",
    styleOverrides: {
      backgroundColor: "purple.500",
      color: "white",
      borderRadius: "20px",
      fontWeight: 800,
    },
  },
};