import React from "react";
import {
  Flex,
  FormControl,
  FormLabel,
  Switch,
  useColorMode,
} from "@chakra-ui/react";

export default function ColorModeToggle() {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <FormControl width="auto">
      <Flex gap={2} alignItems="center">
        <Switch
          id="force-dark-mode-toggle"
          isChecked={colorMode === "dark"}
          onChange={(event) =>
            setColorMode(event.target.checked ? "dark" : "light")
          }
        />
        <FormLabel htmlFor="force-dark-mode-toggle" mb="0">
          {browser.i18n.getMessage("OptionsPageForceDarkMode")}
        </FormLabel>
      </Flex>
    </FormControl>
  );
}
