import React, { useState, useMemo } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  useToast,
  Icon,
  HStack,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Progress,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { handleLogin as authHandleLogin, handleSignup as authHandleSignup } from '../typejs/auth';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';

// Password validation rules
interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

const validatePassword = (password: string): PasswordValidation => ({
  minLength: password.length >= 8,
  hasUppercase: /[A-Z]/.test(password),
  hasLowercase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

const getPasswordStrength = (validation: PasswordValidation): number => {
  const passed = Object.values(validation).filter(Boolean).length;
  return (passed / 5) * 100;
};

const getStrengthLabel = (strength: number): string => {
  if (strength <= 20) return 'Very Weak';
  if (strength <= 40) return 'Weak';
  if (strength <= 60) return 'Fair';
  if (strength <= 80) return 'Strong';
  return 'Very Strong';
};

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState({ username: '', password: '' });
  const [signup, setSignup] = useState({ username: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Password validation for signup
  const passwordValidation = useMemo(
    () => validatePassword(signup.password),
    [signup.password]
  );
  const passwordStrength = useMemo(
    () => getPasswordStrength(passwordValidation),
    [passwordValidation]
  );
  const passwordsMatch = signup.password === signup.confirm && signup.confirm.length > 0;
  const isPasswordValid = passwordStrength === 100;

  const handleLogin = (e: React.FormEvent) => {
    authHandleLogin(e, login, toast, navigate);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      toast({
        title: 'Password requirements not met',
        description: 'Please ensure your password meets all requirements.',
        status: 'error',
        duration: 3000,
      });
      return;
    }
    
    if (!passwordsMatch) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    authHandleSignup(e, signup, toast, navigate);
  };

  return (
    <Flex minH="100vh" bg="white">
      {/* Left - Branding & Introduction */}
      <Flex
        flex="1"
        bg="gray.900"
        display={{ base: 'none', lg: 'flex' }}
        align="center"
        justify="center"
        p={16}
      >
        <VStack spacing={8} maxW="420px" align="start">
          <VStack spacing={3} align="start">
            <Box>
              <Heading
                fontSize={{ base: '5xl', lg: '6xl' }}
                fontWeight="black"
                letterSpacing="-0.02em"
                lineHeight="1"
              >
                <Text as="span" color="white">Viz</Text>
                <Text as="span" color="gray.400">Thinker</Text>
              </Heading>
              <Box
                w="60px"
                h="3px"
                bg="white"
                mt={3}
                borderRadius="full"
              />
            </Box>
            <Text color="gray.500" fontSize="md" mt={2}>
              Visual AI thinking for your ideas.
            </Text>
          </VStack>

          <Text color="gray.300" fontSize="sm" lineHeight="tall">
            Transform how you think and organize ideas. VizThinker combines 
            AI-powered conversations with visual node-based thinking, letting 
            you branch, connect, and explore concepts in an intuitive canvas.
          </Text>

          <VStack spacing={4} align="start" w="full">
            <HStack spacing={4}>
              <Box w="1px" h="40px" bg="gray.600" />
              <VStack align="start" spacing={0}>
                <Text color="white" fontSize="sm" fontWeight="medium">
                  Node-Based Thinking
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Organize conversations as visual nodes
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={4}>
              <Box w="1px" h="40px" bg="gray.600" />
              <VStack align="start" spacing={0}>
                <Text color="white" fontSize="sm" fontWeight="medium">
                  AI Conversations
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Chat with AI at any point in your graph
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={4}>
              <Box w="1px" h="40px" bg="gray.600" />
              <VStack align="start" spacing={0}>
                <Text color="white" fontSize="sm" fontWeight="medium">
                  Branch & Explore
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Create branches to explore different paths
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={4}>
              <Box w="1px" h="40px" bg="gray.600" />
              <VStack align="start" spacing={0}>
                <Text color="white" fontSize="sm" fontWeight="medium">
                  Connect Ideas
                </Text>
                <Text color="gray.500" fontSize="xs">
                  Link related concepts across your workspace
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </VStack>
      </Flex>

      {/* Right - Auth Form */}
      <Flex
        flex="1"
        align="center"
        justify="center"
        p={{ base: 6, md: 12 }}
      >
        <Box w="full" maxW="380px">
          {/* Mobile Logo */}
          <Heading
            display={{ base: 'block', lg: 'none' }}
            fontSize="2xl"
            mb={8}
            textAlign="center"
          >
            VizThinker
          </Heading>

          {/* Form Header */}
          <VStack spacing={1} mb={8} align="start">
            <Heading size="lg">
              {isLogin ? 'Sign in' : 'Create account'}
            </Heading>
            <Text color="gray.500" fontSize="sm">
              {isLogin
                ? 'Enter your credentials to continue'
                : 'Set up your account to get started'}
            </Text>
          </VStack>

          {/* Toggle */}
          <HStack mb={6} spacing={4}>
            <Button
              variant="ghost"
              size="sm"
              fontWeight={isLogin ? 'bold' : 'normal'}
              color={isLogin ? 'black' : 'gray.400'}
              borderBottom={isLogin ? '2px solid black' : '2px solid transparent'}
              borderRadius="0"
              px={0}
              onClick={() => setIsLogin(true)}
              _hover={{ bg: 'transparent' }}
            >
              Sign In
            </Button>
            <Button
              variant="ghost"
              size="sm"
              fontWeight={!isLogin ? 'bold' : 'normal'}
              color={!isLogin ? 'black' : 'gray.400'}
              borderBottom={!isLogin ? '2px solid black' : '2px solid transparent'}
              borderRadius="0"
              px={0}
              onClick={() => setIsLogin(false)}
              _hover={{ bg: 'transparent' }}
            >
              Sign Up
            </Button>
          </HStack>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">Username</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaUser} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                      placeholder="username"
                      value={login.username}
                      onChange={(e) => setLogin({ ...login, username: e.target.value })}
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'black', boxShadow: 'none' }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaLock} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password"
                      value={login.password}
                      onChange={(e) => setLogin({ ...login, password: e.target.value })}
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'black', boxShadow: 'none' }}
                    />
                    <InputRightElement>
                      <Icon
                        as={showPassword ? FaEyeSlash : FaEye}
                        color="gray.400"
                        boxSize={4}
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  w="full"
                  bg="black"
                  color="white"
                  mt={2}
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.900' }}
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignup}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">Username</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaUser} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                      placeholder="username"
                      value={signup.username}
                      onChange={(e) => setSignup({ ...signup, username: e.target.value })}
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'black', boxShadow: 'none' }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaLock} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="password"
                      value={signup.password}
                      onChange={(e) => setSignup({ ...signup, password: e.target.value })}
                      border="1px solid"
                      borderColor="gray.300"
                      borderRadius="md"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'black', boxShadow: 'none' }}
                    />
                    <InputRightElement>
                      <Icon
                        as={showPassword ? FaEyeSlash : FaEye}
                        color="gray.400"
                        boxSize={4}
                        cursor="pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </InputRightElement>
                  </InputGroup>

                  {/* Password Strength */}
                  {signup.password && (
                    <Box mt={3}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color="gray.500">Password strength</Text>
                        <Text fontSize="xs" color="gray.600" fontWeight="medium">
                          {getStrengthLabel(passwordStrength)}
                        </Text>
                      </HStack>
                      <Progress
                        value={passwordStrength}
                        size="xs"
                        borderRadius="full"
                        bg="gray.200"
                        sx={{
                          '& > div': {
                            bg: passwordStrength <= 40 ? 'gray.400' : passwordStrength <= 60 ? 'gray.500' : 'black',
                          },
                        }}
                      />

                      {/* Requirements List */}
                      <List spacing={1} mt={3} fontSize="xs">
                        <ListItem color={passwordValidation.minLength ? 'black' : 'gray.400'}>
                          <ListIcon
                            as={passwordValidation.minLength ? FaCheck : FaTimes}
                            color={passwordValidation.minLength ? 'black' : 'gray.400'}
                          />
                          At least 8 characters
                        </ListItem>
                        <ListItem color={passwordValidation.hasUppercase ? 'black' : 'gray.400'}>
                          <ListIcon
                            as={passwordValidation.hasUppercase ? FaCheck : FaTimes}
                            color={passwordValidation.hasUppercase ? 'black' : 'gray.400'}
                          />
                          One uppercase letter
                        </ListItem>
                        <ListItem color={passwordValidation.hasLowercase ? 'black' : 'gray.400'}>
                          <ListIcon
                            as={passwordValidation.hasLowercase ? FaCheck : FaTimes}
                            color={passwordValidation.hasLowercase ? 'black' : 'gray.400'}
                          />
                          One lowercase letter
                        </ListItem>
                        <ListItem color={passwordValidation.hasNumber ? 'black' : 'gray.400'}>
                          <ListIcon
                            as={passwordValidation.hasNumber ? FaCheck : FaTimes}
                            color={passwordValidation.hasNumber ? 'black' : 'gray.400'}
                          />
                          One number
                        </ListItem>
                        <ListItem color={passwordValidation.hasSpecial ? 'black' : 'gray.400'}>
                          <ListIcon
                            as={passwordValidation.hasSpecial ? FaCheck : FaTimes}
                            color={passwordValidation.hasSpecial ? 'black' : 'gray.400'}
                          />
                          One special character
                        </ListItem>
                      </List>
                    </Box>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontSize="sm" color="gray.600">Confirm Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement>
                      <Icon as={FaLock} color="gray.400" boxSize={4} />
                    </InputLeftElement>
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="confirm password"
                      value={signup.confirm}
                      onChange={(e) => setSignup({ ...signup, confirm: e.target.value })}
                      border="1px solid"
                      borderColor={signup.confirm ? (passwordsMatch ? 'black' : 'red.400') : 'gray.300'}
                      borderRadius="md"
                      _hover={{ borderColor: 'gray.400' }}
                      _focus={{ borderColor: 'black', boxShadow: 'none' }}
                    />
                    <InputRightElement>
                      <Icon
                        as={showConfirm ? FaEyeSlash : FaEye}
                        color="gray.400"
                        boxSize={4}
                        cursor="pointer"
                        onClick={() => setShowConfirm(!showConfirm)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {signup.confirm && !passwordsMatch && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      Passwords do not match
                    </Text>
                  )}
                </FormControl>

                <Button
                  type="submit"
                  w="full"
                  bg="black"
                  color="white"
                  mt={2}
                  isDisabled={!isPasswordValid || !passwordsMatch}
                  _hover={{ bg: 'gray.800' }}
                  _active={{ bg: 'gray.900' }}
                  _disabled={{ bg: 'gray.300', cursor: 'not-allowed' }}
                >
                  Create Account
                </Button>
              </VStack>
            </form>
          )}
        </Box>
      </Flex>
    </Flex>
  );
};

export default AuthPage;
