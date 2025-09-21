import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import GlobalButtonV2, { GlobalButtonV2Props } from "../../Atoms/GlobalButtonV2/GlobalButtonV2";
import Arrow from "../../../assests/floatingButton/IconFB.svg";
// import Styles from "./GlobalButtonV2.styles"

const meta = {
    title: "Components/Atoms/GlobalButtonV2",
    component: GlobalButtonV2,
    parameters: {
        docs: {
            description: {
                component: 'A customizable button component updated for Chakra UI v3 compatibility'
            }
        }
    },
    argTypes: {
        buttonType: {
            control: 'select',
            options: ['Primary', 'Secondary', 'Tertiary'],
            description: 'The visual style of the button'
        },
        size: {
            control: 'select',
            options: ['Small', 'Medium', 'Large', 'ExtraLarge'],
            description: 'The size of the button'
        },
        state: {
            control: 'select',
            options: ['Enabled', 'Hovered', 'Selected', 'Disabled'],
            description: 'The state of the button'
        }
    }
} satisfies Meta<typeof GlobalButtonV2>;

export default meta;
type Story = StoryObj<typeof GlobalButtonV2>;

export const Primary: Story = {
    args: {
        buttonType: 'Primary',
        size: 'Medium',
        imageSize: 'Medium',
        state: "Enabled",
        buttonText: "Primary Button",
        onClick: () => alert("Primary Button Clicked!"),
    }
};

export const Secondary: Story = {
    args: {
        buttonType: 'Secondary',
        buttonText: "Secondary Button",
        onClick: () => alert("Secondary Button Clicked!"),
    }
};

export const Tertiary: Story = {
    args: {
        buttonType: 'Tertiary',
        buttonText: "Tertiary Button",
        onClick: () => alert("Tertiary Button Clicked!"),
    }
};

export const WithIcons: Story = {
    args: {
        leftImg: Arrow,
        rightImg: Arrow,
        buttonText: "Default Button",
        onClick: () => alert("Button Clicked!"),
        buttonCss: {}, // Using the new prop name
        leftImgCss: {},
        rightImgCss: {},
        state: "Enabled",
    }
};