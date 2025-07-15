import React from 'react';
import { Box, Heading, Select, FormControl, FormLabel, Input, Button, VStack, Slider, SliderTrack, SliderFilledTrack, SliderThumb, Flex, grid } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useSettings } from './SettingsContext';
import sunset from '../asset/images/20200916_174140.jpg';
import grassland from '../asset/images/IMG_3995.png';
import sea from '../asset/images/IMG_4013.png';
import defaultBg from '../asset/images/Title.jpg';
const defaultColor = 'rgba(1, 3, 7, 0.2)';

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
  const [draftBg, setDraftBg] = React.useState(backgroundImage);
  const [draftColor, setDraftColor] = React.useState<string>(initialParsed.hex);
  const [draftOpacity, setDraftOpacity] = React.useState<number>(initialParsed.opacity);
  const [draftFontColor, setDraftFontColor] = React.useState<string>(fontColor);
  const [draftProvider, setDraftProvider] = React.useState(provider);

  // util to blend opacity
  const hexToRgba = (hex: string, opacity: number) => {
    const sanitized = hex.replace('#', '');
    const bigint = parseInt(sanitized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const applyChanges = () => {
    const rgbaColor = hexToRgba(draftColor, draftOpacity);
    setBackgroundImage(draftBg);
    setChatNodeColor(rgbaColor);
    setFontColor(draftFontColor);
    setProvider(draftProvider);
  };

  const resetDefaults = () => {
    setDraftBg(defaultBg);
    setDraftColor(defaultColor);
    setDraftOpacity(0.2);
    setDraftFontColor('#ffffff');
    setDraftProvider('google');
    setBackgroundImage(defaultBg);
    setChatNodeColor(defaultColor);
    setFontColor('#ffffff');
    setProvider('google');

  };

  const backgroundOptions = [
    { label: 'Default', value: defaultBg },
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
      h="100vh"
      w="100%"
      bgImage={`linear-gradient(rgba(75, 71, 71, 0.4), rgba(75, 71, 71, 0.4)), url(${draftBg})`}
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      p={8}
    >
      <Box
        maxW="600px"
        mx="auto"
        borderWidth={1}
        borderRadius="lg"
        boxShadow="md"
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
        p={8}
      >
      <Heading mb={6} size="lg">Settings</Heading>

      {/* AI Provider Selection */}
      <FormControl mb={6}>
        <FormLabel>AI Provider</FormLabel>
        <Select
          value={draftProvider}
          onChange={(e) => setDraftProvider(e.target.value as any)}
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
        />
      </FormControl>

      {/* Font Color */}
      <FormControl mb={6}>
        <FormLabel>Font Color</FormLabel>
        <Input type="color" value={draftFontColor} onChange={(e)=>setDraftFontColor(e.target.value)} />
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
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>

      {/* Live preview */}
      <FormControl mb={6}>
        <FormLabel>Preview</FormLabel>
        <Box
          p={4}
          borderRadius="2xl"
          maxW="350px"
          sx={{
            backgroundColor: hexToRgba(draftColor, draftOpacity),
          }}
        >
          <Heading size="sm" mb={2} color={draftFontColor}>Preview Node</Heading>
          <Box color={draftFontColor}>This is how your chat node will look.</Box>
        </Box>
      </FormControl>

      {/* Confirm button */}
      <VStack  align="flex-end" spacing={2}>
        <Flex justify="space-between" gap={4}>
          <Button as={Link} to="/" variant="outline" size="sm" onClick={applyChanges}>Confirm</Button>
          <Button variant="outline" size="sm" onClick={resetDefaults}>Reset</Button>
        </Flex>
      </VStack>
      </Box>
    </Box>
  );
};

export default Settings;
