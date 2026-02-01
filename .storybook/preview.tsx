import type { Preview } from '@storybook/nextjs-vite';
import { themes } from 'storybook/theming';
import '../app/globals.css';

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'dark',
    toolbar: {
      icon: 'mirror',
      items: [
        { value: 'light', title: 'Light' },
        { value: 'dark', title: 'Dark' },
      ],
    },
  },
};

const preview: Preview = {
  decorators: [
      (Story, context) => {
        const theme = context.globals.theme;

        return (
          <div
            className={theme === 'dark' ? 'dark' : ''}
            style={{
              minHeight: '100vh',
              width: '100%',
            }}
          >
            <Story />
          </div>
        );
      },
  ],

  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    docs: {
      theme: themes.dark,
    },

    layout: 'centered',
    a11y: {
      test: 'todo'
    }
  },
};

export default preview;
