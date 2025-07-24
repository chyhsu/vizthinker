import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import ChatWindow from './ChatWindow';
import { SettingsProvider } from './SettingsContext';
import ExtendedNode from './ExtendedNode';
import ChatLayout from './ChatLayout';
import AuthPage from './auth';
import ProtectedRoute from './ProtectedRoute';

/**
 * Root application component.
 */
const App: React.FC = () => {
  return (
    <SettingsProvider>
      <BrowserRouter>
      <Box minH="100vh" bg="gray.50">
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/main" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
            <Route index element={<ChatWindow />} />
          </Route>
          {/* Redirect root to auth */}
          <Route path="/" element={<Navigate to="/auth" replace />} />
          {/* Fallback: redirect any unknown or root paths to /auth */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Box>
      </BrowserRouter>
    </SettingsProvider>
  );
};

export default App;
