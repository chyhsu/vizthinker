import React from 'react';
import { Box, Heading } from '@chakra-ui/react';

/**
 * Root application component.
 *
 * At the moment it just renders a placeholder banner so that the project compiles.
 * Extend this component with routes, React Flow canvas, or other UI as needed.
 */
const App: React.FC = () => {
  return (
    <Box p={4} textAlign="center">
      <Heading size="md">Welcome to VizThink AI</Heading>
    </Box>
  );
};

export default App;
