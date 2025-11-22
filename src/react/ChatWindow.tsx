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
import ReactFlow, { Background, BackgroundVariant, Viewport, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import 'reactflow/dist/style.css';
import ChatNode from './ChatNode';
import HeaderBar from './HeaderBar';
import { useSettings } from './SettingsContext';
import useStore from '../typejs/store';
import BranchEdge from './BranchEdge';

const ChatWindow: React.FC = () => {
  const { backgroundImage, provider } = useSettings();

  // Helper function to determine if background is dark
  const isDarkBackground = (bg: string) => {
    if (bg === '#000000') return true;
    if (bg === '#ffffff') return false;
    return false; // Default for image backgrounds
  };
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, sendMessage, viewport, setViewport, extendedNodeId, setExtendedNodeId, setSelectedNodeId, reactFlowInstance, setReactFlowInstance } = useStore();
  const nodeTypes = useMemo(() => ({ chatNode: ChatNode }), []);
  const edgeTypes = useMemo(() => ({ branch: BranchEdge }), []);
  const { getNode, setCenter } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const clearSelection = () => {
    setExtendedNodeId(null);
    setSelectedNodeId(null);
    reactFlowInstance?.fitView({ padding: 0.1, duration: 800 });
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
          edgeTypes={edgeTypes}
          zoomOnScroll={false}
          zoomOnPinch={false}
          panOnScroll={false}
          onNodeClick={(_, node) => {
            if (!reactFlowInstance) return;
            if (extendedNodeId === node.id) {
              // If the clicked node is already extended, zoom out to fit all nodes
              setExtendedNodeId(null);
              setSelectedNodeId(null);
              reactFlowInstance?.fitView({ padding: 0.1, duration: 800 });
            } else {
              setSelectedNodeId(node.id);
              setExtendedNodeId(node.id);

              // Defer until after the node has re-rendered and been measured
              requestAnimationFrame(() => {
                updateNodeInternals(node.id);

                requestAnimationFrame(() => {
                  const n = getNode(node.id);
                  if (!n) return;

                  // Use the extended dimensions
                  const cx = (n.positionAbsolute?.x ?? n.position.x) + (n.width ?? 0) / 2;
                  const cy = (n.positionAbsolute?.y ?? n.position.y) + (n.height ?? 0) / 2;

                  setCenter(cx, cy, { zoom: 1.0, duration: 800 });
                });
              });
            }
          }}
          onPaneClick={clearSelection}
          fitView={false}
          onInit={(instance) => {
            setReactFlowInstance(instance);
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


    </Box>
  );
};



export default ChatWindow;
