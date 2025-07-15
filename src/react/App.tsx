import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import ChatWindow from './ChatWindow';
import { SettingsProvider } from './SettingsContext';
import Settings from './Settings';
import ExtendedNode from './extendedNode';

/**
 * Root application component.
 */
const App: React.FC = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
      <Box minH="100vh" bg="gray.50">
        <Routes>
          <Route path="/" element={<ChatWindow />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat/:id" element={<ExtendedNode />} />
        </Routes>
      </Box>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
