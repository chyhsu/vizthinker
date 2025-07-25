import React, { useState } from 'react';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  useToast,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

/**
 * A standalone authentication page that allows users to either log in or sign up.
 *
 * NOTE: This component currently performs dummy form handling only. Replace the
 * console.log statements with real backend API calls once the auth endpoints
 * are available.
 */
const AuthPage: React.FC = () => {
  // Local state for the two forms
  const [login, setLogin] = useState({ username: '', password: '' });
  const [signup, setSignup] = useState({ username: '', password: '', confirm: '' });
  const navigate = useNavigate();
  const toast = useToast();

  // ===== Handlers =====
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: login.username.trim(),
          password: login.password.trim(),
        }),
      });
  
      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail ?? 'Login failed');
      }
  
      const { user_id, chatrecord_id } = await res.json();  // {status, message, user_id, chatrecord_id}
      if (user_id === null) {
        throw new Error('Login failed');
      }
      localStorage.setItem('user_id', String(user_id));
      localStorage.setItem('chatrecord_id', String(chatrecord_id));
      toast({ title: 'Logged in', status: 'success', duration: 1500, isClosable: true });
      navigate('/main', { replace: true });
    } catch (err: any) {
      toast({ title: err.message, status: 'error', duration: 2000, isClosable: true });
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    
    e.preventDefault();
    try {
      if (signup.password !== signup.confirm) {
        toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
        return;
      }
      const res = await fetch('http://127.0.0.1:8000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signup.username.trim(),
          password: signup.password.trim(),  
        }),
      });
      if (!res.ok) {
        const { detail } = await res.json();
        throw new Error(detail ?? 'Signup failed');
      }
      console.log('Signing up with', signup);
      const { user_id, chatrecord_id } = await res.json();
      if (user_id === null) {
        throw new Error('Signup failed');
      }
      localStorage.setItem('user_id', String(user_id));
      localStorage.setItem('chatrecord_id', String(chatrecord_id));
      toast({ title: 'Account created', status: 'success', duration: 1500, isClosable: true });
      navigate('/main', { replace: true });
    } catch (err: any) {
      toast({ title: err.message, status: 'error', duration: 2000, isClosable: true });
    }
  };

  // ===== Render =====
  return (
    <Box maxW="400px" mx="auto" mt={24} p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" textAlign="center" mb={6} color="teal.500">
        VizThinker&nbsp;Auth
      </Heading>
      <Tabs isFitted variant="enclosed-colored" colorScheme="teal">
        <TabList mb="1em">
          <Tab>Log&nbsp;In</Tab>
          <Tab>Sign&nbsp;Up</Tab>
        </TabList>
        <TabPanels>
          {/* ---- Login ---- */}
          <TabPanel>
            <form onSubmit={handleLogin}>
              <VStack spacing={4} align="stretch">
                <FormControl id="login-username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="username"
                    value={login.username}
                    onChange={(e) => setLogin({ ...login, username: e.target.value })}
                  />
                </FormControl>
                <FormControl id="login-password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={login.password}
                    onChange={(e) => setLogin({ ...login, password: e.target.value })}
                  />
                </FormControl>
                <Button colorScheme="teal" type="submit" width="full">
                  Log&nbsp;In
                </Button>
              </VStack>
            </form>
          </TabPanel>

          {/* ---- Sign Up ---- */}
          <TabPanel>
            <form onSubmit={handleSignup}>
              <VStack spacing={4} align="stretch">
                <FormControl id="signup-username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="username"
                    value={signup.username}
                    onChange={(e) => setSignup({ ...signup, username: e.target.value })}
                  />
                </FormControl>
                <FormControl id="signup-password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={signup.password}
                    onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                  />
                </FormControl>
                <FormControl id="signup-confirm" isRequired>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    type="password"
                    value={signup.confirm}
                    onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                  />
                </FormControl>
                <Button colorScheme="teal" type="submit" width="full">
                  Sign&nbsp;Up
                </Button>
              </VStack>
            </form>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default AuthPage;
