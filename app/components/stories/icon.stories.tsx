import {
  Calendar03Icon,
  FileIcon,
  Home01Icon,
  ImageIcon,
  Mail01Icon,
  Notification03Icon,
  SearchList01Icon,
  Settings02Icon,
  UserIcon,
  VideoIcon,
} from '@hugeicons-pro/core-stroke-rounded';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { Icon } from '../ui/icon';

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 12, max: 64, step: 4 },
      description: 'Tamanho do ícone em pixels',
    },
    color: {
      control: 'color',
      description: 'Cor do ícone',
    },
    strokeWidth: {
      control: { type: 'number', min: 0.5, max: 3, step: 0.25 },
      description: 'Espessura do traço',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: Notification03Icon,
  },
};

export const CustomSize: Story = {
  args: {
    icon: Home01Icon,
    size: 32,
  },
};

export const CustomColor: Story = {
  args: {
    icon: Settings02Icon,
    size: 24,
    color: '#3b82f6',
  },
};

export const CustomStroke: Story = {
  args: {
    icon: UserIcon,
    size: 24,
    strokeWidth: 2.5,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Notification03Icon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Notification</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Home01Icon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Home</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Settings02Icon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Settings</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={UserIcon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>User</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={SearchList01Icon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Search</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Mail01Icon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Mail</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Calendar03Icon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Calendar</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={FileIcon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>File</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={ImageIcon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Image</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={VideoIcon} size={24} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>Video</p>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Icon icon={Notification03Icon} size={16} />
      <Icon icon={Notification03Icon} size={24} />
      <Icon icon={Notification03Icon} size={32} />
      <Icon icon={Notification03Icon} size={48} />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <Icon icon={Home01Icon} size={32} color='#ef4444' />
      <Icon icon={Home01Icon} size={32} color='#3b82f6' />
      <Icon icon={Home01Icon} size={32} color='#10b981' />
      <Icon icon={Home01Icon} size={32} color='#f59e0b' />
      <Icon icon={Home01Icon} size={32} color='#8b5cf6' />
    </div>
  ),
};

export const StrokeWidths: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Settings02Icon} size={32} strokeWidth={0.5} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>0.5</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Settings02Icon} size={32} strokeWidth={1} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>1.0</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Settings02Icon} size={32} strokeWidth={1.5} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>1.5</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Settings02Icon} size={32} strokeWidth={2} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>2.0</p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Icon icon={Settings02Icon} size={32} strokeWidth={2.5} />
        <p style={{ fontSize: '12px', marginTop: '8px' }}>2.5</p>
      </div>
    </div>
  ),
};
