import React from "react";

import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";

import AspectRatioIcon from "@material-ui/icons/AspectRatio";
import OpenWithIcon from "@material-ui/icons/OpenWith";

import { ModeOptionRadioControl } from "./ModeOptionControls";
import CustomDimensions from "./CustomDimensions";
import CustomPosition from "./CustomPosition";
import TabPanelHeader from "./TabPanelHeader";

import { useOptions } from "../hooks/useOptions";

import {
  OPTIONS_SIZE_MODE_VALUES,
  OPTIONS_POSITION_MODE_VALUES,
} from "../../helpers/constants";

export const DOMAIN = "size-position";

export default function SizePositionTab() {
  const { getOptionForDomain } = useOptions();

  const targetIsTab = getOptionForDomain("behavior", "target") === "tab";

  function SizeModeOptionControl() {
    return (
      <ModeOptionRadioControl
        domain="size"
        optionName="mode"
        values={OPTIONS_SIZE_MODE_VALUES}
      />
    );
  }

  function PositionModeOptionControl() {
    return (
      <ModeOptionRadioControl
        domain="position"
        optionName="mode"
        values={OPTIONS_POSITION_MODE_VALUES}
      />
    );
  }

  return (
    <>
      <Box>
        <TabPanelHeader
          icon={<AspectRatioIcon />}
          title={browser.i18n.getMessage("OptionsHeadingSize")}
        />
        {targetIsTab ? (
          <Box marginY={1}>
            <Alert severity="warning">
              {browser.i18n.getMessage("OptionsSettingsNotAvailableForTab")}
            </Alert>
          </Box>
        ) : (
          <>
            <Box marginY={1}>
              <SizeModeOptionControl />
            </Box>
            {getOptionForDomain("size", "mode") === "custom" && (
              <CustomDimensions />
            )}
          </>
        )}
      </Box>
      <Divider />
      <Box marginTop={2}>
        <TabPanelHeader
          icon={<OpenWithIcon />}
          title={browser.i18n.getMessage("OptionsHeadingPosition")}
        />
        {targetIsTab ? (
          <Box marginY={1}>
            <Alert severity="warning">
              {browser.i18n.getMessage("OptionsSettingsNotAvailableForTab")}
            </Alert>
          </Box>
        ) : (
          <>
            <Box marginY={1}>
              <PositionModeOptionControl />
            </Box>
            {getOptionForDomain("position", "mode") === "custom" && (
              <CustomPosition />
            )}
          </>
        )}
      </Box>
    </>
  );
}

SizePositionTab.whyDidYouRender = true;
