import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Flex, Text, Avatar, VStack, Button, IconButton, useToast, Spinner, Input, HStack } from '@chakra-ui/react';
import {
  chatNodeContainerStyle,
  chatNodeHeaderStyle,
  chatNodeContentStyle,
  chatNodeFooterStyle,
  chatNodeInputStyle,
  chatNodeUserBubbleStyle,
  chatNodeAIBubbleStyle,
} from '../typejs/style';
import { useSettings } from './SettingsContext';
import { Handle, Position } from 'reactflow';
import useStore from '../typejs/store';
import { AiOutlineDelete } from 'react-icons/ai';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chakra } from '@chakra-ui/react';

interface ChatNodeProps {
  data: {
    prompt: string;
    response: string;
    isLoading?: boolean;
  };
  id: string;
}

const ChatNode: React.FC<ChatNodeProps> = ({ data, id }) => {
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [isResponseExpanded, setIsResponseExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { chatNodeColor, fontColor, provider, providerModels } = useSettings();
  const { deleteNode, selectedNodeId, updateNodeStyle, extendedNodeId, sendMessage } = useStore();
  const { prompt, response, isLoading } = data;
  const toast = useToast();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);


  const isExtended = extendedNodeId === id;
  const promptTooLong = prompt.length > 100 && !isExtended;
  const responseTooLong = response.length > 100 && !isExtended;
  const isSelected = selectedNodeId === id;



  useEffect(() => {
    updateNodeStyle(id, {
      // We override some styles here for dynamic sizing, but base styles are in chatNodeContainerStyle
      width: isExtended ? '90vw' : '350px',
      height: isExtended ? '90vh' : 'auto',
      maxWidth: isExtended ? '1200px' : '350px',
      zIndex: isExtended ? 1000 : undefined,
    });
  }, [id, isExtended, updateNodeStyle]);

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

  const handleSendMessage = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (inputValue.trim() === '') return;
    const selectedModel = providerModels[provider as keyof typeof providerModels];
    await sendMessage(inputValue, provider, id, false, selectedModel);
    setInputValue('');
  };

  const handleBranch = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (inputValue.trim() === '') return;
    const selectedModel = providerModels[provider as keyof typeof providerModels];
    await sendMessage(inputValue, provider, id, true, selectedModel);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ top: '0%', transform: 'translate(-50%, -50%)' }} />
      <Handle type="source" position={Position.Right} id="right" style={{ top: '50%', right: '0%', transform: 'translate(50%, -50%)' }} />
      <Handle type="source" position={Position.Bottom} id="bottom" style={{ bottom: '0%', left: '50%', transform: 'translate(-50%, 50%)' }} />

      <Box
        {...chatNodeContainerStyle}
        width={isExtended ? '90vw' : '350px'}
        height={isExtended ? '90vh' : 'auto'}
        maxWidth={isExtended ? '1200px' : '350px'}
        cursor={isExtended ? 'default' : 'pointer'}
        borderColor={isSelected ? 'blue.400' : 'rgba(255, 255, 255, 0.5)'}
        boxShadow={isSelected ? '0 0 0 3px rgba(66, 153, 225, 0.4)' : chatNodeContainerStyle.boxShadow}
      >
        {/* Header */}
        <Flex {...chatNodeHeaderStyle}>
          <HStack>
            <Avatar size="xs" name="VizThinker" src="/logo.png" bg="blue.500" />
            <Text fontSize="xs" fontWeight="bold" color="gray.500">VizThinker Node</Text>
          </HStack>
          {isSelected && !isLoading && (
            <IconButton
              aria-label="Delete Node"
              icon={<AiOutlineDelete />}
              size="xs"
              colorScheme="red"
              variant="ghost"
              onClick={handleDeleteNode}
              isLoading={isDeleting}
            />
          )}
        </Flex>

        {/* Scrollable Content */}
        <Box
          {...chatNodeContentStyle}
          ref={scrollRef}
          className={isExtended ? 'nodrag' : ''}
          onWheelCapture={(e) => {
            if (!isExtended) return;
            e.stopPropagation();
          }}
        >
          {/* User Prompt Bubble */}
          <Box {...chatNodeUserBubbleStyle}>
            <Flex align="center" mb={2} gap={2}>
              <Avatar size="xs" name="You" bg="blue.600" />
              <Text fontSize="xs" fontWeight="bold" color="gray.500">You</Text>
            </Flex>
            <Text whiteSpace={isExtended ? 'pre-wrap' : 'normal'} fontSize="md">
              {promptTooLong && !isPromptExpanded ? `${prompt.slice(0, 100)}...` : prompt}
            </Text>
            {promptTooLong && (
              <Button
                size="xs"
                variant="link"
                colorScheme="blue"
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

          {/* AI Response Bubble */}
          <Box {...chatNodeAIBubbleStyle}>
            <Flex align="center" mb={2} gap={2}>
              <Avatar size="xs" name="AI" bg="green.500" />
              <Text fontSize="xs" fontWeight="bold" color="gray.500">AI</Text>
            </Flex>
            {isLoading ? (
              <Flex align="center" gap={3}>
                <Spinner size="sm" color="blue.500" />
                <Text fontStyle="italic" color="gray.500">Thinking...</Text>
              </Flex>
            ) : (
              <Box fontSize="md">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <Text whiteSpace={isExtended ? 'pre-wrap' : 'normal'} mb={2}>{children}</Text>,
                    strong: ({ children }) => <Text as="strong" fontWeight="bold">{children}</Text>,
                    em: ({ children }) => <Text as="em" fontStyle="italic">{children}</Text>,
                    li: ({ children }) => <Text as="li" ml={4} listStyleType="disc">{children}</Text>,
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
                        <chakra.code className={className} bg="gray.100" px={1} py={0.5} borderRadius="sm" {...props}>
                          {children}
                        </chakra.code>
                      );
                    },
                  }}
                >
                  {responseTooLong && !isResponseExpanded ? `${response.slice(0, 150)}...` : response}
                </ReactMarkdown>
                {responseTooLong && (
                  <Button
                    size="xs"
                    variant="link"
                    colorScheme="blue"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsResponseExpanded(!isResponseExpanded);
                    }}
                    mt={2}
                  >
                    {isResponseExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Box>

        {/* Sticky Footer (Input) - Only when extended */}
        {isExtended && (
          <Box
            {...chatNodeFooterStyle}
            className="nodrag"
            onClick={(e) => e.stopPropagation()}
          >
            <VStack spacing={3} align="stretch">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyUp={handleKeyPress}
                placeholder="Type your message here..."
                {...chatNodeInputStyle}
                className="nodrag"
              />
              <Flex gap={3}>
                <Button
                  onClick={handleSendMessage}
                  flex={1}
                  colorScheme="blue"
                  size="md"
                  borderRadius="xl"
                  isDisabled={!!isLoading || inputValue.trim() === ''}
                  className="nodrag"
                >
                  Send
                </Button>
                <Button
                  onClick={handleBranch}
                  flex={1}
                  colorScheme="green"
                  size="md"
                  borderRadius="xl"
                  isDisabled={!!isLoading || inputValue.trim() === ''}
                  className="nodrag"
                >
                  Branch
                </Button>
              </Flex>
            </VStack>
          </Box>
        )}
      </Box>
    </>
  );
};

export default ChatNode;
