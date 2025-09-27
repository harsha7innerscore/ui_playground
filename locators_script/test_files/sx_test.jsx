import React from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';

const SxTestComponent = () => {
  return (
    <Box sx={{ width: '100%', backgroundColor: 'gray.100', p: 4 }}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text sx={{ fontSize: 'lg', fontWeight: 'bold', color: 'blue.500' }}>
          Profile Information
        </Text>
        <Button
          sx={{
            bg: 'green.400',
            color: 'white',
            _hover: { bg: 'green.500' }
          }}
          onClick={() => console.log('Edit clicked')}
        >
          Edit Profile
        </Button>
      </Flex>
      <Box
        className="user-details-container"
        sx={{ mt: 4, p: 3, borderRadius: 'md', bg: 'white' }}
      >
        <Text sx={{ color: 'gray.500', mb: 2 }}>User Information</Text>
        <Flex sx={{ gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontWeight: 'semibold' }}>Name</Text>
            <Text>John Doe</Text>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Text sx={{ fontWeight: 'semibold' }}>Email</Text>
            <Text>john.doe@example.com</Text>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default SxTestComponent;