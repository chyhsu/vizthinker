import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Flex, Text, Avatar, VStack } from '@chakra-ui/react';

interface ChatNodeProps {
  prompt: string;
  response: string;
}

const ChatNode: React.FC<ChatNodeProps> = ({ prompt, response }) => {
  return (
    <VStack
      spacing={4}
      align="stretch"
      w="70%"
      p={4}
      borderRadius="2xl"
      sx={{
        backgroundColor: 'rgba(1, 3, 7, 0.2)',
        backdropFilter: 'blur(5px)',
      }}
    >
      {/* User Prompt */}
      <Flex w="100%" justify="flex-end">
        <Box
          px={4}
          py={2}
          borderRadius="2xl"
          maxWidth="70%"
          color="white"
        >
          <Text>{prompt}</Text>
        </Box>
        <Avatar size="sm" ml={2} name="You" bg="blue.500" />
      </Flex>

      {/* AI Response */}
      <Flex w="100%" justify="flex-start">
        <Avatar size="sm" mr={2} name="VizThink AI" />
        <Box
          px={4}
          py={2}
          borderRadius="lg"
          maxWidth="70%"
          color="white"
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <Text>{children}</Text>,
              strong: ({ children }) => <Text as="strong">{children}</Text>,
              em: ({ children }) => <Text as="em">{children}</Text>,
              li: ({ children }) => <Text as="li" ml={4} listStyleType="disc">{children}</Text>,
            }}
          >
            {response}
          </ReactMarkdown>
        </Box>
      </Flex>
    </VStack>
  );
};

export default ChatNode;
