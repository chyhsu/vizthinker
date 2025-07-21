import React, { useState } from 'react';
import { Box, Button, Flex, Heading, HStack, Icon } from '@chakra-ui/react';
import { FaDownload } from 'react-icons/fa';
import { headerBarOuterBoxStyle, headerBarFlexStyle, headerBarHeadingStyle, headerBarSettingsButtonStyle } from '../typejs/style';
import SettingsModal from './Settings';
import ExportModal from './ExportModal';

const HeaderBar: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

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
              onClick={() => setIsSettingsOpen(true)}
              {...headerBarSettingsButtonStyle}
            >
              Settings
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