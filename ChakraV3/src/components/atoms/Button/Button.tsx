import React from 'react';
import { Button as ChakraButton, ButtonProps as ChakraButtonProps } from '@chakra-ui/react';

export interface ButtonProps extends Omit<ChakraButtonProps, 'size'> {
  /**
   * Button label
   */
  label: string;
  /**
   * Button size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /**
   * Button variant
   */
  variant?: 'solid' | 'outline' | 'ghost' | 'link';
  /**
   * Color scheme
   */
  colorScheme?: string;
}

/**
 * Primary UI component for user interaction
 */
export const Button: React.FC<ButtonProps> = ({
  label,
  size = 'md',
  variant = 'solid',
  colorScheme = 'blue',
  ...props
}) => {
  return (
    <ChakraButton
      size={size}
      variant={variant}
      colorScheme={colorScheme}
      {...props}
    >
      {label}
    </ChakraButton>
  );
};