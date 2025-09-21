import React from "react";
import { Story, Meta } from "@storybook/react";
import GlobalButtonV2, { GlobalButtonV2Props } from "../../Atoms/GlobalButtonV2/GlobalButtonV2";
import Arrow from "../../../assests/floatingButton/IconFB.svg";
// import Styles from "./GlobalButtonV2.styles"

export default {
    title: "Components/Atoms/GlobalButtonV2",
    component: GlobalButtonV2,
} as Meta;

type TemplateArgs = GlobalButtonV2Props;

const Template: Story<TemplateArgs> = (args) => (
    <GlobalButtonV2 {...args}></GlobalButtonV2>
);
export const Default = Template.bind({});
Default.args = {
    leftImg: Arrow,
    rightImg: Arrow,
    buttonText: "Default Button",
    onClick: () => alert("Button Clicked!"),
    buttonSx: 'Styles.nrcne',
    leftImgSx: 'Styles.leftImg',
    rightImgSx: 'Styles.rightImg',
    state: "Enabled",
}