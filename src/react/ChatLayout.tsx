import React, { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { useReactFlow, ReactFlowProvider } from 'reactflow';
import useStore from '../typejs/store';

const ChatLayoutFlow: React.FC = () => {
  const { Initialize, setReactFlowInstance } = useStore();
  const reactFlowInstance = useReactFlow();
  
  useEffect(() => {
    // Set the ReactFlow instance first, then initialize
    setReactFlowInstance(reactFlowInstance);
    // Small delay to ensure the instance is properly set before initializing
    const timer = setTimeout(() => {
      Initialize();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [setReactFlowInstance, reactFlowInstance, Initialize]);

  return <Outlet />;
};

const ChatLayout: React.FC = () => {
  const toast = useToast();

  // Show signup success toast once after redirect
  useEffect(() => {
    if (localStorage.getItem('signup_success')) {
      toast({
        title: 'Account created',
        description: 'Welcome to VizThinker! Don\'t forget to set up your API keys in the settings.',
        status: 'success',
        duration: 4000,
        isClosable: true,
      });
      localStorage.removeItem('signup_success');
    }
  }, [toast]);
  return (
    <ReactFlowProvider>
      <ChatLayoutFlow />
    </ReactFlowProvider>
  );
};

export default ChatLayout;
