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
import {
  DEFAULT_SETTINGS,
  BACKGROUND_OPTIONS,
  PROVIDER_OPTIONS,
  COLOR_UTILS,
  TOAST_MESSAGES,
  SPECIAL_BACKGROUNDS,
} from '../constants/settingsConstants';

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

  const initialParsed = COLOR_UTILS.parseRgba(chatNodeColor);

  // local draft state
  const [draftBg, setDraftBg] = React.useState(backgroundImage || DEFAULT_SETTINGS.BACKGROUND);
  const [draftColor, setDraftColor] = React.useState<string>(initialParsed.hex);
  const [draftOpacity, setDraftOpacity] = React.useState<number>(initialParsed.opacity);
  const [draftFontColor, setDraftFontColor] = React.useState<string>(fontColor);
  const [draftProvider, setDraftProvider] = React.useState(provider);

  // Reset draft state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const parsed = COLOR_UTILS.parseRgba(chatNodeColor);
      setDraftBg(backgroundImage || DEFAULT_SETTINGS.BACKGROUND);
      setDraftColor(parsed.hex);
      setDraftOpacity(parsed.opacity);
      setDraftFontColor(fontColor);
      setDraftProvider(provider);
    }
  }, [isOpen, backgroundImage, chatNodeColor, fontColor, provider]);

  // Auto-adjust font color based on background
  React.useEffect(() => {
    if (draftBg === SPECIAL_BACKGROUNDS.PURE_BLACK) {
      setDraftColor(SPECIAL_BACKGROUNDS.PURE_WHITE);
      setDraftFontColor(SPECIAL_BACKGROUNDS.PURE_BLACK); // black text for white node
    } else {
      // when switching away from pure black bg, reset to defaults
      const parsedDefault = COLOR_UTILS.parseRgba(DEFAULT_SETTINGS.COLOR);
      setDraftColor(parsedDefault.hex);
      setDraftOpacity(parsedDefault.opacity);
      setDraftFontColor(DEFAULT_SETTINGS.FONT_COLOR); // white text for default node
    }
  }, [draftBg]);

  const isPureBlack = draftBg === SPECIAL_BACKGROUNDS.PURE_BLACK;

  const applyChanges = () => {
    const rgbaColor = COLOR_UTILS.hexToRgba(draftColor, draftOpacity);
    setBackgroundImage(draftBg);
    setChatNodeColor(rgbaColor);
    setFontColor(draftFontColor);
    setProvider(draftProvider);
    onClose();
  };

  const resetDefaults = () => {
    const parsedDefault = COLOR_UTILS.parseRgba(DEFAULT_SETTINGS.COLOR);
    setDraftBg(DEFAULT_SETTINGS.BACKGROUND);
    setDraftColor(parsedDefault.hex);
    setDraftOpacity(parsedDefault.opacity);
    setDraftFontColor(DEFAULT_SETTINGS.FONT_COLOR); 
    setDraftProvider(DEFAULT_SETTINGS.PROVIDER);
    setBackgroundImage(DEFAULT_SETTINGS.BACKGROUND);
    setChatNodeColor(DEFAULT_SETTINGS.COLOR);
    setFontColor(DEFAULT_SETTINGS.FONT_COLOR); 
    setProvider(DEFAULT_SETTINGS.PROVIDER);
  };

  const handleClearAllConversations = async () => {
    try {
      await clearAllConversations();
      toast(TOAST_MESSAGES.CLEAR_SUCCESS);
    } catch (error) {
      console.error('Error clearing conversations:', error);
      toast(TOAST_MESSAGES.CLEAR_ERROR);
    }
  };



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
                {PROVIDER_OPTIONS.map((opt) => (
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
                {BACKGROUND_OPTIONS.map((opt) => (
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
                sx={{ backgroundColor: COLOR_UTILS.hexToRgba(draftColor, draftOpacity) }}
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
