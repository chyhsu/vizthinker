import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useReactFlow, ReactFlowProvider } from 'reactflow';
import useStore from '../typejs/store';

const ChatLayoutFlow: React.FC = () => {
  const { fetchInitialData, setReactFlowInstance } = useStore();
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    fetchInitialData();
    setReactFlowInstance(reactFlowInstance);
  }, [fetchInitialData, setReactFlowInstance, reactFlowInstance]);

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
