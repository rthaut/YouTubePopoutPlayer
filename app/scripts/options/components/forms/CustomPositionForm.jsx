import React from "react";

import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import InputAdornment from "@material-ui/core/InputAdornment";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import SaveIcon from "@material-ui/icons/Save";
import WarningIcon from "@material-ui/icons/Warning";

import { useOptionsForDomain } from "../../stores/optionsStore";

function CustomPositionForm() {
  const [options, { setOptions }] = useOptionsForDomain("position");
  console.log("CustomPositionForm ~ options", options);

  const [top, setTop] = React.useState(options.top);
  const [left, setLeft] = React.useState(options.left);

  const handlePositionInputChange = (dimension) => (event) => {
    const value =
      event.target.value !== "" ? parseInt(event.target.value, 10) : 0;
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
    <Box padding={2}>
      <Alert
        severity="info"
        icon={<WarningIcon color="secondary" fontSize="inherit" />}
      >
        <Typography
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("OptionsCustomPositionWarning"),
          }}
        />
      </Alert>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid item xs>
          <TextField
            required
            fullWidth
            id="position-top-text-field"
            label="Top"
            type="number"
            margin="normal"
            value={parseInt(top, 10)}
            onChange={handlePositionInputChange("top")}
            InputLabelProps={{}}
            InputProps={{
              inputProps: {},
              endAdornment: (
                <InputAdornment position="end">
                  {browser.i18n.getMessage("DimensionUnitsPixelsUnitLabel")}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs>
          <TextField
            required
            fullWidth
            id="size-left-text-field"
            label="Left"
            type="number"
            margin="normal"
            value={parseInt(left, 10)}
            onChange={handlePositionInputChange("left")}
            InputLabelProps={{}}
            InputProps={{
              inputProps: {},
              endAdornment: (
                <InputAdornment position="end">
                  {browser.i18n.getMessage("DimensionUnitsPixelsUnitLabel")}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box paddingX={8}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<SaveIcon />}
          fullWidth
          disabled={!validatePositions() || !positionChanged()}
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
    </Box>
  );
}

export default CustomPositionForm;
