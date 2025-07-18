import React, { useState } from 'react';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { headerBarOuterBoxStyle, headerBarFlexStyle, headerBarHeadingStyle, headerBarSettingsButtonStyle } from '../typejs/style';
import SettingsModal from './Settings';

const HeaderBar: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <Box {...headerBarOuterBoxStyle}>
        <Flex {...headerBarFlexStyle}>
          <Heading {...headerBarHeadingStyle}>
            VizThinker
          </Heading>
          <Button
            onClick={() => setIsSettingsOpen(true)}
            {...headerBarSettingsButtonStyle}
          >
            Settings
          </Button>
        </Flex>
      </Box>
      
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default HeaderBar; 