import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Input, Button, Flex, Text, Avatar, Heading } from '@chakra-ui/react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Hello! I am VizThink AI. How can I help you visualize your ideas today?',
      sender: 'ai',
    },
    { id: 2, text: 'I need to create a flowchart for my new project.', sender: 'user' },
    {
      id: 3,
      text: 'Great! Please describe the steps, and I will generate the graph for you.',
      sender: 'ai',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
    };

    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Flex direction="column" h="100vh" w="100%" bg="gray.50">
      <Box p={4} borderBottomWidth="1px" bg="white" w="100%">
        <Heading size="md">VizThink AI Assistant</Heading>
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
              bg={message.sender === 'user' ? 'blue.500' : 'white'}
              color={message.sender === 'user' ? 'white' : 'black'}
              px={4}
              py={2}
              borderRadius="lg"
              maxWidth="70%"
            >
              <Text>{message.text}</Text>
            </Box>
            {message.sender === 'user' && <Avatar size="sm" ml={2} name="You" bg="blue.500" />}
          </Flex>
        ))}
        <div ref={endOfMessagesRef} />
      </VStack>

      <Flex p={4} borderTopWidth="1px" bg="white">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          mr={2}
        />
        <Button onClick={handleSendMessage} colorScheme="blue">
          Send
        </Button>
      </Flex>
    </Flex>
  );
};

export default ChatWindow;
