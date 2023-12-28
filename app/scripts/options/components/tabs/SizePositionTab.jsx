import React from "react";
import { Alert, Box, VStack } from "@chakra-ui/react";
import {
  MdAspectRatio as AspectRatioIcon,
  MdOpenWith as OpenWithIcon,
} from "react-icons/md";

import {
  OPTIONS_POSITION_MODE_VALUES,
  OPTIONS_SIZE_MODE_VALUES,
} from "../../../helpers/constants";
import useOptionsStore from "../../stores/optionsStore";
import { ModeOptionRadioControl } from "../controls/ModeOptionControls";
import CustomDimensionsForm from "../forms/CustomDimensionsForm";
import CustomPositionForm from "../forms/CustomPositionForm";
import TabPanelHeader from "../TabPanelHeader";

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
    <VStack align="stretch">
      <TabPanelHeader
        icon={AspectRatioIcon}
        title={browser.i18n.getMessage("OptionsHeadingSize")}
      />
      <Box mb={12}>
        {targetIsTab ? (
          <Alert status="warning">
            {browser.i18n.getMessage("OptionsSettingsNotAvailableForTab")}
          </Alert>
        ) : (
          <>
            <SizeModeOptionControl />
            {sizeMode === "custom" && <CustomDimensionsForm />}
          </>
        )}
      </Box>
      <TabPanelHeader
        icon={OpenWithIcon}
        title={browser.i18n.getMessage("OptionsHeadingPosition")}
      />
      <Box>
        {targetIsTab ? (
          <Alert severity="warning">
            {browser.i18n.getMessage("OptionsSettingsNotAvailableForTab")}
          </Alert>
        ) : (
          <>
            <PositionModeOptionControl />
            {positionMode === "custom" && <CustomPositionForm />}
          </>
        )}
      </Box>
    </VStack>
  );
}

SizePositionTab.whyDidYouRender = true;
