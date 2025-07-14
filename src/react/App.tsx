import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import ChatWindow from './ChatWindow';
import Settings from './Settings';

/**
 * Root application component.
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Box minH="100vh" bg="gray.50">
        <Routes>
          <Route path="/" element={<ChatWindow />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};

export default App;
