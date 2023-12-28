import React from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
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
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";
import { MdSave as SaveIcon } from "react-icons/md";
import { usePrevious } from "react-use";

import { OPTIONS_SIZE_UNITS_VALUES } from "../../../helpers/constants";
import {
  GetDimensionForScreenPercentage,
  GreatestCommonDenominator,
} from "../../../helpers/utils";
import { useOptionsForDomain } from "../../stores/optionsStore";

function CustomDimensionsInfoTable({ units, width, height }) {
  if (units === "percentage") {
    width = GetDimensionForScreenPercentage("Width", width);
    height = GetDimensionForScreenPercentage("Height", height);
  }

  const ratio = GreatestCommonDenominator(width, height);

  return (
    <Box>
      <TableContainer>
        <Table size="sm">
          <Tbody>
            <Tr>
              <Td component="th" scope="row">
                {browser.i18n.getMessage("InfoCurrentScreenResolutionLabel")}
              </Td>
              <Td>
                <strong>
                  {window.screen.width} &times; {window.screen.height}
                </strong>
              </Td>
            </Tr>
            <Tr>
              <Td component="th" scope="row">
                {browser.i18n.getMessage("InfoPopoutPlayerWindowSizeLabel")}
              </Td>
              <Td>
                <strong>
                  {width} &times; {height}
                </strong>
              </Td>
            </Tr>
            <Tr>
              <Td component="th" scope="row">
                {browser.i18n.getMessage("InfoPopoutPlayerAspectRatioLabel")}
              </Td>
              <Td>
                <strong>
                  {width / ratio}:{height / ratio}
                </strong>
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
}

CustomDimensionsInfoTable.propTypes = {
  units: PropTypes.oneOf(OPTIONS_SIZE_UNITS_VALUES).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

function CustomDimensionsForm() {
  const [options, { setOptions }] = useOptionsForDomain("size");
  console.log("CustomDimensionsForm ~ options", options);

  const [units, setUnits] = React.useState(options.units);
  const [width, setWidth] = React.useState(options.width);
  const [height, setHeight] = React.useState(options.height);

  const prevUnits = usePrevious(units);

  const [widthRestrictions, setWidthRestrictions] = React.useState({
    min: 0,
    max: 0,
  });
  const [heightRestrictions, setHeightRestrictions] = React.useState({
    min: 0,
    max: 0,
  });

  React.useEffect(() => {
    switch (units) {
      case "pixels":
        setWidthRestrictions({
          min: parseInt(window.screen.availWidth * 0.1, 10),
          max: window.screen.availWidth,
        });
        setHeightRestrictions({
          min: parseInt(window.screen.availHeight * 0.1, 10),
          max: window.screen.availHeight,
        });

        if (prevUnits === "percentage") {
          const { width: newWidth, height: newHeight } =
            convertPercentagesToPixels({ width, height });
          setWidth(newWidth);
          setHeight(newHeight);
        }
        break;

      case "percentage":
        setWidthRestrictions({ min: 10, max: 100 });
        setHeightRestrictions({ min: 10, max: 100 });

        if (prevUnits === "pixels") {
          const { width: newWidth, height: newHeight } =
            convertPixelsToPercentages({ width, height });
          setWidth(newWidth);
          setHeight(newHeight);
        }
        break;
    }
  }, [units]);

  const handleDimensionInputChange = (dimension) => (newValue) => {
    const value = newValue !== "" ? parseInt(newValue, 10) : 0;
    switch (dimension) {
      case "width":
        setWidth(value);
        break;

      case "height":
        setHeight(value);
        break;
    }
  };

  const convertPixelsToPercentages = ({ width, height }) => {
    return {
      width: (width / window.screen.availWidth) * 100,
      height: (height / window.screen.availHeight) * 100,
    };
  };

  const convertPercentagesToPixels = ({ width, height }) => {
    return {
      width: GetDimensionForScreenPercentage("Width", width),
      height: GetDimensionForScreenPercentage("Height", height),
    };
  };

  const validateDimensions = () => {
    if (
      width === undefined ||
      width === null ||
      width < widthRestrictions["min"] ||
      width > widthRestrictions["max"]
    ) {
      console.warn("width is invalid", width);
      return false;
    }

    if (
      height === undefined ||
      height === null ||
      height < heightRestrictions["min"] ||
      height > heightRestrictions["max"]
    ) {
      console.warn("height is invalid", height);
      return false;
    }

    return true;
  };

  const dimensionsChanged = () =>
    units !== options["units"] ||
    width !== options["width"] ||
    height !== options["height"];

  return (
    <VStack align="stretch" gap={6} p={6}>
      <Grid templateColumns="repeat(2, 1fr)" gap={2}>
        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel htmlFor="size-units-label">
              {browser.i18n.getMessage("DimensionUnitsLabel")}
            </FormLabel>
            <Select
              id="size-units-select"
              value={units}
              onChange={(event) => setUnits(event.target.value)}
            >
              {OPTIONS_SIZE_UNITS_VALUES.map((unit) => (
                <option value={unit} key={unit}>
                  {browser.i18n.getMessage(`DimensionUnits${unit}OptionLabel`)}
                </option>
              ))}
            </Select>
          </FormControl>
        </GridItem>
        <GridItem>
          <InputGroup>
            <InputLeftAddon>
              {browser.i18n.getMessage("WidthLabel")}
            </InputLeftAddon>
            <NumberInput
              min={widthRestrictions["min"]}
              max={widthRestrictions["max"]}
              value={parseInt(width, 10)}
              onChange={handleDimensionInputChange("width")}
              allowMouseWheel
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon>
              {browser.i18n.getMessage(`DimensionUnits${units}UnitLabel`)}
            </InputRightAddon>
          </InputGroup>
        </GridItem>
        <GridItem>
          <InputGroup>
            <InputLeftAddon>
              {browser.i18n.getMessage("HeightLabel")}
            </InputLeftAddon>
            <NumberInput
              min={heightRestrictions["min"]}
              max={heightRestrictions["max"]}
              value={parseInt(height, 10)}
              onChange={handleDimensionInputChange("height")}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <InputRightAddon>
              {browser.i18n.getMessage(`DimensionUnits${units}UnitLabel`)}
            </InputRightAddon>
          </InputGroup>
        </GridItem>
      </Grid>

      <Box p={2}>
        <CustomDimensionsInfoTable
          units={units}
          width={width}
          height={height}
        />
      </Box>

      <Box px={8}>
        <Button
          width="100%"
          rightIcon={<Icon as={SaveIcon} />}
          isDisabled={!validateDimensions() || !dimensionsChanged()}
          onClick={() =>
            setOptions({
              units,
              width: parseInt(width, 10),
              height: parseInt(height, 10),
            })
          }
        >
          {browser.i18n.getMessage("ButtonSaveCustomDimensionsLabel")}
        </Button>
      </Box>
    </VStack>
  );
}

export default CustomDimensionsForm;
