import React from "react";
import PropTypes from "prop-types";

import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Grid from "@material-ui/core/Grid";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import SettingsIcon from "@material-ui/icons/Settings";

export const DOMAIN = "advanced";

export default function AdvancedTab({ options, setOption }) {
  function TitleOption() {
    return (
      <FormGroup>
        <TextField
          label={browser.i18n.getMessage("OptionsAdvancedTitleLabel")}
          value={options["title"]}
          // onChange={setOption("title", "string")} // TODO: this causes the field to lose focus on each keypress...
        />
        <Typography
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("OptionsAdvancedTitleDescription"),
          }}
        />
      </FormGroup>
    );
  }

  function CloseOption() {
    return (
      <FormGroup>
        <FormControlLabel
          label={browser.i18n.getMessage("OptionsAdvancedCloseLabel")}
          control={
            <Switch
              name="close-switch"
              color="primary"
              checked={options["close"]}
              onChange={setOption("close", "boolean")}
            />
          }
        />
        <Typography
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("OptionsAdvancedCloseDescription"),
          }}
        />
      </FormGroup>
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
          <SettingsIcon />
        </Grid>
        <Grid item xs zeroMinWidth>
          <Typography variant="h5" component="h2" gutterBottom>
            {browser.i18n.getMessage("OptionsHeadingAdvanced")}
          </Typography>
        </Grid>
      </Grid>
      <Box marginTop={1} marginBottom={2}>
        <CloseOption />
      </Box>
      <Divider />
      {/* TODO: this should be for Firefox only (unless Chrome has implemented it now...) */}
      <Box marginTop={2}>
        <TitleOption />
      </Box>
      <Divider />
    </Box>
  );
}

AdvancedTab.propTypes = {
  options: PropTypes.exact({
    close: PropTypes.bool.isRequired,
    title: PropTypes.string,
  }).isRequired,
  setOption: PropTypes.func.isRequired,
};
