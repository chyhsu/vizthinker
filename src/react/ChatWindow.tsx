import React, { useState, useMemo } from 'react';
import { Box, Input, Button, Flex, Heading } from '@chakra-ui/react';
import {
  chatWindowOuterFlexStyle,
  chatWindowTopBarBoxStyle,
  chatWindowTopBarFlexStyle,
  chatWindowHeadingStyle,
  chatWindowSettingsButtonStyle,
  chatWindowFlowBoxStyle,
    chatWindowInputFlexStyle,
  chatWindowInputStyle,
  chatWindowSendButtonStyle
} from '../typejs/style';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactFlow, { Background, BackgroundVariant } from 'reactflow';
import 'reactflow/dist/style.css';
import ChatNode from './ChatNode';
import { useSettings } from './SettingsContext';
import useStore from '../typejs/store';

const ChatWindow: React.FC = () => {
  const { backgroundImage, provider } = useSettings();
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
    <Flex
      {...chatWindowOuterFlexStyle}
      bgImage={backgroundImage}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      <Box {...chatWindowTopBarBoxStyle}>
        <Flex {...chatWindowTopBarFlexStyle}>
          <Heading {...chatWindowHeadingStyle}>VizThinker</Heading>
          <Button {...chatWindowSettingsButtonStyle} as={Link} to="/settings">
            Settings
          </Button>
        </Flex>
      </Box>

      <Box {...chatWindowFlowBoxStyle}>
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
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.15)" />
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
    </Flex>
  );
};



export default ChatWindow;
