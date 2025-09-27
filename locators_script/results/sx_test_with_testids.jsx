import React from 'react';
import { Box, Flex, Text, Button } from '@chakra-ui/react';

const SxTestComponent = () => {
  return (
    <Box sx={{ width: '100%', backgroundColor: 'gray.100', p: 4 }} data-testid='sx-test-box-gray.100-100%'>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }} data-testid='sx-test-flex-box'>
        <Text sx={{ fontSize: 'lg', fontWeight: 'bold', color: 'blue.500' }} data-testid='sx-test-text-flex-blue.500'>
          Profile Information
        </Text>
        <Button
          sx={{
            bg: 'green.400',
            color: 'white',
            _hover: { bg: 'green.500' }
          }}
          onClick={() => console.log('Edit clicked')} data-testid='sx-test-flex-button'>

          Edit Profile
        </Button>
      </Flex>
      <Box
        className="user-details-container"
        sx={{ mt: 4, p: 3, borderRadius: 'md', bg: 'white' }} data-testid='sx-test-box-user-details-container'>

        <Text sx={{ color: 'gray.500', mb: 2 }} data-testid='sx-test-text-flex-blue.500'>User Information</Text>
        <Flex sx={{ gap: 4 }} data-testid='sx-test-flex-box'>
          <Box sx={{ flex: 1 }} data-testid='sx-test-box-gray.100-100%'>
            <Text sx={{ fontWeight: 'semibold' }} data-testid='sx-test-text-flex-blue.500'>Name</Text>
            <Text data-testid='sx-test-text-box-john-doe'>John Doe</Text>
          </Box>
          <Box sx={{ flex: 1 }} data-testid='sx-test-box-gray.100-100%'>
            <Text sx={{ fontWeight: 'semibold' }} data-testid='sx-test-text-flex-blue.500'>Email</Text>
            <Text data-testid='sx-test-text-box-john-doe'>john.doe@example.com</Text>
          </Box>
        </Flex>
      </Box>
    </Box>);

};

export default SxTestComponent;