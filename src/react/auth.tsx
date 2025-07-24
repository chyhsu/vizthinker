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
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with', login);
    // Mock: write token for session check
    localStorage.setItem('auth_token', 'dummy');
    toast({ title: 'Logged in (mock)', status: 'success', duration: 1500, isClosable: true });
    navigate('/main', { replace: true });
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signup.password !== signup.confirm) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    console.log('Signing up with', signup);
    // Mock: write token for session check
    localStorage.setItem('auth_token', 'dummy');
    toast({ title: 'Account created (mock)', status: 'success', duration: 1500, isClosable: true });
    navigate('/main', { replace: true });
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
                  <FormLabel>Username / Email</FormLabel>
                  <Input
                    placeholder="your@email.com"
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
                  <FormLabel>Username / Email</FormLabel>
                  <Input
                    placeholder="your@email.com"
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
