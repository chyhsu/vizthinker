import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, IconButton, Flex, VStack, Avatar, Input, Button, useToast, chakra, Spinner } from '@chakra-ui/react';
import {
  extendedNodeBackButtonStyle,
  extendedNodeCenterFlexStyle,
  extendedNodeInputFlexStyle,
  extendedNodeInputStyle,
  extendedNodeSendButtonStyle,
  // Add chatNode styles
  chatNodeVStackStyle,
  chatNodeUserFlexStyle,
  chatNodeUserBoxStyle,
  chatNodeUserAvatarStyle,
  chatNodeAIFlexStyle,
  chatNodeAIBoxStyle,
  chatNodeAIAvatarStyle,
  // Add settings card style
  settingsCardBoxStyle
} from '../typejs/style';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { AiOutlineArrowLeft, AiOutlineDelete } from 'react-icons/ai';
import { useSettings } from './SettingsContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useStore from '../typejs/store';


export interface ExtendedNodeProps {
  nodeId: string;
  onClose: () => void;
}
const ExtendedNode: React.FC<ExtendedNodeProps> = ({ nodeId, onClose }) => {
  const { nodes, sendMessage, deleteNode } = useStore();
  const selectedNode = nodeId ? nodes.find(n => n.id === nodeId) : null;
  const nodeData = selectedNode?.data ?? { prompt: '', response: '', isLoading: false };
  const { backgroundImage, chatNodeColor, fontColor, provider, providerModels } = useSettings();
  // Width state for horizontal resize
  const [panelWidth, setPanelWidth] = useState<number>(500);
  const resizeActive = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(500);

  // Mouse move / up listeners
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeActive.current) return;
      const delta = startX.current - e.clientX;
      const newWidth = Math.min(Math.max(320, startWidth.current + delta), window.innerWidth - 100);
      setPanelWidth(newWidth);
    };
    const onUp = () => {
      resizeActive.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent) => {
    resizeActive.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = 'ew-resize';
  };
  const [inputValue, setInputValue] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    const selectedModel = providerModels[provider as keyof typeof providerModels];
    await sendMessage(inputValue, provider, nodeId, false, selectedModel);
    setInputValue('');
  };

  const handleBranch = async () => {
    if (inputValue.trim() === '') return;
    const selectedModel = providerModels[provider as keyof typeof providerModels];
    await sendMessage(inputValue, provider, nodeId, true, selectedModel);
    setInputValue('');
  };

  const handleDeleteNode = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteNode(nodeId);
      toast({
        title: "Node deleted",
        description: "Node and all its child nodes have been successfully deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose(); // Close the extended view after deletion
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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Helper function to determine if background is a11yDark for text color
  const isDarkBackground = (bg: string) => {
    if (bg === '#000000') return true;
    if (bg === '#ffffff') return false;
    return false; // Default for image backgrounds
  };

  return (
    <Box
      position="fixed"
      top="0"
      right="0"
      bottom="0"
      width={`${panelWidth}px`}
      overflow="auto"
      
      minW="320px"
      zIndex={1000}
      p={4}
      borderRadius="xl"
      boxShadow="2xl"
      bg={chatNodeColor}
      color={fontColor}
    >
      {/* Left edge resize grip */}
      <Box position="absolute" left="-4px" top="0" bottom="0" width="8px" cursor="ew-resize" onMouseDown={startResize} />

      <Flex justify="space-between" align="center" mb={4}>
        <IconButton
          {...extendedNodeBackButtonStyle}
          icon={<AiOutlineArrowLeft />}
          onClick={onClose}
          aria-label="Back"
        />
        <IconButton
          aria-label="Delete Node"
          icon={<AiOutlineDelete />}
          size="sm"
          colorScheme="red"
          variant="solid"
          onClick={handleDeleteNode}
          isLoading={isDeleting}
          isDisabled={nodeData.isLoading}
          _hover={{ transform: 'scale(1.1)' }}
        />
      </Flex>
      
      <VStack spacing={6} align="stretch">
        {/* Chat Node Content */}
          <Flex {...chatNodeUserFlexStyle}>
            <Box {...chatNodeUserBoxStyle} color={fontColor}>
              <Text whiteSpace="pre-wrap">{nodeData.prompt}</Text>
            </Box>
            <Avatar {...chatNodeUserAvatarStyle} />
          </Flex>
          <Flex {...chatNodeAIFlexStyle}>
            <Avatar {...chatNodeAIAvatarStyle} />
            <Box {...chatNodeAIBoxStyle} color={fontColor}>
              {nodeData.isLoading ? (
                <Flex align="center" gap={3}>
                  <Spinner size="sm" color="blue.500" />
                  <Text color={fontColor} fontStyle="italic">
                    {nodeData.response}
                  </Text>
                </Flex>
              ) : (
                <ReactMarkdown
                components={{
                  p: ({ children }) => <Text>{children}</Text>,
                  strong: ({ children }) => <Text as="strong">{children}</Text>,
                  em: ({ children }) => <Text as="em">{children}</Text>,
                  li: ({ children }) => (
                    <Text as="li" ml={4} listStyleType="disc">
                      {children}
                    </Text>
                  ),
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={a11yDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <chakra.code className={className} {...props}>
                        {children}
                      </chakra.code>
                    );
                  },
                }}
                >
                  {nodeData.response}
                </ReactMarkdown>
              )}
            </Box>
          </Flex>
        {/* Input Section */}
        <VStack spacing={4} align="stretch">
          <Flex>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyUp={handleKeyPress}
              placeholder="Type your message here..."
              {...extendedNodeInputStyle}
              bg="white"
              borderColor="gray.300"
              borderWidth="2px"
              color="black"
              _placeholder={{ color: "gray.500" }}
              _hover={{ borderColor: "blue.400" }}
              _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
            />
          </Flex>
          <Flex gap={2}>
            <Button 
              onClick={handleSendMessage} 
              flex={1}
              bg="blue.500"
              color="white"
              size="md"
              borderRadius="md"
              _hover={{ bg: "blue.600" }}
              _focus={{ boxShadow: "0 0 0 2px blue.200" }}
              isDisabled={nodeData.isLoading || inputValue.trim() === ''}
            >
              Send
            </Button>
            <Button 
              onClick={handleBranch} 
              flex={1}
              bg="green.500"
              color="white"
              size="md"
              borderRadius="md"
              _hover={{ bg: "green.600" }}
              _focus={{ boxShadow: "0 0 0 2px green.200" }}
              isDisabled={nodeData.isLoading || inputValue.trim() === ''}
            >
              Branch
            </Button>
          </Flex>
        </VStack>
      </VStack>
    </Box>
  );
};

export default ExtendedNode;