import React from "react";
import PropTypes from "prop-types";

import { usePrevious } from "react-use";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";

import SaveIcon from "@material-ui/icons/Save";

import { useOptionsForDomain } from "../hooks/useOptions";

import {
  GetDimensionForScreenPercentage,
  GreatestCommonDenominator,
} from "../../helpers/utils";

import { OPTIONS_SIZE_UNITS_VALUES } from "../../helpers/constants";

import { DOMAIN } from "./SizeTab";

function CustomDimensionsInfoTable({ units, width, height }) {
  if (units === "percentage") {
    width = GetDimensionForScreenPercentage("Width", width);
    height = GetDimensionForScreenPercentage("Height", height);
  }

  const ratio = GreatestCommonDenominator(width, height);

  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">
                {browser.i18n.getMessage("InfoCurrentScreenResolutionLabel")}
              </TableCell>
              <TableCell>
                <strong>
                  {window.screen.width} &times; {window.screen.height}
                </strong>
              </TableCell>
            </TableRow>

            {units === "percentage" && (
              <TableRow>
                <TableCell component="th" scope="row">
                  {browser.i18n.getMessage("InfoPopoutPlayerWindowSizeLabel")}
                </TableCell>
                <TableCell>
                  <strong>
                    {width} &times; {height}
                  </strong>
                </TableCell>
              </TableRow>
            )}

            <TableRow>
              <TableCell component="th" scope="row">
                {browser.i18n.getMessage("InfoPopoutPlayerAspectRatioLabel")}
              </TableCell>
              <TableCell>
                <strong>
                  {width / ratio}:{height / ratio}
                </strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

CustomDimensionsInfoTable.propTypes = {
  units: PropTypes.oneOf(OPTIONS_SIZE_UNITS_VALUES).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

function CustomDimensionsForm() {
  const { options, setOptions } = useOptionsForDomain(DOMAIN);
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

  const handleDimensionInputChange = (dimension) => (event) => {
    const value =
      event.target.value !== "" ? parseInt(event.target.value, 10) : 0;
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
      console.warn("height is invalid", width);
      return false;
    }

    return true;
  };

  const dimensionsChanged = () =>
    units !== options["units"] ||
    width !== options["width"] ||
    height !== options["height"];

  return (
    <Box padding={2}>
      <FormControl fullWidth>
        <InputLabel id="size-units-label">
          {browser.i18n.getMessage("DimensionUnitsLabel")}
        </InputLabel>
        <Select
          labelId="size-units-label"
          id="size-units-select"
          value={units}
          onChange={(event) => setUnits(event.target.value)}
        >
          {OPTIONS_SIZE_UNITS_VALUES.map((unit) => (
            <MenuItem value={unit} key={unit}>
              {browser.i18n.getMessage(`DimensionUnits${unit}OptionLabel`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid
        container
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item xs>
          <TextField
            required
            fullWidth
            id="size-width-text-field"
            label="Width"
            type="number"
            margin="normal"
            value={parseInt(width, 10)}
            onChange={handleDimensionInputChange("width")}
            InputLabelProps={{}}
            InputProps={{
              inputProps: {
                ...widthRestrictions,
              },
              endAdornment: (
                <InputAdornment position="end">
                  {browser.i18n.getMessage(`DimensionUnits${units}UnitLabel`)}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs>
          <TextField
            required
            fullWidth
            id="size-height-text-field"
            label="Height"
            type="number"
            margin="normal"
            value={parseInt(height, 10)}
            onChange={handleDimensionInputChange("height")}
            InputLabelProps={{}}
            InputProps={{
              inputProps: {
                ...heightRestrictions,
              },
              endAdornment: (
                <InputAdornment position="end">
                  {browser.i18n.getMessage(`DimensionUnits${units}UnitLabel`)}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box padding={2}>
        <CustomDimensionsInfoTable
          units={units}
          width={width}
          height={height}
        />
      </Box>

      <Box paddingX={8}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          fullWidth
          disabled={!validateDimensions() || !dimensionsChanged()}
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
    </Box>
  );
}

export default function CustomDimensions() {
  return (
    <>
      <CustomDimensionsForm />
    </>
  );
}
