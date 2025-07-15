import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Flex, Text, Avatar, VStack } from '@chakra-ui/react';
import {
  chatNodeVStackStyle,
  chatNodeUserFlexStyle,
  chatNodeUserBoxStyle,
  chatNodeUserAvatarStyle,
  chatNodeAIFlexStyle,
  chatNodeAIBoxStyle,
  chatNodeAIAvatarStyle
} from '../typejs/style';
import { useSettings } from './SettingsContext';
import { Handle, Position } from 'reactflow';

const ChatNode = ({ data }) => {
  const { chatNodeColor, fontColor } = useSettings();
  const { prompt, response } = data;
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <VStack
        {...chatNodeVStackStyle}
        sx={{ backgroundColor: chatNodeColor }}
      >
      {/* User Prompt */}
      <Flex {...chatNodeUserFlexStyle}>
        <Box
          {...chatNodeUserBoxStyle}
          color={fontColor}
        >
          <Text>{prompt.length > 100 ? prompt.slice(0, 100) + '...' : prompt}</Text>
        </Box>
        <Avatar {...chatNodeUserAvatarStyle} />
      </Flex>

      {/* AI Response */}
      <Flex {...chatNodeAIFlexStyle}>
        <Avatar {...chatNodeAIAvatarStyle} />
        <Box
          {...chatNodeAIBoxStyle}
          color={fontColor}
        >
          <ReactMarkdown
            components={{
              p: ({ children }) => <Text>{children}</Text>,
              strong: ({ children }) => <Text as="strong">{children}</Text>,
              em: ({ children }) => <Text as="em">{children}</Text>,
              li: ({ children }) => <Text as="li" ml={4} listStyleType="disc">{children}</Text>,
            }}
          >
            {response.length > 100 ? response.slice(0, 100) + '...' : response}
          </ReactMarkdown>
        </Box>
      </Flex>
    </VStack>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default ChatNode;
