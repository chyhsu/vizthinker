import React from 'react';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const HeaderBar: React.FC = () => {
  return (
    <Box
      position="absolute"
      top={4}
      left={4}
      zIndex={10}
    >
      <Flex
        justify="space-between"
        align="center"
        p={3}
        borderRadius="lg"
        bg="rgba(255, 255, 255, 0.8)"
        boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
        backdropFilter="blur(8px)"
        minW="fit-content"
        gap={4}
      >
        <Heading
          size="md"
          color="white"
          bg="black"
          px={4}
          py={2}
          borderRadius="md"
          boxShadow="0 6px 20px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)"
          fontWeight="bold"
          letterSpacing="0.5px"
        >
          VizThinker
        </Heading>
        <Button
          as={Link}
          to="/settings"
          variant="ghost"
          size="sm"
          color="black"
          _hover={{ bg: 'rgba(255, 255, 255, 0.9)' }}
        >
          Settings
        </Button>
      </Flex>
    </Box>
  );
};

export default HeaderBar; 