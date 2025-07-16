import React from 'react';
import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { headerBarOuterBoxStyle, headerBarFlexStyle, headerBarHeadingStyle, headerBarSettingsButtonStyle } from '../typejs/style';

const HeaderBar: React.FC = () => {
  return (
    <Box {...headerBarOuterBoxStyle}>
      <Flex {...headerBarFlexStyle}>
        <Heading {...headerBarHeadingStyle}>
          VizThinker
        </Heading>
        <Button
          as={Link}
          to="/settings"
          {...headerBarSettingsButtonStyle}
        >
          Settings
        </Button>
      </Flex>
    </Box>
  );
};

export default HeaderBar; 