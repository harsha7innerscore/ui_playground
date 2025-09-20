import React from 'react';
import { Button } from '@chakra-ui/react';

export interface TestButtonProps {
  /**
   * Button label
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Test component that uses Chakra UI Button directly
 */
export const TestButton: React.FC<TestButtonProps> = ({
  label,
  ...props
}) => {
  return (
    <Button colorScheme="blue" {...props}>
      {label}
    </Button>
  );
};