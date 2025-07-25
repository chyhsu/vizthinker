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
  Flex,
  Text,
  Link,
  Icon,
  InputGroup,
  InputRightElement,
  IconButton,
  HStack,
  Badge,
  Collapse,
  Divider
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaEye, FaEyeSlash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';
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
  API_KEY_CONFIG,
  API_KEY_UTILS,
  MODEL_OPTIONS,
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
    apiKeys,
    providerModels,
    setBackgroundImage,
    setChatNodeColor,
    setFontColor,
    setProvider,
    setApiKey,
    setProviderModel,
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
  const [draftApiKeys, setDraftApiKeys] = React.useState(apiKeys);
  const [draftProviderModels, setDraftProviderModels] = React.useState(providerModels);
  const [showApiKeys, setShowApiKeys] = React.useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = React.useState<Record<string, boolean>>({
    google: true,
    openai: true,
    anthropic: true,
    x: true,
    ollama: true,
  });

  // Reset draft state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const parsed = COLOR_UTILS.parseRgba(chatNodeColor);
      setDraftBg(backgroundImage || DEFAULT_SETTINGS.BACKGROUND);
      setDraftColor(parsed.hex);
      setDraftOpacity(parsed.opacity);
      setDraftFontColor(fontColor);
      setDraftProvider(provider);
      setDraftApiKeys(apiKeys);
      setDraftProviderModels(providerModels);
      setShowApiKeys({});
      setCollapsedSections({
        google: true,
        openai: true,
        anthropic: true,
        x: true,
        ollama: true,
      });
    }
  }, [isOpen, backgroundImage, chatNodeColor, fontColor, provider, apiKeys, providerModels]);

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

  const applyChanges = async () => {
    try {
      const rgbaColor = COLOR_UTILS.hexToRgba(draftColor, draftOpacity);
      setBackgroundImage(draftBg);
      setChatNodeColor(rgbaColor);
      setFontColor(draftFontColor);
      setProvider(draftProvider);
      
      // Apply API keys locally
      Object.entries(draftApiKeys).forEach(([provider, key]) => {
        setApiKey(provider as keyof typeof draftApiKeys, key);
      });

      // Apply provider models locally
      Object.entries(draftProviderModels).forEach(([provider, model]) => {
        setProviderModel(provider as keyof typeof draftProviderModels, model);
      });

      // Send API keys to backend
      try {
        const { API_ENDPOINTS } = await import('../config/api');
        await axios.post(API_ENDPOINTS.SETTINGS_API_KEYS, {
          api_keys: draftApiKeys
        });
        toast({
          ...TOAST_MESSAGES.SETTINGS_SAVED,
          description: "Settings and API keys have been saved successfully"
        });
      } catch (apiError) {
        console.error('Error saving API keys to backend:', apiError);
        toast({
          title: "Settings Saved",
          description: "UI settings saved, but API keys may need to be re-entered",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error applying settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetDefaults = () => {
    const parsedDefault = COLOR_UTILS.parseRgba(DEFAULT_SETTINGS.COLOR);
    setDraftBg(DEFAULT_SETTINGS.BACKGROUND);
    setDraftColor(parsedDefault.hex);
    setDraftOpacity(parsedDefault.opacity);
    setDraftFontColor(DEFAULT_SETTINGS.FONT_COLOR); 
    setDraftProvider(DEFAULT_SETTINGS.PROVIDER);
    setDraftApiKeys({ google: '', openai: '', anthropic: '', x: '' });
    setDraftProviderModels(DEFAULT_SETTINGS.PROVIDER_MODELS);
    setBackgroundImage(DEFAULT_SETTINGS.BACKGROUND);
    setChatNodeColor(DEFAULT_SETTINGS.COLOR);
    setFontColor(DEFAULT_SETTINGS.FONT_COLOR); 
    setProvider(DEFAULT_SETTINGS.PROVIDER);
    Object.entries(draftApiKeys).forEach(([provider]) => {
      setApiKey(provider as keyof typeof draftApiKeys, '');
    });
    Object.entries(DEFAULT_SETTINGS.PROVIDER_MODELS).forEach(([provider, model]) => {
      setProviderModel(provider as keyof typeof DEFAULT_SETTINGS.PROVIDER_MODELS, model);
    });
  };

  const handleClearAllConversations = async () => {
    try {
      const selectedModel = draftProviderModels[draftProvider as keyof typeof draftProviderModels];
      await clearAllConversations(draftProvider, selectedModel);
      toast(TOAST_MESSAGES.CLEAR_SUCCESS);
    } catch (error) {
      console.error('Error clearing conversations:', error);
      toast(TOAST_MESSAGES.CLEAR_ERROR);
    }
  };

  const handleApiKeyChange = (provider: string, value: string) => {
    setDraftApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleModelChange = (provider: string, model: string) => {
    setDraftProviderModels(prev => ({
      ...prev,
      [provider]: model
    }));
  };

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderProviderSection = (providerKey: string) => {
    const provider = providerKey as keyof typeof API_KEY_CONFIG;
    const config = API_KEY_CONFIG[provider];
    if (!config) return null;

    const currentKey = draftApiKeys[provider] || '';
    const currentModel = draftProviderModels[provider] || DEFAULT_SETTINGS.PROVIDER_MODELS[provider];
    const isValid = API_KEY_UTILS.validateApiKey(provider, currentKey);
    const isVisible = showApiKeys[provider];
    const isCollapsed = collapsedSections[provider];
    const modelOptions = MODEL_OPTIONS[provider] || [];

    return (
      <Box key={provider} border="1px" borderColor="gray.200" borderRadius="md" p={4} bg="gray.50">
        <HStack justify="space-between" align="center" mb={isCollapsed ? 0 : 4}>
          <Heading size="sm" color="gray.700" display="flex" alignItems="center">
            {config.label.replace(' API Key', '')}
            {currentKey && (
              <Badge ml={2} colorScheme={isValid ? 'green' : 'yellow'} size="sm">
                {isValid ? 'Connected' : 'Check Format'}
              </Badge>
            )}
          </Heading>
          <IconButton
            aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
            icon={isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            size="sm"
            variant="ghost"
            onClick={() => toggleSection(provider)}
          />
        </HStack>

        <Collapse in={!isCollapsed} animateOpacity>
          <VStack spacing={4} align="stretch">
            {/* Model Selection */}
            <FormControl>
              <FormLabel fontSize="sm" fontWeight="medium">Model</FormLabel>
              <Select
                value={currentModel}
                onChange={(e) => handleModelChange(provider, e.target.value)}
                bg="white"
                borderColor="gray.300"
                borderWidth="1px"
                size="sm"
                _hover={{ borderColor: "blue.400" }}
                _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
              >
                {modelOptions.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </Select>
            </FormControl>

                         {/* API Key - Skip for Ollama */}
             {(provider as string) !== 'ollama' && (
               <FormControl>
                <HStack justify="space-between" align="center" mb={2}>
                  <FormLabel mb={0} fontSize="sm" fontWeight="medium">
                    API Key
                  </FormLabel>
                  <Link href={config.helpUrl} isExternal fontSize="xs" color="blue.500">
                    Get API Key <Icon as={FaExternalLinkAlt} mx="2px" />
                  </Link>
                </HStack>
                <InputGroup>
                  <Input
                    type={isVisible ? 'text' : 'password'}
                    value={currentKey}
                    onChange={(e) => handleApiKeyChange(provider, e.target.value)}
                    placeholder={config.placeholder}
                    bg="white"
                    borderColor={currentKey ? (isValid ? 'green.300' : 'yellow.300') : 'gray.300'}
                    borderWidth="1px"
                    size="sm"
                    _hover={{ borderColor: currentKey ? (isValid ? 'green.400' : 'yellow.400') : 'blue.400' }}
                    _focus={{ borderColor: currentKey ? (isValid ? 'green.500' : 'yellow.500') : 'blue.500', boxShadow: "0 0 0 1px " + (currentKey ? (isValid ? 'green.500' : 'yellow.500') : 'blue.500') }}
                  />
                  <InputRightElement>
                    <IconButton
                      aria-label={isVisible ? 'Hide API key' : 'Show API key'}
                      icon={isVisible ? <FaEyeSlash /> : <FaEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowApiKey(provider)}
                    />
                  </InputRightElement>
                </InputGroup>
                <Text fontSize="xs" color="gray.600" mt={1}>
                  {config.helpText}
                </Text>
              </FormControl>
            )}
          </VStack>
        </Collapse>
      </Box>
    );
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
              <HStack justify="space-between" align="center" mb={2}>
                <FormLabel mb={0}>AI Provider</FormLabel>
                <Badge colorScheme="blue" variant="solid" fontSize="xs">
                  Currently: {PROVIDER_OPTIONS.find(opt => opt.value === provider)?.label || provider}
                </Badge>
              </HStack>
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

            {/* Provider Configuration */}
            <Box>
              <Heading size="md" mb={4} color="gray.700">
                Provider Configuration
              </Heading>
              <VStack spacing={3} align="stretch">
                {Object.keys(API_KEY_CONFIG).map(renderProviderSection)}
                {/* Ollama Section */}
                <Box border="1px" borderColor="gray.200" borderRadius="md" p={4} bg="gray.50">
                  <HStack justify="space-between" align="center" mb={collapsedSections['ollama'] ? 0 : 4}>
                    <Heading size="sm" color="gray.700">
                      Ollama (Local)
                    </Heading>
                    <IconButton
                      aria-label={collapsedSections['ollama'] ? 'Expand section' : 'Collapse section'}
                      icon={collapsedSections['ollama'] ? <FaChevronDown /> : <FaChevronUp />}
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSection('ollama')}
                    />
                  </HStack>
                  <Collapse in={!collapsedSections['ollama']} animateOpacity>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="medium">Model</FormLabel>
                      <Select
                        value={draftProviderModels.ollama}
                        onChange={(e) => handleModelChange('ollama', e.target.value)}
                        bg="white"
                        borderColor="gray.300"
                        borderWidth="1px"
                        size="sm"
                        _hover={{ borderColor: "blue.400" }}
                        _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      >
                        {MODEL_OPTIONS.ollama.map((model) => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </Select>
                      <Text fontSize="xs" color="gray.600" mt={1}>
                        Requires Ollama to be running locally. No API key needed.
                      </Text>
                    </FormControl>
                  </Collapse>
                </Box>
              </VStack>
            </Box>

            <Divider />

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
