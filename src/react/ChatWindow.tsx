import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Input, Button, Flex, Heading } from '@chakra-ui/react';
import axios from 'axios';
import backgroundImage from '../asset/images/20200916_174140.jpg';
import ChatNode from './ChatNode';

interface ChatTurn {
  id: number;
  prompt: string;
  response: string;
}

const ChatWindow: React.FC = () => {
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [inputValue, setInputValue] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const newTurnId = chatTurns.length + 1;
    const newTurn: ChatTurn = {
      id: newTurnId,
      prompt: inputValue,
      response: '...', // Placeholder for AI response
    };

    setChatTurns(prevTurns => [...prevTurns, newTurn]);
    const currentInput = inputValue;
    setInputValue('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/llm', {
        prompt: currentInput,
      });

      let aiResponse = response.data.response;
      console.log('AI Response:', aiResponse);

      setChatTurns(prevTurns =>
        prevTurns.map(turn =>
          turn.id === newTurnId ? { ...turn, response: aiResponse } : turn
        )
      );
    } catch (error: any) {
      console.error('Error fetching AI response:', error);
      setChatTurns(prevTurns =>
        prevTurns.map(turn =>
          turn.id === newTurnId ? { ...turn, response: 'Sorry, I am having trouble connecting to the server.' } : turn
        )
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

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatTurns]);

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
        }}
      >
        <Heading size="md" color="white">VizThink AI Assistant</Heading>
      </Box>

      <VStack flex={1} spacing={4} overflowY="auto">
        {chatTurns.map(turn => (
          <ChatNode key={turn.id} prompt={turn.prompt} response={turn.response} />
        ))}
        <div ref={endOfMessagesRef} />
      </VStack>

      <Flex
        p={4}
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
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
