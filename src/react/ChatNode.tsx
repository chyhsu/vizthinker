import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Flex, Text, Avatar, VStack, Button, IconButton, useToast, Spinner, Input, HStack, Image, CloseButton } from '@chakra-ui/react';
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
import { MdAttachFile } from 'react-icons/md';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { chakra } from '@chakra-ui/react';

interface ChatNodeProps {
  data: {
    prompt: string;
    response: string;
    isLoading?: boolean;
    files?: Array<{
      data: string;
      mime_type: string;
      filename?: string;
      size?: number;
    }>;
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Debug logging for files
  useEffect(() => {
    if (data.files && data.files.length > 0) {
      console.log('ChatNode files data:', data.files);
      console.log('Number of files:', data.files.length);
    }
  }, [data.files]);


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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (inputValue.trim() === '' && selectedFiles.length === 0) return;
    const selectedModel = providerModels[provider as keyof typeof providerModels];
    await sendMessage(inputValue, provider, id, false, selectedModel, selectedFiles);
    setInputValue('');
    setSelectedFiles([]);
  };

  const handleBranch = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (inputValue.trim() === '' && selectedFiles.length === 0) return;
    const selectedModel = providerModels[provider as keyof typeof providerModels];
    await sendMessage(inputValue, provider, id, true, selectedModel, selectedFiles);
    setInputValue('');
    setSelectedFiles([]);
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
        <Flex justify="flex-end" mb={3}>
          <Box {...chatNodeUserBubbleStyle} bg={`${chatNodeColor}15`} color={fontColor}>
            <Flex align="center" mb={2}>
              <Avatar size="xs" name="You" bg="blue.500" mr={2} />
              <Text fontSize="sm" fontWeight="bold" color={fontColor}>
                You
              </Text>
            </Flex>
            <Text color={fontColor}>
              {promptTooLong ? (
                <>
                  {isPromptExpanded ? prompt : `${prompt.slice(0, 100)}...`}
                  <Button
                    size="xs"
                    variant="link"
                    onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                    mt={1}
                    color="blue.500"
                  >
                    {isPromptExpanded ? 'Show Less' : 'Show More'}
                  </Button>
                </>
              ) : (
                prompt
              )}
            </Text>
            
            {/* Display uploaded files */}
            {data.files && data.files.length > 0 && (
              <HStack spacing={2} mt={3} wrap="wrap">
                {data.files.map((file: any, idx: number) => (
                  <Box key={idx} position="relative">
                    {file.mime_type && file.mime_type.startsWith('image/') ? (
                      <Image 
                        src={`data:${file.mime_type};base64,${file.data}`}
                        maxH="120px"
                        maxW="120px"
                        objectFit="cover"
                        borderRadius="md"
                        border="2px solid"
                        borderColor="blue.300"
                      />
                    ) : (
                      <VStack
                        p={3}
                        borderRadius="md"
                        border="2px solid"
                        borderColor="red.300"
                        bg="red.50"
                        minW="150px"
                        spacing={1}
                      >
                        <Text fontSize="2xl">📄</Text>
                        <Text fontSize="xs" color="red.700" fontWeight="semibold" textAlign="center" noOfLines={2}>
                          {file.filename || 'document.pdf'}
                        </Text>
                      </VStack>
                    )}
                  </Box>
                ))}
              </HStack>
            )}
          </Box>
        </Flex>

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
              {/* File Previews */}
              {selectedFiles.length > 0 && (
                <HStack spacing={2} wrap="wrap" maxH="120px" overflowY="auto">
                  {selectedFiles.map((file, idx) => (
                    <Box key={idx} position="relative">
                      {file.type.startsWith('image/') ? (
                        <>
                          <Image 
                            src={URL.createObjectURL(file)} 
                            maxH="80px"
                            maxW="80px"
                            objectFit="cover"
                            borderRadius="md"
                            border="1px solid"
                            borderColor="gray.300"
                          />
                          <CloseButton
                            size="sm"
                            position="absolute"
                            top="-6px"
                            right="-6px"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            _hover={{ bg: 'red.600' }}
                            onClick={() => handleRemoveFile(idx)}
                          />
                        </>
                      ) : (
                        <VStack
                          p={2}
                          borderRadius="md"
                          border="2px solid"
                          borderColor="red.300"
                          bg="red.50"
                          minW="100px"
                          maxW="150px"
                          spacing={1}
                          position="relative"
                        >
                          <Text fontSize="xl">📄</Text>
                          <Text fontSize="xs" color="red.700" fontWeight="semibold" textAlign="center" noOfLines={1}>
                            {file.name}
                          </Text>
                          <CloseButton
                            size="sm"
                            position="absolute"
                            top="-6px"
                            right="-6px"
                            bg="red.500"
                            color="white"
                            borderRadius="full"
                            _hover={{ bg: 'red.600' }}
                            onClick={() => handleRemoveFile(idx)}
                          />
                        </VStack>
                      )}
                    </Box>
                  ))}
                </HStack>
              )}
              
              {/* Input row with attach button */}
              <HStack spacing={2}>
                <IconButton
                  aria-label="Attach file"
                  icon={<MdAttachFile />}
                  onClick={() => fileInputRef.current?.click()}
                  variant="ghost"
                  size="md"
                  className="nodrag"
                />
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyUp={handleKeyPress}
                  placeholder="Type your message here..."
                  {...chatNodeInputStyle}
                  className="nodrag"
                  flex={1}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  hidden
                  onChange={handleFileSelect}
                />
              </HStack>
              
              <Flex gap={3}>
                <Button
                  onClick={handleSendMessage}
                  flex={1}
                  colorScheme="blue"
                  size="md"
                  borderRadius="xl"
                  isDisabled={!!isLoading || (inputValue.trim() === '' && selectedFiles.length === 0)}
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
                  isDisabled={!!isLoading || (inputValue.trim() === '' && selectedFiles.length === 0)}
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
