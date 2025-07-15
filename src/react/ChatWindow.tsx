import React, { useState, useMemo } from 'react';
import { Box, Input, Button, Flex, Heading } from '@chakra-ui/react';
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
      direction="column"
      position="relative"
      h="100vh"
      w="100%"
      bgImage={backgroundImage}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
    >
      <Box
        p={4}
        w="100%"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        <Flex justify="space-between">
          <Heading size="md" color="white">VizThinker</Heading>
          <Button
            as={Link}
            to="/settings"
            variant="ghost"
            size="sm"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.15)' }}
          >
            Settings
          </Button>
        </Flex>
      </Box>

      <Box flex={1} w="100%">
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

      
        
          
        

      <Flex
        p={4}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 10
        }}
      >
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyPress}
          placeholder="Type your message here..."
          mr={2}
          bg="transparent"
          color="white"
          borderColor="rgba(255, 255, 255, 0.3)"
          _placeholder={{ color: 'gray.300' }}
          _hover={{ borderColor: 'rgba(255, 255, 255, 0.5)' }}
          _focus={{
            borderColor: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.7)',
          }}
        />
        <Button onClick={handleSendMessage} colorScheme="blue">
          Send
        </Button>
      </Flex>
    </Flex>
  );
};



export default ChatWindow;
