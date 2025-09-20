import { useState } from 'react'
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Container centerContent py={10}>
      <VStack gap={6}>
        <Heading as="h1" size="xl">Chakra UI v3 + Vite + React</Heading>

        <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
          <VStack gap={4}>
            <Button
              colorScheme="blue"
              onClick={() => setCount((count) => count + 1)}
            >
              count is {count}
            </Button>

            <Text>
              Edit <code>src/App.tsx</code> and save to test HMR
            </Text>
          </VStack>
        </Box>

        <Text fontSize="sm" color="gray.500">
          Click on the Vite and React logos to learn more
        </Text>
      </VStack>
    </Container>
  )
}

export default App