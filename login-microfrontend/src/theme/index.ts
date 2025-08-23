import { createSystem, defaultConfig } from '@chakra-ui/react';

const customConfig = {
  ...defaultConfig,
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f3ff' },
          100: { value: '#bae0ff' },
          200: { value: '#8dccff' },
          300: { value: '#61b8ff' },
          400: { value: '#34a4ff' },
          500: { value: '#0890ff' },
          600: { value: '#0073cc' },
          700: { value: '#005699' },
          800: { value: '#003966' },
          900: { value: '#001c33' },
        },
      },
    },
  },
};

export const system = createSystem(customConfig);
export default system;