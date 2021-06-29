import React from "react";
import PropTypes from "prop-types";

import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import TuneIcon from "@material-ui/icons/Tune";

export const DOMAIN = "behavior";

// TODO: move these to constants.js
const targetOptions = ["window", "tab"];
const controlsOptions = ["none", "standard", "extended"];
const toggleOptions = ["autoplay", "loop"];

export default function BehaviorTab({ options, setOption }) {
  function TargetOption() {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          name="target"
          value={options["target"]}
          onChange={setOption("target", "string")}
        >
          {targetOptions.map((targetOptionName) => (
            <React.Fragment key={targetOptionName}>
              <FormControlLabel
                value={targetOptionName}
                control={<Radio />}
                label={browser.i18n.getMessage(
                  `OptionsBehaviorTarget${targetOptionName}Label`
                )}
              />
              <Typography
                color="textSecondary"
                gutterBottom
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage(
                    `OptionsBehaviorTarget${targetOptionName}Description`
                  ),
                }}
              />
            </React.Fragment>
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  function ShowControlsOption() {
    return (
      <FormControl fullWidth>
        <InputLabel id="behavior-controls-label">
          {browser.i18n.getMessage("BehaviorControlsLabel")}
        </InputLabel>
        <Select
          labelId="behavior-controls-label"
          id="behavior-controls-select"
          value={options["controls"]}
          onChange={setOption("controls", "string")}
        >
          {controlsOptions.map((option) => (
            <MenuItem value={option} key={option}>
              {browser.i18n.getMessage(`BehaviorControls${option}OptionLabel`)}
            </MenuItem>
          ))}
        </Select>
        <Typography
          color="textSecondary"
          paragraph
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("BehaviorControlsDescription"),
          }}
        />
      </FormControl>
    );
  }

  function ToggleOptions() {
    return (
      <List>
        {toggleOptions.map((toggleOptionName) => (
          <ListItem key={toggleOptionName} disableGutters>
            <FormGroup>
              <FormControlLabel
                key={toggleOptionName}
                label={browser.i18n.getMessage(
                  `OptionsBehavior${toggleOptionName}Label`
                )}
                control={
                  <Switch
                    name={toggleOptionName}
                    color="primary"
                    checked={options[toggleOptionName]}
                    onChange={setOption(toggleOptionName, "boolean")}
                  />
                }
              />
              <Typography
                color="textSecondary"
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage(
                    `OptionsBehavior${toggleOptionName}Description`
                  ),
                }}
              />
            </FormGroup>
          </ListItem>
        ))}
      </List>
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
          <TuneIcon />
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography variant="h5" component="h2" gutterBottom>
            {browser.i18n.getMessage("OptionsHeadingBehavior")}
          </Typography>
        </Grid>
      </Grid>
      <Box marginTop={1} marginBottom={2}>
        <TargetOption />
      </Box>
      <Divider />
      <Box marginTop={2}>
        <ShowControlsOption />
      </Box>
      <Divider />
      <ToggleOptions />
    </Box>
  );
}

BehaviorTab.propTypes = {
  options: PropTypes.exact({
    target: PropTypes.oneOf(targetOptions).isRequired,
    controls: PropTypes.oneOf(controlsOptions).isRequired,
    autoplay: PropTypes.bool.isRequired,
    loop: PropTypes.bool.isRequired,
  }).isRequired,
  setOption: PropTypes.func.isRequired,
};
