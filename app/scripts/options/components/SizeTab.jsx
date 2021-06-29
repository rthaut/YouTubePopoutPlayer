import React from "react";
import PropTypes from "prop-types";

import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";

import AspectRatioIcon from "@material-ui/icons/AspectRatio";

import CustomDimensions from "./CustomDimensions";

export const DOMAIN = "size";

// TODO: move these to constants.js
const modeOptions = ["current", "custom"];
const dimensionUnitsOptions = ["pixels", "percentage"];

export default function SizeTab({ options, setOption, setOptions, getOptionForDomain }) {
  const targetIsTab = getOptionForDomain("behavior", "target") === "tab";

  function ModeOption() {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          name="mode"
          value={options["mode"]}
          onChange={setOption("mode", "string")}
        >
          {modeOptions.map((modeOptionName) => (
            <React.Fragment key={modeOptionName}>
              <FormControlLabel
                value={modeOptionName}
                control={<Radio />}
                label={browser.i18n.getMessage(
                  `OptionsSizeMode${modeOptionName}Label`
                )}
              />
              <Typography
                color="textSecondary"
                gutterBottom
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage(
                    `OptionsSizeMode${modeOptionName}Description`
                  ),
                }}
              />
            </React.Fragment>
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  return (
    <Box>
      <Grid
        container
        wrap="nowrap"
        spacing={1}
        direction="row"
        justify="flex-start"
        alignItems="center"
      >
        <Grid item>
          <AspectRatioIcon />
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography variant="h5" component="h2" gutterBottom>
            {browser.i18n.getMessage("OptionsHeadingSize")}
          </Typography>
        </Grid>
      </Grid>
      {targetIsTab ? (
        <Box marginY={1}>
          <Alert severity="warning">
            {browser.i18n.getMessage("OptionsSettingsNotAvailableForTab")}
          </Alert>
        </Box>
      ) : (
        <>
          <Box marginY={1}>
            <ModeOption />
          </Box>
          {options["mode"] === "custom" && <CustomDimensions options={options} setOptions={setOptions} />}
          <pre>
            <code>{JSON.stringify(options, null, 2)}</code>
          </pre>
        </>
      )}
    </Box>
  );
}

SizeTab.propTypes = {
  options: PropTypes.exact({
    mode: PropTypes.oneOf(modeOptions).isRequired,
    units: PropTypes.oneOf(dimensionUnitsOptions).isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }).isRequired,
  setOption: PropTypes.func.isRequired,
  setOptions: PropTypes.func.isRequired,
  getOptionForDomain: PropTypes.func.isRequired,
};
