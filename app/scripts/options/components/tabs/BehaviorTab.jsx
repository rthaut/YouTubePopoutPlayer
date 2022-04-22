import React from "react";
import PropTypes from "prop-types";

import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import TuneIcon from "@material-ui/icons/Tune";

import TabPanelHeader from "../TabPanelHeader";

import { useOptionsForDomain } from "../../hooks/useOptions";

import {
  OPTIONS_BEHAVIOR_TARGET_VALUES,
  OPTIONS_BEHAVIOR_CONTROLS_VALUES,
} from "../../../helpers/constants";

export const DOMAIN = "behavior";

export default function BehaviorTab() {
  const { options, setOption } = useOptionsForDomain(DOMAIN);
  console.log("BehaviorTab ~ options", options);

  // TODO: make this into a reusable component for other tabs
  function BasicToggleControl({ optionName, label, description }) {
    return (
      <FormControl>
        <FormControlLabel
          label={label}
          control={
            <Switch
              name={`${optionName}ToggleSwitch`}
              color="primary"
              checked={options[optionName]}
              onChange={(event) => setOption(optionName, event.target.checked)}
            />
          }
        />
        <Typography
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </FormControl>
    );
  }

  BasicToggleControl.propTypes = {
    optionName: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    description: PropTypes.string.isRequired,
  };

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

  function AutoplayControl() {
    return (
      <BasicToggleControl
        optionName="autoplay"
        label={browser.i18n.getMessage("OptionsBehaviorAutoplayLabel")}
        description={browser.i18n.getMessage(
          "OptionsBehaviorAutoplayDescription"
        )}
      />
    );
  }

  function LoopControl() {
    return (
      <BasicToggleControl
        optionName="loop"
        label={browser.i18n.getMessage("OptionsBehaviorLoopLabel")}
        description={browser.i18n.getMessage("OptionsBehaviorLoopDescription")}
      />
    );
  }

  function ReuseExistingOptionControl() {
    return (
      <BasicToggleControl
        optionName="reuseWindowsTabs"
        label={browser.i18n.getMessage(
          "OptionsBehaviorReuseWindowsTabsLabel",
          browser.i18n.getMessage(
            `OptionsSubstitutionBehaviorTarget${options["target"]}`
          )
        )}
        description={browser.i18n.getMessage(
          "OptionsBehaviorReuseWindowsTabsDescription",
          browser.i18n
            .getMessage(`OptionsSubstitutionBehaviorTarget${options["target"]}`)
            .toLowerCase()
        )}
      />
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
      <Box marginY={2}>
        <ReuseExistingOptionControl />
      </Box>
      <Divider />
      <Box marginY={2}>
        <ShowControlsOptionControl />
      </Box>
      <Divider />
      <Box marginY={2}>
        <AutoplayControl />
      </Box>
      <Divider />
      <Box marginY={2}>
        <LoopControl />
      </Box>
    </Box>
  );
}

BehaviorTab.whyDidYouRender = true;
