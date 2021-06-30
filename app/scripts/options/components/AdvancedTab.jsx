import React from "react";

import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import SettingsIcon from "@material-ui/icons/Settings";

import TabPanelHeader from "./TabPanelHeader";

import { useOptionsForDomain } from "../contexts/OptionsContext";

import Utils from "../../helpers/utils";

export const DOMAIN = "advanced";

export default function AdvancedTab() {
  const { options, setOption } = useOptionsForDomain(DOMAIN);

  const [isFirefox, setIsFirefox] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      setIsFirefox(await Utils.IsFirefox());
    })();
  }, []);

  const [title, setTitle] = React.useState(options.title);
  React.useEffect(() => {
    setOption("title", title);
  }, [title]);

  function TitleOption() {
    return (
      <FormGroup>
        <TextField
          label={browser.i18n.getMessage("OptionsAdvancedTitleLabel")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
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
              onChange={(event) => setOption("close", event.target.checked)}
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
      <TabPanelHeader
        icon={<SettingsIcon />}
        title={browser.i18n.getMessage("OptionsHeadingAdvanced")}
      />
      <Box marginTop={1} marginBottom={2}>
        <CloseOption />
      </Box>
      {isFirefox && (
        <>
          <Divider />
          <Box marginTop={1}>
            <TitleOption />
          </Box>
        </>
      )}
    </Box>
  );
}
