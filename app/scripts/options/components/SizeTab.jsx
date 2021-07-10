import React from "react";

import Alert from "@material-ui/lab/Alert";
import Box from "@material-ui/core/Box";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";

import AspectRatioIcon from "@material-ui/icons/AspectRatio";

import CustomDimensions from "./CustomDimensions";
import TabPanelHeader from "./TabPanelHeader";

import { useOptions, useOptionsForDomain } from "../hooks/useOptions";

import { OPTIONS_SIZE_MODE_VALUES } from "../../helpers/constants";

export const DOMAIN = "size";

export default function SizeTab() {
  const { getOptionForDomain } = useOptions();
  const { options, setOption } = useOptionsForDomain(DOMAIN);
  console.log("SizeTab ~ options", options)

  const targetIsTab = getOptionForDomain("behavior", "target") === "tab";

  function ModeOptionControl() {
    return (
      <FormControl component="fieldset">
        <RadioGroup
          name="mode"
          value={options["mode"]}
          onChange={(event) => setOption("mode", event.target.value)}
        >
          {OPTIONS_SIZE_MODE_VALUES.map((modeOptionName) => (
            <React.Fragment key={modeOptionName}>
              <FormControlLabel
                value={modeOptionName}
                control={<Radio color="primary" />}
                label={browser.i18n.getMessage(
                  `OptionsSizeMode${modeOptionName}Label`
                )}
              />
              <Typography
                color="textSecondary"
                gutterBottom
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage(
                    `OptionsSizeMode${modeOptionName}Description`
                  ),
                }}
              />
            </React.Fragment>
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  return (
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
            <ModeOptionControl />
          </Box>
          {options["mode"] === "custom" && (
            <CustomDimensions />
          )}
        </>
      )}
    </Box>
  );
}

SizeTab.whyDidYouRender = true;
