import React, { useState } from 'react';
import { Box, Button, Flex, Heading, HStack, Icon, useToast } from '@chakra-ui/react';
import { FaDownload, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { headerBarOuterBoxStyle, headerBarFlexStyle, headerBarHeadingStyle, headerBarSettingsButtonStyle } from '../typejs/style';
import SettingsModal from './Settings';
import ExportModal from './ExportModal';
import useStore from '../typejs/store';
import { useSettings } from './SettingsContext';

const HeaderBar: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { clearAllConversations, logout } = useStore();
  const { provider, providerModels } = useSettings();
  const toast = useToast();

  const handleClearAll = async () => {
    if (isClearing) return;
    
    setIsClearing(true);
    try {
      const selectedModel = providerModels[provider as keyof typeof providerModels];
      await clearAllConversations(provider, selectedModel);
      toast({
        title: "Conversations Cleared",
        description: "All conversation records have been successfully cleared",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Clear Failed", 
        description: "Failed to clear conversations, please try again",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <Box {...headerBarOuterBoxStyle}>
        <Flex {...headerBarFlexStyle}>
          <Heading {...headerBarHeadingStyle}>
            VizThinker
          </Heading>
          <HStack spacing={3}>
            <Button
              onClick={() => setIsExportOpen(true)}
              {...headerBarSettingsButtonStyle}
              leftIcon={<Icon as={FaDownload} />}
            >
              Export
            </Button>
            <Button
              onClick={handleClearAll}
              {...headerBarSettingsButtonStyle}
              leftIcon={<Icon as={FaTrash} />}
              isLoading={isClearing}
              colorScheme="red"
              variant="outline"
              _hover={{ bg: 'red.50', borderColor: 'red.400' }}
            >
              Clear All
            </Button>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              {...headerBarSettingsButtonStyle}
            >
              Settings
            </Button>
            <Button
              onClick={handleLogout}
              {...headerBarSettingsButtonStyle}
              leftIcon={<Icon as={FaSignOutAlt} />}
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
      />
    </>
  );
};

export default HeaderBar; 