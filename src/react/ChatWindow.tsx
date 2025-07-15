import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Box, Input, Button, Flex, Heading, Text } from '@chakra-ui/react';
import {Link, useNavigate} from 'react-router-dom';

import axios from 'axios';
import ReactFlow, { Background, BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  NodeChange,
  applyNodeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

import ChatNode from './ChatNode';
import { useSettings } from './SettingsContext';

const initialNodes = [];
const initialEdges = [];


const ChatWindowFlow: React.FC = () => {
  const { backgroundImage, provider } = useSettings();
  const isGrid = backgroundImage === 'grid' || backgroundImage === 'default';
  const nodeTypes = useMemo(() => ({ chatNode: ChatNode }), []);
  const [nodes, setNodes, _onNodesChange] = useNodesState(initialNodes);

    // Debounce timer ref so we only send positions after user stops dragging
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);

      // clear previous timer and start new debounce
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const positions = updated.map((n) => n.position);
        axios.post('http://127.0.0.1:8000/chat/positions', { positions }).catch((err) => {
          console.error('Failed to update positions:', err);
        });
      }, 400); // send only after 400ms of inactivity

      return updated;
    });
  }, []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [inputValue, setInputValue] = useState('');

  const reactFlowInstance = useReactFlow();
  const navigate = useNavigate();

  // Fetch stored chat & positions on first load
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/chat/get');
        const rows = res.data.data as Array<[string, string, any]>; // prompt, response, positions

        const restoredNodes = rows.map(([prompt, resp, positions], idx) => {
          let pos: { x: number; y: number } | undefined;

          if (Array.isArray(positions)) {
            // Positions were stored for the whole graph; use the one corresponding to this node if available
            pos = positions[idx] || positions[positions.length - 1];
          } else if (positions && typeof positions === 'object') {
            pos = positions as { x: number; y: number };
          }

          return {
            id: (idx + 1).toString(),
            type: 'chatNode',
            position: pos ?? { x: 250, y: idx * 400 + 50 },
            data: { prompt, response: resp },
          };
        });
        const restoredEdges = restoredNodes.slice(1).map((node, idx) => ({
          id: `e${restoredNodes[idx].id}-${node.id}`,
          source: restoredNodes[idx].id,
          target: node.id,
        }));
        setNodes(restoredNodes);
        setEdges(restoredEdges);
      } catch (err) {
        console.error('Error restoring chat:', err);
      }
    })();
  }, []);


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
        y: lastNode ? lastNode.position.y + 250 : 50
      },
      data: { prompt: currentInput, response: '...' },
    };
    setNodes((nds) => nds.concat(newNode));

    // Auto-center the new node after a short delay to ensure it's rendered
    setTimeout(() => {
      reactFlowInstance.fitView({
        nodes: [{ id: newNodeId }],
        duration: 800,
        padding: 0.3,
      });
    }, 100);

    if (lastNode) {
      const newEdge = {
        id: `e${lastNode.id}-${newNodeId}`,
        source: lastNode.id,
        target: newNodeId,
      };
      setEdges((eds) => eds.concat(newEdge));
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat/new', {
        prompt: currentInput,
        provider: provider,
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
  
  return (
    <Flex
      direction="column"
      position="relative"
      h="100vh"
      w="100%"
      bgImage={isGrid ? undefined : `linear-gradient(rgba(75, 71, 71, 0.4), rgba(75, 71, 71, 0.4)), url(${backgroundImage})`}
      bg={isGrid ? '#1a1a1a' : undefined}
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
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => navigate(`/chat/${node.id}`, { state: node.data })}
          
          fitView
        >
          {isGrid && <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.15)" />}
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

const ChatWindow: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ChatWindowFlow />
    </ReactFlowProvider>
  );
};

export default ChatWindow;
