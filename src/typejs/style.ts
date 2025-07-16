import { BoxProps, FlexProps, ButtonProps, InputProps, HeadingProps, StackProps } from '@chakra-ui/react';
import { LinkProps } from 'react-router-dom';

//////////////////////ChatWindow/////////////////////////////
// Outer Flex (root container)
export const chatWindowOuterFlexStyle: FlexProps = {
  direction: 'column',
  position: 'relative',
  h: '100vh',
  w: '100%',
  // bgImage, bgPosition, bgRepeat, bgSize are dynamic and set in component
};

// Top Bar Box
export const chatWindowTopBarBoxStyle: BoxProps = {
  p: 4,
  w: '100%',
  sx: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
};

// Top Bar Flex (contains heading and settings button)
export const chatWindowTopBarFlexStyle: FlexProps = {
  justify: 'space-between',
};

// Heading in Top Bar
export const chatWindowHeadingStyle: HeadingProps = {
  size: 'md',
  color: 'black',
  bg: 'rgba(255, 255, 255, 0.8)',
  px: 3,
  py: 1,
  borderRadius: 'md',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(8px)',
};

// Settings Button (top right)
export const chatWindowSettingsButtonStyle: ButtonProps & LinkProps = {
  as: 'a', // Will be overridden to Link in component
  to: '/settings',
  variant: 'ghost',
  size: 'sm',
  color: 'black',
  bg: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(8px)',
  _hover: { bg: 'rgba(255, 255, 255, 0.9)' },
};

// Main ReactFlow Box
export const chatWindowFlowBoxStyle: BoxProps = {
  flex: 1,
  w: '100%',
};

// Bottom Bar Flex (input area)
export const chatWindowInputFlexStyle: FlexProps = {
  position: 'absolute',
  bottom: 4,
  left: '50%',
  transform: 'translateX(-50%)',
  maxW: '600px',
  w: '90%',
  p: 4,
  borderRadius: '2xl',
  sx: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    zIndex: 10,
  },
};

// Input box
export const chatWindowInputStyle: InputProps = {
  mr: 2,
  bg: 'transparent',
  color: 'black',
  borderColor: 'rgba(0, 0, 0, 0.3)',
  _placeholder: { color: 'gray.600' },
  _hover: { borderColor: 'rgba(0, 0, 0, 0.5)' },
  _focus: {
    borderColor: 'rgba(0, 0, 0, 0.7)',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.7)',
  },
};

// Send Button (bottom right)
export const chatWindowSendButtonStyle: ButtonProps = {
  colorScheme: 'blackAlpha',
};


export const chatWindowBranchBoxStyle: FlexProps = {
  bg: "blue.100",
  p: 2,
  mb: 2,
  borderRadius: "md",
  fontSize: "sm",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
///////////////////////////////////////////////////////////

///////////////ExtendedNode///////////////////////////////////

// Outer Box (background)
export const extendedNodeOuterBoxStyle: BoxProps = {
  position: 'absolute',
  top: 0,
  left: 0,
  w: '100%',
  h: '100%',
  p: 6,
  overflowY: 'auto',
  zIndex: 30,
};

// Back button IconButton
export const extendedNodeBackButtonStyle = {
  'aria-label': 'Back',
  size: 'sm',
  mb: 4,
};

// Centered Flex for VStack
export const extendedNodeCenterFlexStyle = {
  justify: 'center',
  mb: 6,
};

// Main VStack
export const extendedNodeVStackStyle: StackProps = {
  spacing: 4,
  align: 'stretch',
  w: '100%',
  h: '100%',
  borderRadius: '2xl',
  p: 4,
  overflowY: 'auto',
  maxH: '80vh',
};

// User prompt Flex
export const extendedNodeUserFlexStyle = {
  w: '100%',
  justify: 'flex-end',
};

// User prompt Box
export const extendedNodeUserBoxStyle = {
  px: 4,
  py: 2,
  borderRadius: '2xl',
  maxWidth: '70%',
};

// User Avatar
export const extendedNodeUserAvatarStyle = {
  size: 'sm',
  ml: 2,
  name: 'You',
  bg: 'blue.500',
};

// AI response Flex
export const extendedNodeAIFlexStyle = {
  w: '100%',
  justify: 'flex-start',
};

// AI response Box
export const extendedNodeAIBoxStyle = {
  px: 4,
  py: 2,
  borderRadius: 'lg',
  maxWidth: '70%',
};

// AI Avatar
export const extendedNodeAIAvatarStyle = {
  size: 'sm',
  mr: 2,
  name: 'VizThink AI',
};

// Bottom input Flex
export const extendedNodeInputFlexStyle = {
  p: 4,
  sx: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
};

// Input box
export const extendedNodeInputStyle = {
  mr: 2,
  bg: 'transparent',
  color: 'white',
  borderColor: 'rgba(255, 255, 255, 0.3)',
  _placeholder: { color: 'gray.300' },
  _hover: { borderColor: 'rgba(255, 255, 255, 0.5)' },
  _focus: {
    borderColor: 'rgba(255, 255, 255, 0.7)',
    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.7)',
  },
};

