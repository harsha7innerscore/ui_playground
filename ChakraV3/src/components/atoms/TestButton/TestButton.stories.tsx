import type { Meta, StoryObj } from '@storybook/react';
import { TestButton } from './TestButton';

const meta = {
  title: 'Atoms/TestButton',
  component: TestButton,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof TestButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Test Button',
  },
};