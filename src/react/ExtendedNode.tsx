import React, { useState } from 'react';
import { Box, Text, IconButton, Flex, VStack, Avatar, Input, Button } from '@chakra-ui/react';
import {
  extendedNodeOuterBoxStyle,
  extendedNodeBackButtonStyle,
  extendedNodeCenterFlexStyle,
  extendedNodeVStackStyle,
  extendedNodeUserFlexStyle,
  extendedNodeUserBoxStyle,
  extendedNodeUserAvatarStyle,
  extendedNodeAIFlexStyle,
  extendedNodeAIBoxStyle,
  extendedNodeAIAvatarStyle,
  extendedNodeInputFlexStyle,
  extendedNodeInputStyle,
  extendedNodeSendButtonStyle
} from '../typejs/style';
import ReactMarkdown from 'react-markdown';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import { useSettings } from './SettingsContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useStore from '../typejs/store';



export interface ExtendedNodeProps {
  data?: { prompt: string; response: string };
  onClose?: () => void;
}
const ExtendedNode: React.FC<ExtendedNodeProps> = ({ data, onClose }) => {
  const location = useLocation() as { state?: { prompt: string; response: string } };
  const navigate = useNavigate();
  const { id: nodeId } = useParams<{ id: string }>();
  const nodeData = location.state ?? data ?? { prompt: '', response: '' };
  const { sendMessage } = useStore();
  const { backgroundImage, chatNodeColor, fontColor, provider } = useSettings();
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    await sendMessage(inputValue, provider, nodeId);
    setInputValue('');
  };

  const handleBranch = async () => {
    if (inputValue.trim() === '') return;
    await sendMessage(inputValue, provider, nodeId, true);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  return (
    <Box
      {...extendedNodeOuterBoxStyle}
      {...(backgroundImage.startsWith('#') ? 
        { bg: backgroundImage } : 
        {
          bgImage: backgroundImage,
          bgPosition: "center",
          bgRepeat: "no-repeat",
          bgSize: "cover"
        }
      )}
    >
      <IconButton
        {...extendedNodeBackButtonStyle}
        icon={<AiOutlineArrowLeft />}
        onClick={() => (onClose ? onClose() : navigate(-1))}
      />
      <Flex {...extendedNodeCenterFlexStyle}>
        <VStack
          {...extendedNodeVStackStyle}
          sx={{ backgroundColor: chatNodeColor }}
          color={fontColor}
        >
          <Flex {...extendedNodeUserFlexStyle}>
            <Box {...extendedNodeUserBoxStyle} color={fontColor}>
              <Text whiteSpace="pre-wrap">{nodeData.prompt}</Text>
            </Box>
            <Avatar {...extendedNodeUserAvatarStyle} />
          </Flex>
          <Flex {...extendedNodeAIFlexStyle}>
            <Avatar {...extendedNodeAIAvatarStyle} />
            <Box {...extendedNodeAIBoxStyle} color={fontColor}>
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
      <Flex {...extendedNodeInputFlexStyle}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Type your message here..."
          {...extendedNodeInputStyle}
        />
        <Button onClick={handleSendMessage} {...extendedNodeSendButtonStyle}>
          Send
        </Button>
        <Button onClick={handleBranch} ml={2} {...extendedNodeSendButtonStyle}>
          Branch
        </Button>
      </Flex>
    </Box>
  );
};

export default ExtendedNode;