// Send Button
export const extendedNodeSendButtonStyle = {
  colorScheme: 'blackAlpha',
};

//////////////////////////////////////////////////////////



///////////////ChatNode///////////////////////////////////

// Root VStack style for ChatNode
export const chatNodeVStackStyle = {
  spacing: 4,
  align: 'stretch',
  w: '70%',
  minW: '300px',
  maxW: '800px',
  p: 4,
  borderRadius: '2xl',
};

// User prompt Flex
export const chatNodeUserFlexStyle = {
  w: '100%',
  justify: 'flex-end',
};

// User prompt Box
export const chatNodeUserBoxStyle = {
  px: 4,
  py: 2,
  borderRadius: '2xl',
  maxWidth: '70%',
};

// User Avatar
export const chatNodeUserAvatarStyle = {
  size: 'sm',
  ml: 2,
  name: 'You',
  bg: 'blue.500',
};

// AI response Flex
export const chatNodeAIFlexStyle = {
  w: '100%',
  justify: 'flex-start',
};

// AI response Box
export const chatNodeAIBoxStyle = {
  px: 4,
  py: 2,
  borderRadius: 'lg',
  maxWidth: '70%',
};

// AI Avatar
export const chatNodeAIAvatarStyle = {
  size: 'sm',
  mr: 2,
  name: 'VizThink AI',
};

//////////////////////////////////////////////////////////


/////////Settings////////////////////////////////////////

// Outer Box (background)
export const settingsOuterBoxStyle: BoxProps = {
  h: '100vh',
  w: '100%',
  p: 8,
};

// Inner settings card Box
export const settingsCardBoxStyle: BoxProps = {
  maxW: '600px',
  mx: 'auto',
  borderWidth: 1,
  borderRadius: 'lg',
  boxShadow: 'md',
  p: 8,
  sx: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
};

// Settings heading
export const settingsHeadingStyle: HeadingProps = {
  mb: 6,
  size: 'lg',
};

// Generic FormControl (with bottom margin)
export const settingsFormControlStyle = {
  mb: 6,
};

// Preview node Box
export const settingsPreviewNodeBoxStyle: BoxProps = {
  p: 4,
  borderRadius: '2xl',
  maxW: '350px',
};

// Preview heading
export const settingsPreviewHeadingStyle: HeadingProps = {
  size: 'sm',
  mb: 2,
};

// Button group VStack
export const settingsButtonVStackStyle = {
  align: 'flex-end',
  spacing: 2,
};

// Button group Flex
export const settingsButtonFlexStyle: FlexProps = {
  justify: 'space-between',
  gap: 4,
};

// Confirm button (Link)
export const settingsConfirmButtonStyle: ButtonProps = {
  variant: 'outline',
  size: 'sm',
};

// Reset button
export const settingsResetButtonStyle: ButtonProps = {
  variant: 'outline',
  size: 'sm',
};


///////HeaderBar////////////////////////////////////////

// Outer Box (background)
export const headerBarOuterBoxStyle: BoxProps = {
  position: 'absolute',
  top: 4,
  left: 4,
  zIndex: 10,
};

export const headerBarFlexStyle: FlexProps = {
  justify: 'space-between',
  align: 'center',
  p: 3,
  borderRadius: 'lg',
  bg: 'rgba(255, 255, 255, 0.8)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  backdropFilter: 'blur(8px)',
  minW: 'fit-content',
  gap: 4,
};

export const headerBarHeadingStyle: HeadingProps = {
  size: 'md',
  color: 'white',
  bg: 'blackAlpha.500',
  px: 4,
  py: 2,
  borderRadius: 'md',
  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)',
  fontWeight: 'bold',
  letterSpacing: '0.5px',
};

export const headerBarSettingsButtonStyle: ButtonProps = {
  variant: 'ghost',
  size: 'sm',
  color: 'black',
  _hover: { bg: 'rgba(255, 255, 255, 0.9)' },
};
