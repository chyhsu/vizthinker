import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, Flex, Text, Avatar, VStack, Button, IconButton, useToast } from '@chakra-ui/react';
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
import useStore from '../typejs/store';
import { AiOutlineDelete } from 'react-icons/ai';

const ChatNode = ({ data, id }) => {
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { chatNodeColor, fontColor } = useSettings();
  const { selectedNodeId, setSelectedNodeId, deleteNode } = useStore();
  const { prompt, response } = data;
  const toast = useToast();

  const promptTooLong = prompt.length > 100;
  const responseTooLong = response.length > 100;
  const isSelected = selectedNodeId === id;

  const handleNodeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedNodeId(isSelected ? null : id);
  };

  const handleDeleteNode = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteNode(id);
      toast({
        title: "Node deleted",
        description: "Node and all its child nodes have been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete node, please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <VStack
        {...chatNodeVStackStyle}
        sx={{ 
          backgroundColor: chatNodeColor,
          border: isSelected ? '3px solid #4299e1' : '1px solid transparent',
          boxShadow: isSelected ? '0 0 10px rgba(66, 153, 225, 0.5)' : 'none',
          position: 'relative'
        }}
        onClick={handleNodeClick}
        cursor="pointer"
      >
        {/* Delete Button - only show when selected */}
        {isSelected && (
          <IconButton
            aria-label="Delete Node"
            icon={<AiOutlineDelete />}
            size="xs"
            colorScheme="red"
            variant="solid"
            position="absolute"
            top="2px"
            right="2px"
            onClick={handleDeleteNode}
            isLoading={isDeleting}
            zIndex={10}
            _hover={{ transform: 'scale(1.1)' }}
          />
        )}

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
