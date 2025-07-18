import React from 'react';
import { 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton,
  Box, 
  Heading, 
  Select, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  VStack, 
  Slider, 
  SliderTrack, 
  SliderFilledTrack, 
  SliderThumb, 
  Flex 
} from '@chakra-ui/react';
import {
  settingsCardBoxStyle,
  settingsHeadingStyle,
  settingsFormControlStyle,
  settingsPreviewNodeBoxStyle,
  settingsPreviewHeadingStyle,
  settingsButtonVStackStyle,
  settingsButtonFlexStyle,
  settingsConfirmButtonStyle,
  settingsResetButtonStyle
} from '../typejs/style';
import { useSettings } from './SettingsContext';
import useStore from '../typejs/store';
import { useToast } from '@chakra-ui/react';
import sunset from '../asset/images/20200916_174140.jpg';
import grassland from '../asset/images/IMG_3995.png';
import sea from '../asset/images/IMG_4013.png';
import defaultBg from '../asset/images/Icon.jpg';

const defaultColor = 'rgba(0, 0, 0, 0.7)';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  // global context
  const {
    backgroundImage,
    chatNodeColor,
    fontColor,
    provider,
    setBackgroundImage,
    setChatNodeColor,
    setFontColor,
    setProvider,
  } = useSettings();

  // store context
  const { clearAllConversations } = useStore();
  const toast = useToast();

  // helper to convert stored rgba color into hex + opacity for the UI controls
  const parseRgba = (rgba: string): { hex: string; opacity: number } => {
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([0-9.]+)?\)/);
    if (!match) return { hex: '#000000', opacity: 1 };
    const r = Number(match[1]);
    const g = Number(match[2]);
    const b = Number(match[3]);
    const a = match[4] !== undefined ? Number(match[4]) : 1;
    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return { hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, opacity: a };
  };

  const initialParsed = parseRgba(chatNodeColor);

  // local draft state
  const [draftBg, setDraftBg] = React.useState(backgroundImage || '#ffffff');
  const [draftColor, setDraftColor] = React.useState<string>(initialParsed.hex);
  const [draftOpacity, setDraftOpacity] = React.useState<number>(initialParsed.opacity);
  const [draftFontColor, setDraftFontColor] = React.useState<string>(fontColor);
  const [draftProvider, setDraftProvider] = React.useState(provider);

  // Reset draft state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const parsed = parseRgba(chatNodeColor);
      setDraftBg(backgroundImage || '#ffffff');
      setDraftColor(parsed.hex);
      setDraftOpacity(parsed.opacity);
      setDraftFontColor(fontColor);
      setDraftProvider(provider);
    }
  }, [isOpen, backgroundImage, chatNodeColor, fontColor, provider]);

  // Auto-adjust font color based on background
  React.useEffect(() => {
    if (draftBg === '#000000') {
      setDraftColor('#ffffff');
      setDraftFontColor('#000000'); // black text for white node
    } else {
      // when switching away from pure black bg, reset to defaults
      const parsedDefault = parseRgba(defaultColor);
      setDraftColor(parsedDefault.hex);
      setDraftOpacity(parsedDefault.opacity);
      setDraftFontColor('#ffffff'); // white text for default node
    }
  }, [draftBg]);

  // util to blend opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const isPureBlack = draftBg === '#000000';

  const applyChanges = () => {
    const rgbaColor = hexToRgba(draftColor, draftOpacity);
    setBackgroundImage(draftBg);
    setChatNodeColor(rgbaColor);
    setFontColor(draftFontColor);
    setProvider(draftProvider);
    onClose();
  };

  const resetDefaults = () => {
    const parsedDefault = parseRgba(defaultColor);
    setDraftBg('#ffffff');
    setDraftColor(parsedDefault.hex);
    setDraftOpacity(parsedDefault.opacity);
    setDraftFontColor('#ffffff'); 
    setDraftProvider('google');
    setBackgroundImage('#ffffff');
    setChatNodeColor(defaultColor);
    setFontColor('#ffffff'); 
    setProvider('google');
  };

  const handleClearAllConversations = async () => {
    try {
      await clearAllConversations();
      toast({
        title: "Success",
        description: "All conversation records have been cleared successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error clearing conversations:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversation records. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const backgroundOptions = [
    { value: '#ffffff', label: 'White' },
    { value: '#000000', label: 'Black' },
    { value: sunset, label: 'Sunset' },
    { value: grassland, label: 'Grassland' },
    { value: sea, label: 'Sea' },
    { value: defaultBg, label: 'Default' },
  ];

  const providerOptions = [
    { value: 'google', label: 'Google' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="600px" maxH="90vh">
        <ModalHeader>
          <Heading {...settingsHeadingStyle}>Settings</Heading>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* AI Provider Selection */}
            <FormControl>
              <FormLabel>AI Provider</FormLabel>
              <Select
                value={draftProvider}
                onChange={(e) => setDraftProvider(e.target.value as any)}
                bg="white"
                borderColor="gray.300"
                borderWidth="2px"
                boxShadow="md"
                _hover={{ borderColor: "blue.400", boxShadow: "lg" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
              >
                {providerOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Background Image Selection */}
            <FormControl>
              <FormLabel>Chat Window Background</FormLabel>
              <Select
                value={draftBg}
                onChange={(e) => setDraftBg(e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderWidth="2px"
                boxShadow="md"
                _hover={{ borderColor: "blue.400", boxShadow: "lg" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
              >
                {backgroundOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Chat Node Background Color */}
            <FormControl>
              <FormLabel>Chat Node Background Color</FormLabel>
              <Input
                type="color"
                value={draftColor}
                onChange={(e) => setDraftColor(e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderWidth="2px"
                boxShadow="md"
                _hover={{ borderColor: "blue.400", boxShadow: "lg" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
              />
            </FormControl>

            {/* Font Color */}
            <FormControl>
              <FormLabel>Font Color</FormLabel>
              <Input 
                type="color" 
                value={draftFontColor} 
                onChange={(e)=>setDraftFontColor(e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderWidth="2px"
                boxShadow="md"
                _hover={{ borderColor: "blue.400", boxShadow: "lg" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
              />
            </FormControl>

            {/* Opacity */}
            <FormControl>
              <FormLabel>Opacity</FormLabel>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={draftOpacity}
                onChange={setDraftOpacity}
              >
                <SliderTrack bg="gray.200" h="6px">
                  <SliderFilledTrack bg="blue.400" />
                </SliderTrack>
                <SliderThumb bg="blue.500" boxShadow="md" _hover={{ transform: "scale(1.1)" }} />
              </Slider>
            </FormControl>

            {/* Live preview */}
            <FormControl>
              <FormLabel>Preview</FormLabel>
              <Box
                {...settingsPreviewNodeBoxStyle}
                sx={{ backgroundColor: hexToRgba(draftColor, draftOpacity) }}
              >
                <Heading {...settingsPreviewHeadingStyle} color={draftFontColor}>Preview Node</Heading>
                <Box color={draftFontColor}>This is how your chat node will look.</Box>
              </Box>
            </FormControl>

            {/* Clear All Conversations */}
            <FormControl>
              <FormLabel>Data Management</FormLabel>
              <Button
                colorScheme="red"
                variant="outline"
                w="100%"
                onClick={handleClearAllConversations}
                _hover={{ bg: 'red.50', borderColor: 'red.400' }}
              >
                Clear All Conversation Records
              </Button>
            </FormControl>

            {/* Action buttons */}
            <VStack {...settingsButtonVStackStyle}>
              <Flex {...settingsButtonFlexStyle}>
                <Button {...settingsConfirmButtonStyle} onClick={applyChanges}>Confirm</Button>
                <Button {...settingsResetButtonStyle} onClick={resetDefaults}>Reset</Button>
              </Flex>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default SettingsModal;
