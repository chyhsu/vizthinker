import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Box, VStack, Input, Button, Flex, Text, Avatar, Heading } from '@chakra-ui/react';
import axios from 'axios';
import backgroundImage from '../asset/images/20200916_174140.jpg';
// import { useGraphStore } from '../typejs/store';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  // const { addNode, addEdge } = useGraphStore();

    const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
    };

    // Update the UI immediately with the user's message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');

    try {
      // Send the whole conversation to the backend, get response
      const response = await axios.post('http://127.0.0.1:8000/llm', {
        prompt: userMessage.text,
      });

      let aiResponse = response.data.response;
  
      console.log('AI Response:', aiResponse);
      
      // Add the AI's reply to the chat
      const aiMessage: Message = {
        id: updatedMessages.length + 1,
        text: aiResponse,
        sender: 'ai',
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Error request:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
      // Optionally, add an error message to the chat
      const errorMessage: Message = {
        id: updatedMessages.length + 1,
        text: 'Sorry, I am having trouble connecting to the server.',
        sender: 'ai',
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
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
  }, [messages]);

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

      <VStack flex={1} p={4} spacing={4} overflowY="auto">
        {messages.map((message) => (
          <Flex
            key={message.id}
            w="100%"
            justify={message.sender === 'user' ? 'flex-end' : 'flex-start'}
          >
            {message.sender === 'ai' && <Avatar size="sm" mr={2} name="VizThink AI" />}
            <Box
              px={4}
              py={2}
              borderRadius="lg"
              maxWidth="70%"
              sx={{
                backgroundColor: message.sender === 'user' ? 'rgba(44, 122, 244, 0.5)' : 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              color="white"
            >
              {message.sender === 'ai' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <Text>{children}</Text>,
                    strong: ({ children }) => <Text as="strong">{children}</Text>,
                    em: ({ children }) => <Text as="em">{children}</Text>,
                    li: ({ children }) => <Text as="li" ml={4} listStyleType="disc">{children}</Text>,
                  }}
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                <Text>{message.text}</Text>
              )}
            </Box>
            {message.sender === 'user' && <Avatar size="sm" ml={2} name="You" bg="blue.500" />}
          </Flex>
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
