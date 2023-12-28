import React from "react";
import {
  Alert,
  Box,
  ChakraProvider,
  Divider,
  Flex,
  Icon,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { MdOutlineCloudOff as CloudOffIcon } from "react-icons/md";

import ColorModeToggle from "./components/ColorModeToggle";
import ResetOptions from "./components/ResetOptions";
import AdvancedTab, {
  DOMAIN as AdvancedDomain,
} from "./components/tabs/AdvancedTab";
import BehaviorTab, {
  DOMAIN as BehaviorDomain,
} from "./components/tabs/BehaviorTab";
import SizePositionTab, {
  DOMAIN as SizePositionDomain,
} from "./components/tabs/SizePositionTab";

export default function OptionsApp() {
  React.useEffect(() => {
    document.title = browser.i18n.getMessage("OptionsPageTitle");
  }, []);

  const tabs = {
    [BehaviorDomain]: <BehaviorTab />,
    [SizePositionDomain]: <SizePositionTab />,
    [AdvancedDomain]: <AdvancedTab />,
  };

  return (
    <ChakraProvider>
      <VStack spacing={4} align="stretch">
        <Box borderWidth={1}>
          <Tabs isFitted>
            <TabList>
              {Object.keys(tabs).map((tab) => (
                <Tab key={tab}>
                  {browser.i18n.getMessage(`OptionsTabName${tab}`)}
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              {Object.entries(tabs).map(([domain, panel]) => (
                <TabPanel key={domain}>{panel}</TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </Box>
        <Box>
          <Alert status="info">
            <Icon as={CloudOffIcon} boxSize={8} mr={4} />
            <Text
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage("OptionsPerDeviceWarning"),
              }}
            />
          </Alert>
        </Box>
        <Divider borderColor="gray.200" />
        <Box mb={4} px={4}>
          <Flex alignItems="center">
            <ResetOptions />
            <Spacer />
            <ColorModeToggle />
          </Flex>
        </Box>
      </VStack>
    </ChakraProvider>
  );
}
