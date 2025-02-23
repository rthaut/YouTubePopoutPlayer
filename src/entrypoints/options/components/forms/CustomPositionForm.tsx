import React from "react";
import SaveIcon from "@mui/icons-material/Save";
import WarningIcon from "@mui/icons-material/Warning";
import Alert from "@mui/lab/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useDomainOptions } from "../../hooks/use-options";

function CustomPositionForm() {
  const { options, setOptions } = useDomainOptions("position");

  const [top, setTop] = React.useState(options.top);
  const [left, setLeft] = React.useState(options.left);

  const handlePositionInputChange =
    (dimension: "top" | "left") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
            label={browser.i18n.getMessage("TopLabel")}
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
            label={browser.i18n.getMessage("LeftLabel")}
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
