import { useState } from 'react'
import { Box, Button, Heading, Text, VStack, HStack, Image } from '@chakra-ui/react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Box textAlign="center" py={10} px={6}>
      <VStack spacing={8}>
        <HStack spacing={4}>
          <a href="https://vite.dev" target="_blank">
            <Image src={viteLogo} h="6rem" alt="Vite logo" />
          </a>
          <a href="https://react.dev" target="_blank">
            <Image src={reactLogo} h="6rem" alt="React logo" />
          </a>
        </HStack>
        
        <Heading size="2xl" bgGradient="linear(to-l, #7928CA, #FF0080)" bgClip="text">
          Vite + React
        </Heading>
        
        <Box p={6} borderRadius="lg" border="1px" borderColor="gray.200">
          <Button 
            colorScheme="blue" 
            onClick={() => setCount((count) => count + 1)}
            mb={4}
          >
            count is {count}
          </Button>
          <Text>
            Edit <Text as="code">src/App.tsx</Text> and save to test HMR
          </Text>
        </Box>
        
        <Text color="gray.500">
          Click on the Vite and React logos to learn more
        </Text>
      </VStack>
    </Box>
  )
}

export default App
