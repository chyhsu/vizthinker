import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const Settings: React.FC = () => {
  return (
    <Box p={8} maxW="600px" mx="auto" mt={12} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
      <Heading mb={4} size="lg">Settings</Heading>
      <Text color="gray.600">This is the settings page. Add your configuration options here.</Text>
    </Box>
  );
};

export default Settings;
