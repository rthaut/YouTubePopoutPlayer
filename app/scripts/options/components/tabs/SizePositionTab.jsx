import React from "react";

import Alert from "@mui/lab/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

import AspectRatioIcon from "@mui/icons-material/AspectRatio";
import OpenWithIcon from "@mui/icons-material/OpenWith";

import { ModeOptionRadioControl } from "../controls/ModeOptionControls";
import CustomDimensionsForm from "../forms/CustomDimensionsForm";
import CustomPositionForm from "../forms/CustomPositionForm";
import TabPanelHeader from "../TabPanelHeader";

import useOptionsStore from "../../stores/optionsStore";

import {
  OPTIONS_SIZE_MODE_VALUES,
  OPTIONS_POSITION_MODE_VALUES,
} from "../../../helpers/constants";

export const DOMAIN = "size_position";

export default function SizePositionTab() {
  const sizeMode = useOptionsStore((store) => store["size.mode"]);
  const positionMode = useOptionsStore((store) => store["position.mode"]);
  const targetIsTab =
    useOptionsStore((store) => store["behavior.target"]) === "tab";

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
