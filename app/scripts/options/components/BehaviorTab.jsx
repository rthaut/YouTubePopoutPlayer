import React from "react";

import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
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

import TabPanelHeader from "./TabPanelHeader";

import { useOptionsForDomain } from "../hooks/useOptions";

import {
  OPTIONS_BEHAVIOR_TARGET_VALUES,
  OPTIONS_BEHAVIOR_CONTROLS_VALUES,
} from "../../helpers/constants";

export const DOMAIN = "behavior";

export default function BehaviorTab() {
  const { options, setOption } = useOptionsForDomain(DOMAIN);
  console.log("BehaviorTab ~ options", options);

  function TargetOptionControl() {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          name="target"
          value={options["target"]}
          onChange={(event) => setOption("target", event.target.value)}
        >
          {OPTIONS_BEHAVIOR_TARGET_VALUES.map((targetOptionName) => (
            <React.Fragment key={targetOptionName}>
              <FormControlLabel
                value={targetOptionName}
                control={<Radio color="primary" />}
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

  function ShowControlsOptionControl() {
    return (
      <FormControl fullWidth>
        <InputLabel id="behavior-controls-label">
          {browser.i18n.getMessage("BehaviorControlsLabel")}
        </InputLabel>
        <Select
          labelId="behavior-controls-label"
          id="behavior-controls-select"
          value={options["controls"]}
          onChange={(event) => setOption("controls", event.target.value)}
        >
          {OPTIONS_BEHAVIOR_CONTROLS_VALUES.map((option) => (
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

  function ToggleOptionsControls() {
    const toggleOptions = ["autoplay", "loop"];
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
                    onChange={(event) =>
                      setOption(toggleOptionName, event.target.checked)
                    }
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
      <TabPanelHeader
        icon={<TuneIcon />}
        title={browser.i18n.getMessage("OptionsHeadingBehavior")}
      />
      <Box marginTop={1} marginBottom={2}>
        <TargetOptionControl />
      </Box>
      <Divider />
      <Box marginTop={2}>
        <ShowControlsOptionControl />
      </Box>
      <Divider />
      <ToggleOptionsControls />
    </Box>
  );
}

BehaviorTab.whyDidYouRender = true;
