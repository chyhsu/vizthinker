import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Input, Button, Flex, Heading } from '@chakra-ui/react';
import axios from 'axios';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ChatNode from './ChatNode';
import backgroundImage from '../asset/images/20200916_174140.jpg';

const initialNodes = [];
const initialEdges = [];

const ChatWindow: React.FC = () => {
  const nodeTypes = useMemo(() => ({ chatNode: ChatNode }), []);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [inputValue, setInputValue] = useState('');

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const currentInput = inputValue;
    setInputValue('');

    const newNodeId = (nodes.length + 1).toString();
    const lastNode = nodes[nodes.length - 1];
    
    const newNode = {
      id: newNodeId,
      type: 'chatNode',
      position: { 
        x: lastNode ? lastNode.position.x : 250, 
        y: lastNode ? lastNode.position.y + 400 : 50
      },
      data: { prompt: currentInput, response: '...' },
    };
    setNodes((nds) => nds.concat(newNode));

    if (lastNode) {
      const newEdge = {
        id: `e${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
      };
      setEdges((eds) => eds.concat(newEdge));
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/llm', {
        prompt: currentInput,
      });

      let aiResponse = response.data.response;
      console.log('AI Response:', aiResponse);

      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === newNodeId) {
            return { ...node, data: { ...node.data, response: aiResponse } };
          }
          return node;
        }),
      );
    } catch (error: any) {
      console.error('Error fetching AI response:', error);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === newNodeId) {
            return { ...node, data: { ...node.data, response: 'Sorry, an error occurred.' } };
          }
          return node;
        }),
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  useEffect(() => {
    const clearHistory = async () => {
      try {
        await axios.post('http://127.0.0.1:8000/chat/clear');
        console.log('Chat history cleared on component mount.');
      } catch (error) {
        console.error('Failed to clear chat history:', error);
      }
    };
    clearHistory();
  }, []);

  return (
    <Flex
      direction="column"
      h="100vh"
      w="100%"
      bgImage={`linear-gradient(rgba(75, 71, 71, 0.4), rgba(75, 71, 71, 0.4)), url(${backgroundImage})`}
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
        <Heading size="md" color="white">VizThink AI Assistant</Heading>
      </Box>

      <Box flex={1} w="100%">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        />
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
          onKeyPress={handleKeyPress}
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
