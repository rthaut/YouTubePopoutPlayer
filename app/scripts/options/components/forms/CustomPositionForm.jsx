import React from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Grid,
  GridItem,
  Icon,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  VStack,
} from "@chakra-ui/react";
import { MdSave as SaveIcon } from "react-icons/md";

import { useOptionsForDomain } from "../../stores/optionsStore";

function CustomPositionForm() {
  const [options, { setOptions }] = useOptionsForDomain("position");
  console.log("CustomPositionForm ~ options", options);

  const [top, setTop] = React.useState(options.top);
  const [left, setLeft] = React.useState(options.left);

  const handlePositionInputChange = (dimension) => (newValue) => {
    const value = newValue !== "" ? parseInt(newValue, 10) : 0;
    switch (dimension) {
      case "top":
        setTop(value);
        break;

      case "left":
        setLeft(value);
        break;
    }
  };

  const validatePositions = () => {
    if (top === undefined || top === null) {
      console.warn("top is invalid", top);
      return false;
    }

    if (left === undefined || left === null) {
      console.warn("left is invalid", left);
      return false;
    }

    return true;
  };

  const positionChanged = () =>
    top !== options["top"] || left !== options["left"];

  return (
    <VStack align="stretch" gap={6} p={6}>
      <Alert status="warning">
        <AlertIcon />
        <AlertDescription
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("OptionsCustomPositionWarning"),
          }}
        />
      </Alert>
      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
        <GridItem>
          <InputGroup>
            <InputLeftAddon>
              {browser.i18n.getMessage("TopLabel")}
            </InputLeftAddon>
            <NumberInput
              value={parseInt(top, 10)}
              onChange={handlePositionInputChange("top")}
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon>
              {browser.i18n.getMessage("DimensionUnitsPixelsUnitLabel")}
            </InputRightAddon>
          </InputGroup>
        </GridItem>
        <GridItem>
          <InputGroup>
            <InputLeftAddon>
              {browser.i18n.getMessage("LeftLabel")}
            </InputLeftAddon>
            <NumberInput
              value={parseInt(left, 10)}
              onChange={handlePositionInputChange("left")}
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon>
              {browser.i18n.getMessage("DimensionUnitsPixelsUnitLabel")}
            </InputRightAddon>
          </InputGroup>
        </GridItem>
      </Grid>

      <Box px={8}>
        <Button
          width="100%"
          rightIcon={<Icon as={SaveIcon} />}
          isDisabled={!validatePositions() || !positionChanged()}
          onClick={() =>
            setOptions({
              top: parseInt(top, 10),
              left: parseInt(left, 10),
            })
          }
        >
          {browser.i18n.getMessage("ButtonSaveCustomPositionLabel")}
        </Button>
      </Box>
    </VStack>
  );
}

export default CustomPositionForm;
