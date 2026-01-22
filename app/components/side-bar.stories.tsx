import type { Meta, StoryObj } from '@storybook/nextjs';
import { SideBar } from './side-bar';

const meta: Meta<typeof SideBar> = {
  title: 'Components/SideBar',
  component: SideBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SideBar>;

export const View: Story = { };
