import React, { useState, useMemo } from 'react';
import { Box, Input, Button, Flex } from '@chakra-ui/react';
import {
  chatWindowOuterFlexStyle,
  chatWindowFlowBoxStyle,
  chatWindowInputFlexStyle,
  chatWindowInputStyle,
  chatWindowSendButtonStyle
} from '../typejs/style';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactFlow, { Background, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import ChatNode from './ChatNode';
import HeaderBar from './HeaderBar';
import { useSettings } from './SettingsContext';
import useStore from '../typejs/store';

const ChatWindow: React.FC = () => {
  const { backgroundImage, provider } = useSettings();
  
  // Helper function to determine if background is dark
  const isDarkBackground = (bg: string) => {
    if (bg === '#000000') return true;
    if (bg === '#ffffff') return false;
    return false; // Default for image backgrounds
  };
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, sendMessage } = useStore();
  const nodeTypes = useMemo(() => ({ chatNode: ChatNode }), []);
  const [inputValue, setInputValue] = useState('');
  const navigate = useNavigate();

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    await sendMessage(inputValue, provider);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  
  return (
    <Box
      position="relative"
      h="100vh"
      w="100%"
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
      <HeaderBar />

      <Box h="100%" w="100%">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => navigate(`/chat/${node.id}`, { state: node.data })}
          
          fitView
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            color={isDarkBackground(backgroundImage) ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"} 
          />
        </ReactFlow>
      </Box>

      
        
          
        

      <Flex {...chatWindowInputFlexStyle}>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Type your message here..."
          {...chatWindowInputStyle}
        />
        <Button onClick={handleSendMessage} {...chatWindowSendButtonStyle}>
          Send
        </Button>
      </Flex>
    </Box>
  );
};



export default ChatWindow;
