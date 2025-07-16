import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Flex, Text, Avatar, VStack, Button } from '@chakra-ui/react';
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
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  const { chatNodeColor, fontColor } = useSettings();
  const { prompt, response } = data;

  const promptTooLong = prompt.length > 100;
  const responseTooLong = response.length > 100;

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
          <Text>{promptTooLong && !isPromptExpanded ? `${prompt.slice(0, 100)}...` : prompt}</Text>
          {promptTooLong && (
            <Button
              size="xs"
              variant="link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPromptExpanded(!isPromptExpanded);
              }}
              mt={1}
            >
              {isPromptExpanded ? 'Show Less' : 'Show More'}
            </Button>
          )}
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
            {responseTooLong && !isResponseExpanded ? `${response.slice(0, 150)}...` : response}
          </ReactMarkdown>
          {responseTooLong && (
            <Button
              size="xs"
              variant="link"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsResponseExpanded(!isResponseExpanded);
              }}
              mt={1}
            >
              {isResponseExpanded ? 'Show Less' : 'Show More'}
            </Button>
          )}
        </Box>
      </Flex>
    </VStack>
      <Handle type="source" position={Position.Bottom} />
    </>
  );
};

export default ChatNode;
