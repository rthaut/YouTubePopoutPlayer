import React from "react";
import PropTypes from "prop-types";

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
import Utils from "../../helpers/utils";

// TODO: move these to constants.js
const dimensionUnitsOptions = ["pixels", "percentage"];

export function CustomDimensionsForm({ options, save }) {
  const [units, setUnits] = React.useState(options.units);
  const [dimensions, setDimensions] = React.useState({
    width: options.width,
    height: options.height,
  });

  const setDimension = (dimension) => (event) =>
    setDimensions((dimensions) => ({
      ...dimensions,
      [dimension]:
        event.target.value !== "" ? parseInt(event.target.value, 10) : 0,
    }));

  // TODO: build and use this when switching from pixels to percentages (so we can be smart about changing the values)
  const convertPixelsToPercentages = ([width, height]) => {};

  // TODO: build and use this when switching from percentages to pixels (so we can be smart about changing the values)
  const convertPercentagesToPixels = ([width, height]) => {};

  const getSizeData = () => {
    let { width, height } = dimensions;
    let ratio;

    if (parseInt(width, 10) > 0 && parseInt(height, 10) > 0) {
      if (units === "percentage") {
        width = Utils.GetDimensionForScreenPercentage("Width", width);
        height = Utils.GetDimensionForScreenPercentage("Height", height);
      }
    }

    if (parseInt(width, 10) > 0 && parseInt(height, 10) > 0) {
      ratio = Utils.GreatestCommonDenominator(width, height);
    }

    return {
      width,
      height,
      ratio,
    };
  };

  const showSizeData = (property) => {
    let result = "N/A";

    const { width, height, ratio } = getSizeData();

    if (width && height && ratio) {
      switch (property) {
        case "AspectRatio":
          result = width / ratio + ":" + height / ratio;
          break;

        case "Dimensions":
          result = width + " &times; " + height;
          break;
      }
    }

    return result;
  };

  /**
   * Determines the minimum size for the width and/or height input fields based on the selected units
   * @param {string} dimension either "width" or "height"
   * @returns {number}
   */
  const sizeMin = (dimension) => {
    switch (units) {
      case "pixels":
        switch (dimension) {
          case "width":
            return parseInt(window.screen.availWidth * 0.1, 10);
          case "height":
            return parseInt(window.screen.availHeight * 0.1, 10);
        }
        break;

      case "percentage":
        return 10;
    }

    return 0;
  };

  /**
   * Determines the maximum size for the width and/or height input fields based on the selected units
   * @param {string} dimension either "width" or "height"
   * @returns {number}
   */
  const sizeMax = (dimension) => {
    switch (units) {
      case "pixels":
        switch (dimension) {
          case "width":
            return window.screen.availWidth;
          case "height":
            return window.screen.availHeight;
        }
        break;

      case "percentage":
        return 100;
    }

    return 0;
  };

  // TODO: this is very basic; it needs to ensure percentages are valid and pixels are not larger than the screen
  const areDimensionsOptionsValid = () =>
    Object.keys(dimensions).reduce(
      (acc, val) =>
        acc &&
        dimensions[val] !== undefined &&
        dimensions[val] !== null &&
        dimensions[val] !== "" &&
        dimensions[val] !== 0,
      true
    );

  const haveDimensionsOptionsChanged = () =>
    units !== options["units"] ||
    dimensions["width"] !== options["width"] ||
    dimensions["height"] !== options["height"];

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
          {dimensionUnitsOptions.map((unit) => (
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
            value={dimensions["width"]}
            onChange={setDimension("width")}
            InputLabelProps={{}}
            InputProps={{
              inputProps: {
                min: sizeMin("width"),
                max: sizeMax("width"),
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
            value={dimensions["height"]}
            onChange={setDimension("height")}
            InputLabelProps={{}}
            InputProps={{
              inputProps: {
                min: sizeMin("height"),
                max: sizeMax("height"),
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
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {browser.i18n.getMessage(
                      "InfoCurrentScreenResolutionLabel"
                    )}
                  </TableCell>
                  <TableCell>
                    <strong>
                      {window.screen.width} &times; {window.screen.height}
                    </strong>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {browser.i18n.getMessage("InfoPopoutPlayerWindowSizeLabel")}
                  </TableCell>
                  <TableCell>
                    <strong
                      dangerouslySetInnerHTML={{
                        __html: showSizeData("Dimensions"),
                      }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">
                    {browser.i18n.getMessage(
                      "InfoPopoutPlayerAspectRatioLabel"
                    )}
                  </TableCell>
                  <TableCell>
                    <strong
                      dangerouslySetInnerHTML={{
                        __html: showSizeData("AspectRatio"),
                      }}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <pre>
        <code>{JSON.stringify(dimensions, null, 2)}</code>
      </pre>
      <Box paddingX={8}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          fullWidth
          disabled={
            !areDimensionsOptionsValid() || !haveDimensionsOptionsChanged()
          }
        >
          {browser.i18n.getMessage("ButtonSaveCustomDimensionsLabel")}
        </Button>
      </Box>
    </Box>
  );
}

CustomDimensionsForm.propTypes = {
  options: PropTypes.shape({
    units: PropTypes.oneOf(dimensionUnitsOptions).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  save: PropTypes.func.isRequired,
};

export default function CustomDimensions({ options, setOptions }) {
  const save = (options) => setOptions(options);

  return (
    <>
      <CustomDimensionsForm options={options} save={save} />
    </>
  );
}

CustomDimensions.propTypes = {
  options: PropTypes.shape({
    units: PropTypes.oneOf(dimensionUnitsOptions).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  setOptions: PropTypes.func.isRequired,
};
