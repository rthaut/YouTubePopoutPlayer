import React from "react";
import TuneIcon from "@mui/icons-material/Tune";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import {
  OPTIONS_BEHAVIOR_CONTROLS_VALUES,
  OPTIONS_BEHAVIOR_TARGET_VALUES,
} from "@/utils/constants";

import { useDomainOptions } from "../../hooks/use-options";
import BasicToggleControl from "../controls/BasicToggleControl";
import TabPanelHeader from "../TabPanelHeader";

export const DOMAIN = "behavior";

export default function BehaviorTab() {
  const { options, setOption } = useDomainOptions(DOMAIN);

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
                  // TODO: using `any` due to casing of `targetOptionName` not matching the labels
                  `OptionsBehaviorTarget${targetOptionName}Label` as any,
                )}
              />
              <Typography
                color="textSecondary"
                gutterBottom
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage(
                    // TODO: using `any` due to casing of `targetOptionName` not matching the labels
                    `OptionsBehaviorTarget${targetOptionName}Description` as any,
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
          label={browser.i18n.getMessage("BehaviorControlsLabel")}
          labelId="behavior-controls-label"
          id="behavior-controls-select"
          value={options["controls"]}
          onChange={(event) => setOption("controls", event.target.value)}
        >
          {OPTIONS_BEHAVIOR_CONTROLS_VALUES.map((option) => (
            <MenuItem value={option} key={option}>
              {browser.i18n.getMessage(
                // TODO: using `any` due to casing of `option` not matching the labels
                `BehaviorControls${option}OptionLabel` as any,
              )}
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
      <>
        <BasicToggleControl
          domain={DOMAIN}
          optionName="autoplay"
          label={browser.i18n.getMessage("OptionsBehaviorAutoplayLabel")}
          description={browser.i18n.getMessage(
            "OptionsBehaviorAutoplayDescription",
          )}
        />
        <Box mt={1}>
          <Alert severity="warning" icon={false}>
            <Typography
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage("AutoplayVideosBlockedTip"),
              }}
            />
          </Alert>
        </Box>
      </>
    );
  }

  function LoopControl() {
    return (
      <BasicToggleControl
        domain={DOMAIN}
        optionName="loop"
        label={browser.i18n.getMessage("OptionsBehaviorLoopLabel")}
        description={browser.i18n.getMessage("OptionsBehaviorLoopDescription")}
      />
    );
  }

  function ReuseExistingOptionControl() {
    return (
      <BasicToggleControl
        domain={DOMAIN}
        optionName="reuseWindowsTabs"
        label={browser.i18n.getMessage(
          "OptionsBehaviorReuseWindowsTabsLabel",
          browser.i18n.getMessage(
            // TODO: narrow this typing, `options["target"]` should only ever be "tab" or "window"
            `OptionsSubstitutionBehaviorTarget${options["target"]}` as any,
          ),
        )}
        description={browser.i18n.getMessage(
          "OptionsBehaviorReuseWindowsTabsDescription",
          browser.i18n
            .getMessage(
              // TODO: narrow this typing, `options["target"]` should only ever be "tab" or "window"
              `OptionsSubstitutionBehaviorTarget${options["target"]}` as any,
            )
            .toLowerCase(),
        )}
      />
    );
  }

  function RotationControls() {
    return (
      <Box>
        <BasicToggleControl
          domain={DOMAIN}
          optionName="showRotationButtons"
          label={browser.i18n.getMessage(
            "OptionsBehaviorShowRotationButtonsLabel",
          )}
          description={browser.i18n.getMessage(
            "OptionsBehaviorShowRotationButtonsDescription",
          )}
        />
        <BasicToggleControl
          domain={DOMAIN}
          optionName="showRotationMenus"
          label={browser.i18n.getMessage(
            "OptionsBehaviorShowRotationMenusLabel",
          )}
          description={browser.i18n.getMessage(
            "OptionsBehaviorShowRotationMenusDescription",
          )}
        />
      </Box>
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
      <Divider />
      <Box marginY={2}>
        <RotationControls />
      </Box>
    </Box>
  );
}
