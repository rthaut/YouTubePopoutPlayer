import React from "react";
import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import OpenWithIcon from "@mui/icons-material/OpenWith";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

import {
  OPTIONS_POSITION_MODE_VALUES,
  OPTIONS_SIZE_MODE_VALUES,
} from "@/utils/constants";

import { useOption } from "../../hooks/use-options";
import { ModeOptionRadioControl } from "../controls/ModeOptionControls";
import CustomDimensionsForm from "../forms/CustomDimensionsForm";
import CustomPositionForm from "../forms/CustomPositionForm";
import TabPanelHeader from "../TabPanelHeader";

export const DOMAIN = "size_position";

export default function SizePositionTab() {
  const [sizeMode] = useOption("size", "mode");
  const [positionMode] = useOption("position", "mode");
  const [target] = useOption("behavior", "target");
  const targetIsTab = target === "tab";

  function SizeModeOptionControl() {
    return (
      <ModeOptionRadioControl
        domain="size"
        optionName="mode"
        values={Array.from(OPTIONS_SIZE_MODE_VALUES)}
      />
    );
  }

  function PositionModeOptionControl() {
    return (
      <ModeOptionRadioControl
        domain="position"
        optionName="mode"
        values={Array.from(OPTIONS_POSITION_MODE_VALUES)}
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
            {sizeMode === "custom" && <CustomDimensionsForm />}
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
            {positionMode === "custom" && <CustomPositionForm />}
          </>
        )}
      </Box>
    </>
  );
}
