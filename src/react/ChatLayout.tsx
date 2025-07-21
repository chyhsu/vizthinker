import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useReactFlow, ReactFlowProvider } from 'reactflow';
import useStore from '../typejs/store';

const ChatLayoutFlow: React.FC = () => {
  const { Initailize, setReactFlowInstance } = useStore();
  const reactFlowInstance = useReactFlow();
  
  useEffect(() => {
    // Set the ReactFlow instance first, then initialize
    setReactFlowInstance(reactFlowInstance);
    // Small delay to ensure the instance is properly set before initializing
    const timer = setTimeout(() => {
      Initailize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [setReactFlowInstance, reactFlowInstance, Initailize]);

  return <Outlet />;
};

const ChatLayout: React.FC = () => {
  return (
    <ReactFlowProvider>
      <ChatLayoutFlow />
    </ReactFlowProvider>
  );
};

export default ChatLayout;
