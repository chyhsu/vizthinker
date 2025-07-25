import React from 'react';
import { UseToastOptions } from '@chakra-ui/react';
import useStore from './store';

interface LoginData {
  username: string;
  password: string;
}

interface SignupData {
  username: string;
  password: string;
  confirm: string;
}

type ToastFunction = (options: UseToastOptions) => void;
type NavigateFunction = (to: string, options?: { replace?: boolean }) => void;

// ===== Handlers =====
export const handleLogin = async (
  e: React.FormEvent,
  login: LoginData,
  toast: ToastFunction,
  navigate: NavigateFunction
) => {
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

export const handleSignup = async (
  e: React.FormEvent,
  signup: SignupData,
  toast: ToastFunction,
  navigate: NavigateFunction
) => {
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

export const logout = () => {
  // Clear localStorage
  localStorage.removeItem('user_id');
  localStorage.removeItem('chatrecord_id');
  
  // Reset store state using the store's state setter
  const store = useStore.getState();
  
  // Clear the store by setting empty state
  useStore.setState({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    extendedNodeId: null,
    viewport: undefined,
    reactFlowInstance: null
  });
  
  // Redirect to auth page
  window.location.href = '/auth';
};