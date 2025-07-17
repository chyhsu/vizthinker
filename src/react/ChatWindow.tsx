import React, { useState, useMemo } from 'react';
import { Box, Input, Button, Flex, Text } from '@chakra-ui/react';
import {
  chatWindowOuterFlexStyle,
  chatWindowFlowBoxStyle,
  chatWindowInputFlexStyle,
  chatWindowInputStyle,
  chatWindowSendButtonStyle,
  chatWindowBranchBoxStyle
} from '../typejs/style';
import axios from 'axios';
import ReactFlow, { Background, BackgroundVariant, Viewport } from 'reactflow';
import 'reactflow/dist/style.css';
import ChatNode from './ChatNode';
import HeaderBar from './HeaderBar';
import { useSettings } from './SettingsContext';
import useStore from '../typejs/store';
import ExtendedNode from './ExtendedNode';

const ChatWindow: React.FC = () => {
  const { backgroundImage, provider } = useSettings();
  
  // Helper function to determine if background is dark
  const isDarkBackground = (bg: string) => {
    if (bg === '#000000') return true;
    if (bg === '#ffffff') return false;
    return false; // Default for image backgrounds
  };
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, sendMessage, selectedNodeId, setSelectedNodeId, viewport, setViewport, extendedNodeId, setExtendedNodeId } = useStore();
  const nodeTypes = useMemo(() => ({ chatNode: ChatNode }), []);
  const clearSelection = () => {
    setSelectedNodeId(null);
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
          onNodeClick={(_, node) => setSelectedNodeId(node.id)}
          onNodeDoubleClick={(_, node) => setExtendedNodeId(node.id)}
          onPaneClick={clearSelection}
          fitView={false}
          onInit={(instance) => {
            if (viewport) {
              instance.setViewport(viewport);
            } else {
              instance.fitView({ padding: 0.1, includeHiddenNodes: false });
            }
            setTimeout(() => {
              setViewport(instance.getViewport());
            }, 500);
          }}
          onMoveEnd={(e, vp: Viewport) => setViewport(vp)}
        >
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            color={isDarkBackground(backgroundImage) ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"} 
          />
        </ReactFlow>
      </Box>

      {extendedNodeId && (
        <ExtendedNode
          nodeId={extendedNodeId}
          onClose={() => setExtendedNodeId(null)}
        />
      )}

      {selectedNodeId && (
        <Box 
          {...chatWindowBranchBoxStyle}
        >
          <Text>
            <strong>Branching from:</strong> {nodes.find(n => n.id === selectedNodeId)?.data.prompt.slice(0, 50)}
            {nodes.find(n => n.id === selectedNodeId)?.data.prompt.length > 50 ? '...' : ''}
          </Text>
          <Button size="xs" onClick={clearSelection}>
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
};



export default ChatWindow;
