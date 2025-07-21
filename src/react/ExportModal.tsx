import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Icon,
  Box,
  useToast,
  Divider,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { 
  FaFileImage, 
  FaDownload,
  FaGlobe
} from 'react-icons/fa';
import useStore from '../typejs/store';
import { useSettings } from './SettingsContext';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { 
    exportAsImage, 
    exportAsHTML,
    nodes 
  } = useStore();
  const { fontColor } = useSettings();
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const toast = useToast();

  const handleExport = async (type: string, exportFunction: () => void | Promise<void>) => {
    setIsExporting(type);
    try {
      await exportFunction();
      toast({
        title: "Export Successful",
        description: `Your conversation has been exported as ${type.toUpperCase()}.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsExporting(null);
    }
  };

  const exportOptions = [
    {
      id: 'html',
      title: 'Export as HTML',
      description: 'Beautiful web page with complete conversation - perfect for viewing and printing',
      icon: FaGlobe,
      color: 'teal',
      action: () => handleExport('html', exportAsHTML),
      disabled: nodes.length === 0,
      featured: true,
    },
    {
      id: 'image',
      title: 'Export as Image',
      description: 'Download the entire graph as a high-quality PNG image',
      icon: FaFileImage,
      color: 'blue',
      action: () => handleExport('image', exportAsImage),
      disabled: nodes.length === 0,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
        bg="rgba(255, 255, 255, 0.95)"
        backdropFilter="blur(10px)"
        border="1px solid rgba(255, 255, 255, 0.2)"
        borderRadius="20px"
        boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        maxW={{ base: "90vw", md: "600px" }}
        maxH="90vh"
        overflow="hidden"
      >
        <ModalHeader color={fontColor}>
          <HStack spacing={3}>
            <Icon as={FaDownload} />
            <Text>Export Conversation</Text>
            <Badge colorScheme="blue" variant="subtle">
              {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}
            </Badge>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6} overflowY="auto" maxH="60vh">
          <VStack spacing={4} align="stretch">
            <Text fontSize="sm" color="gray.600">
              Choose your preferred export format. 
              <Text as="span" fontWeight="semibold" color="teal.600">
                HTML export
              </Text> provides the complete interactive view, while 
              <Text as="span" fontWeight="semibold" color="blue.600">
                PNG export
              </Text> gives you a high-quality image of your graph.
            </Text>
            
            <Divider />

            {exportOptions.map((option) => (
              <Box key={option.id}>
                <Button
                  onClick={option.action}
                  isDisabled={option.disabled || isExporting !== null}
                  isLoading={isExporting === option.id}
                  spinner={<Spinner size="sm" />}
                  w="100%"
                  h="auto"
                  p={4}
                  justifyContent="flex-start"
                  variant="ghost"
                  border="2px solid"
                  borderColor={(option as any).featured ? `${option.color}.300` : "gray.200"}
                  borderRadius="12px"
                  bg={(option as any).featured ? `${option.color}.25` : "transparent"}
                  _hover={{
                    borderColor: `${option.color}.300`,
                    bg: `${option.color}.50`,
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  _disabled={{
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }}
                  transition="all 0.2s ease"
                  position="relative"
                >
                  {(option as any).featured && (
                    <Badge
                      position="absolute"
                      top="-8px"
                      right="10px"
                      colorScheme={option.color}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="full"
                    >
                      ⭐ Recommended
                    </Badge>
                  )}
                  
                  <HStack spacing={4} w="100%">
                    <Box
                      p={3}
                      borderRadius="10px"
                      bg={`${option.color}.100`}
                      color={`${option.color}.600`}
                    >
                      <Icon as={option.icon} boxSize={5} />
                    </Box>
                    
                    <VStack align="start" spacing={1} flex={1}>
                      <Text 
                        fontWeight="semibold" 
                        color={fontColor}
                        fontSize="md"
                      >
                        {option.title}
                        {(option as any).featured && (
                          <Badge ml={2} colorScheme={option.color} size="sm">
                            Complete View
                          </Badge>
                        )}
                      </Text>
                      <Text 
                        fontSize="sm" 
                        color="gray.600"
                        textAlign="left"
                        wordBreak="break-word"
                        whiteSpace="normal"
                      >
                        {option.description}
                      </Text>
                    </VStack>

                    {!option.disabled && isExporting !== option.id && (
                      <Icon as={FaDownload} color="gray.400" />
                    )}
                  </HStack>
                </Button>
              </Box>
            ))}

            {nodes.length === 0 && (
              <Box
                p={4}
                borderRadius="12px"
                bg="yellow.50"
                border="1px solid"
                borderColor="yellow.200"
                textAlign="center"
              >
                <Text color="yellow.700" fontSize="sm">
                  No conversation to export. Start chatting to create content!
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ExportModal; 