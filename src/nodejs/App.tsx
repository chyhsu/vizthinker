import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, Flex, Button } from '@chakra-ui/react';
import ChatWindow from './ChatWindow';
import Settings from './Settings';

/**
 * Root application component.
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Box minH="100vh" bg="gray.50">
        {/* Navigation bar */}
        <Flex as="nav" bg="blue.600" color="white" px={8} py={4} align="center" mb={8}>
          <Button as={Link} to="/" colorScheme="blue" variant="ghost" mr={4} _hover={{ bg: 'blue.700' }}>
            Chat
          </Button>
          <Button as={Link} to="/settings" colorScheme="blue" variant="ghost" _hover={{ bg: 'blue.700' }}>
            Settings
          </Button>
        </Flex>
        <Routes>
          <Route path="/" element={<ChatWindow />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

export default App;
