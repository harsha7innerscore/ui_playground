import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  colors: {
    brand: {
      50: '#e6f3ff',
      100: '#bae0ff',
      200: '#8dccff',
      300: '#61b8ff',
      400: '#34a4ff',
      500: '#0890ff',
      600: '#0073cc',
      700: '#005699',
      800: '#003966',
      900: '#001c33',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'md',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorScheme === 'blue' ? 'brand.500' : undefined,
          color: 'white',
          _hover: {
            bg: props.colorScheme === 'blue' ? 'brand.600' : undefined,
          },
        }),
      },
    },
    FormControl: {
      baseStyle: (props: any) => ({
        label: {
          color: props.colorMode === 'dark' ? 'gray.200' : 'gray.700',
          fontWeight: 'medium',
        },
      }),
    },
    Input: {
      variants: {
        outline: (props: any) => ({
          field: {
            borderColor: props.colorMode === 'dark' ? 'gray.600' : 'gray.200',
            bg: props.colorMode === 'dark' ? 'gray.700' : 'white',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'gray.500' : 'gray.300',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: `0 0 0 1px ${props.theme.colors.brand[500]}`,
            },
          },
        }),
      },
    },
    Alert: {
      variants: {
        solid: (props: any) => {
          const { status } = props;
          return {
            container: {
              bg: status === 'error' ? 'red.500' : 'blue.500',
              color: 'white',
            },
          };
        },
      },
    },
  },
});

export default theme;