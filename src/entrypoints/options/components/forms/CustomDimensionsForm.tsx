import React from "react";
import SaveIcon from "@mui/icons-material/Save";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import { usePrevious } from "react-use";

import { OPTIONS_SIZE_UNITS_VALUES } from "@/utils/constants";
import {
  GetDimensionForScreenPercentage,
  GreatestCommonDenominator,
} from "@/utils/misc";

import { useDomainOptions } from "../../hooks/use-options";

function CustomDimensionsInfoTable({
  units,
  width,
  height,
}: {
  units: "pixels" | "percentage";
  width: number;
  height: number;
}) {
  if (units === "percentage") {
    width = GetDimensionForScreenPercentage("Width", width)!;
    height = GetDimensionForScreenPercentage("Height", height)!;
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
  const { options, setOptions } = useDomainOptions("size");

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
          min: Math.floor(window.screen.availWidth * 0.1),
          max: window.screen.availWidth,
        });
        setHeightRestrictions({
          min: Math.floor(window.screen.availHeight * 0.1),
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

  const handleDimensionInputChange =
    (dimension: "width" | "height") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const convertPixelsToPercentages = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => {
    return {
      width: (width / window.screen.availWidth) * 100,
      height: (height / window.screen.availHeight) * 100,
    };
  };

  const convertPercentagesToPixels = ({
    width,
    height,
  }: {
    width: number;
    height: number;
  }) => {
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
    <Box padding={2}>
      <FormControl fullWidth>
        <InputLabel id="size-units-label">
          {browser.i18n.getMessage("DimensionUnitsLabel")}
        </InputLabel>
        <Select
          label={browser.i18n.getMessage("DimensionUnitsLabel")}
          labelId="size-units-label"
          id="size-units-select"
          value={units}
          onChange={(event) => setUnits(event.target.value)}
        >
          {OPTIONS_SIZE_UNITS_VALUES.map((unit) => (
            <MenuItem value={unit} key={unit}>
              {browser.i18n.getMessage(
                // TODO: using `any` due to casing of `unit` not matching the labels
                `DimensionUnits${unit}OptionLabel` as any,
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid size="grow">
          <TextField
            required
            fullWidth
            id="size-width-text-field"
            label={browser.i18n.getMessage("WidthLabel")}
            type="number"
            margin="normal"
            value={parseInt(width, 10)}
            onChange={handleDimensionInputChange("width")}
            slotProps={{
              input: {
                inputProps: {
                  ...widthRestrictions,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    {browser.i18n.getMessage(
                      // TODO: using `any` due to casing of `unit` not matching the labels
                      `DimensionUnits${units}UnitLabel` as any,
                    )}
                  </InputAdornment>
                ),
              },
              inputLabel: {},
            }}
          />
        </Grid>
        <Grid size="grow">
          <TextField
            required
            fullWidth
            id="size-height-text-field"
            label={browser.i18n.getMessage("HeightLabel")}
            type="number"
            margin="normal"
            value={parseInt(height, 10)}
            onChange={handleDimensionInputChange("height")}
            slotProps={{
              input: {
                inputProps: {
                  ...heightRestrictions,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    {browser.i18n.getMessage(
                      // TODO: using `any` due to casing of `unit` not matching the labels
                      `DimensionUnits${units}UnitLabel` as any,
                    )}
                  </InputAdornment>
                ),
              },
              inputLabel: {},
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

export default CustomDimensionsForm;
