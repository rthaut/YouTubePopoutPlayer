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
  START_THRESHOLD,
} from "@/utils/constants";
import { GetCaseInsensitiveMessage } from "@/utils/i18n";

import { useDomainOptions } from "../../hooks/use-options";
import BasicToggleControl from "../controls/BasicToggleControl";
import TabPanelHeader from "../TabPanelHeader";

export const DOMAIN = "behavior";
type BehaviorTarget = (typeof OPTIONS_BEHAVIOR_TARGET_VALUES)[number];

export default function BehaviorTab() {
  const { options, setOption } = useDomainOptions(DOMAIN);
  const target = options["target"] as BehaviorTarget;

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
                label={GetCaseInsensitiveMessage(
                  `OptionsBehaviorTarget${targetOptionName}Label`,
                )}
              />
              <Typography
                color="textSecondary"
                gutterBottom
                dangerouslySetInnerHTML={{
                  __html: GetCaseInsensitiveMessage(
                    `OptionsBehaviorTarget${targetOptionName}Description`,
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
              {GetCaseInsensitiveMessage(
                `BehaviorControls${option}OptionLabel`,
              )}
            </MenuItem>
          ))}
        </Select>
        <Typography
          color="textSecondary"
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

  function ResumePlaybackControl() {
    return (
      <BasicToggleControl
        domain={DOMAIN}
        optionName="resumePlayback"
        label={browser.i18n.getMessage("OptionsBehaviorResumePlaybackLabel")}
        description={browser.i18n.getMessage(
          "OptionsBehaviorResumePlaybackDescription",
          START_THRESHOLD.toLocaleString(),
        )}
      />
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
          GetCaseInsensitiveMessage(
            `OptionsSubstitutionBehaviorTarget${target}`,
          ),
        )}
        description={browser.i18n.getMessage(
          "OptionsBehaviorReuseWindowsTabsDescription",
          GetCaseInsensitiveMessage(
            `OptionsSubstitutionBehaviorTarget${target}`,
          ).toLowerCase(),
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
        <ResumePlaybackControl />
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
