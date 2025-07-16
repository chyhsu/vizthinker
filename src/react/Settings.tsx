import React from 'react';
import { Box, Heading, Select, FormControl, FormLabel, Input, Button, VStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Flex } from '@chakra-ui/react';
import {
  settingsOuterBoxStyle,
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
import { Link } from 'react-router-dom';
import { useSettings } from './SettingsContext';
import sunset from '../asset/images/20200916_174140.jpg';
import grassland from '../asset/images/IMG_3995.png';
import sea from '../asset/images/IMG_4013.png';
import defaultBg from '../asset/images/Icon.jpg';
const defaultColor = 'rgba(0, 0, 0, 0.7)';

const Settings: React.FC = () => {
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

  const backgroundOptions = [
    { label: 'Pure White', value: '#ffffff' },
    { label: 'Pure Black', value: '#000000' },
    { label: 'Logo Image', value: defaultBg },
    { label: 'Sunset', value: sunset },
    { label: 'Grassland', value: grassland },
    { label: 'Sea', value: sea },
  ];

  const providerOptions = [
    { label: 'Google Gemini', value: 'google' },
    { label: 'Ollama (Local)', value: 'ollama' },
    { label: 'OpenAI', value: 'openai' },
    { label: 'X (Grok)', value: 'x' },
    { label: 'Anthropic (Claude)', value: 'anthropic' },
  ];

  return (
    <Box
      {...settingsOuterBoxStyle}
      {...(draftBg.startsWith('#') ? 
        { bg: draftBg } : 
        {
          bgImage: `url(${draftBg})`,
          bgPosition: "center",
          bgRepeat: "no-repeat",
          bgSize: "cover"
        }
      )}
    >
      <Box 
        {...settingsCardBoxStyle} 
        boxShadow="2xl" 
        borderRadius="xl"
        color={isPureBlack ? 'black' : 'inherit'}
        sx={{
          ...(settingsCardBoxStyle.sx || {}),
          backgroundColor: isPureBlack ? 'rgba(255, 255, 255, 0.75)' : settingsCardBoxStyle.sx?.backgroundColor
        }}
      >
      <Heading {...settingsHeadingStyle}>Settings</Heading>

      {/* AI Provider Selection */}
      <FormControl mb={6}>
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
      <FormControl mb={6}>
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
      <FormControl mb={6}>
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
      <FormControl mb={6}>
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
      <FormControl mb={6}>
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
      <FormControl mb={6}>
        <FormLabel>Preview</FormLabel>
        <Box
          {...settingsPreviewNodeBoxStyle}
          sx={{ backgroundColor: hexToRgba(draftColor, draftOpacity) }}
        >
          <Heading {...settingsPreviewHeadingStyle} color={draftFontColor}>Preview Node</Heading>
          <Box color={draftFontColor}>This is how your chat node will look.</Box>
        </Box>
      </FormControl>

      {/* Confirm button */}
      <VStack {...settingsButtonVStackStyle}>
        <Flex {...settingsButtonFlexStyle}>
          <Button as={Link} to="/" {...settingsConfirmButtonStyle} onClick={applyChanges}>Confirm</Button>
          <Button {...settingsResetButtonStyle} onClick={resetDefaults}>Reset</Button>
        </Flex>
      </VStack>
      </Box>
    </Box>
  );
};

export default Settings;
