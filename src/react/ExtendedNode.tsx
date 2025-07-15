import React from 'react';
import { Box, Text, IconButton, Flex, VStack, Avatar } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useSettings } from './SettingsContext';
import { useLocation, useNavigate } from 'react-router-dom';

export interface ExtendedNodeProps {
  data?: { prompt: string; response: string };
  onClose?: () => void;
}

const ExtendedNode: React.FC<ExtendedNodeProps> = ({ data, onClose }) => {
  const location = useLocation() as { state?: { prompt: string; response: string } };
  const navigate = useNavigate();
  const nodeData = location.state ?? data ?? { prompt: '', response: '' };
  const { backgroundImage, chatNodeColor, fontColor } = useSettings();
  const isGrid = backgroundImage === 'grid' || backgroundImage === 'default';
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      w="100%"
      h="100%"
      bgImage={isGrid ? undefined : `linear-gradient(rgba(75, 71, 71, 0.4), rgba(75, 71, 71, 0.4)), url(${backgroundImage})`}
      bg={isGrid ? '#1a1a1a' : undefined}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      p={6}
      overflowY="auto"
      zIndex={30}
    >
      <IconButton
        aria-label="Back"
        icon={<AiOutlineArrowLeft />}
        size="sm"
        mb={4}
        onClick={() => (onClose ? onClose() : navigate(-1))}
      />
      <Flex justify="center" mb={6}>
        <VStack
          spacing={4}
          align="stretch"
          w="100%"
          h="100%"
          borderRadius="2xl"
          p={4}
          sx={{ backgroundColor: chatNodeColor }}
          overflowY="auto"
          maxH="80vh"
          color={fontColor}
        >
          <Flex w="100%" justify="flex-end">
            <Box px={4} py={2} borderRadius="2xl" maxWidth="70%" color={fontColor}>
              <Text whiteSpace="pre-wrap">{nodeData.prompt}</Text>
            </Box>
            <Avatar size="sm" ml={2} name="You" bg="blue.500" />
          </Flex>
          <Flex w="100%" justify="flex-start">
            <Avatar size="sm" mr={2} name="VizThink AI" />
            <Box px={4} py={2} borderRadius="lg" maxWidth="70%" color={fontColor}>
              <ReactMarkdown
              components={{
                p: ({ children }) => <Text>{children}</Text>,
                strong: ({ children }) => <Text as="strong">{children}</Text>,
                em: ({ children }) => <Text as="em">{children}</Text>,
                li: ({ children }) => <Text as="li" ml={4} listStyleType="disc">{children}</Text>,
              }}
            >
              {nodeData.response}
            </ReactMarkdown>
            </Box>
          </Flex>
        </VStack>
      </Flex>
    </Box>
  );
};

export default ExtendedNode;