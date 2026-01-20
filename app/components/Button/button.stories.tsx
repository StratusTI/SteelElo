import type { Meta, StoryObj } from '@storybook/nextjs';
import Button from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    label: 'Botão Primário',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Botão Secundário',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    label: 'Excluir',
    variant: 'danger',
  },
};

export const Disabled: Story = {
  args: {
    label: 'Desabilitado',
    disabled: true,
  },
};
