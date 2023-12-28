import React from "react";
import {
  Alert,
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Select,
  StackDivider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { MdTune as TuneIcon } from "react-icons/md";

import {
  OPTIONS_BEHAVIOR_CONTROLS_VALUES,
  OPTIONS_BEHAVIOR_TARGET_VALUES,
} from "../../../helpers/constants";
import { useOptionsForDomain } from "../../stores/optionsStore";
import BasicToggleControl from "../controls/BasicToggleControl";
import TabPanelHeader from "../TabPanelHeader";

export const DOMAIN = "behavior";

export default function BehaviorTab() {
  const [options, { setOption }] = useOptionsForDomain(DOMAIN);
  console.log("BehaviorTab ~ options", options);

  function TargetOptionControl() {
    return (
      <FormControl>
        <RadioGroup
          name="target"
          value={options["target"]}
          onChange={(newValue) => setOption("target", newValue)}
        >
          <VStack spacing={6} align="stretch">
            {OPTIONS_BEHAVIOR_TARGET_VALUES.map((targetOptionName) => (
              <Box key={targetOptionName}>
                <Radio value={targetOptionName}>
                  {browser.i18n.getMessage(
                    `OptionsBehaviorTarget${targetOptionName}Label`,
                  )}
                </Radio>
                <Text
                  fontSize="md"
                  dangerouslySetInnerHTML={{
                    __html: browser.i18n.getMessage(
                      `OptionsBehaviorTarget${targetOptionName}Description`,
                    ),
                  }}
                />
              </Box>
            ))}
          </VStack>
        </RadioGroup>
      </FormControl>
    );
  }

  function ShowControlsOptionControl() {
    return (
      <FormControl>
        <FormLabel htmlFor="behavior-controls-label">
          {browser.i18n.getMessage("BehaviorControlsLabel")}
        </FormLabel>
        <Select
          id="behavior-controls-select"
          value={options["controls"]}
          onChange={(event) => setOption("controls", event.target.value)}
        >
          {OPTIONS_BEHAVIOR_CONTROLS_VALUES.map((option) => (
            <option value={option} key={option}>
              {browser.i18n.getMessage(`BehaviorControls${option}OptionLabel`)}
            </option>
          ))}
        </Select>
        <FormHelperText
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("BehaviorControlsDescription"),
          }}
        />
      </FormControl>
    );
  }

  function AutoplayControl() {
    return (
      <Box>
        <BasicToggleControl
          domain={DOMAIN}
          optionName="autoplay"
          label={browser.i18n.getMessage("OptionsBehaviorAutoplayLabel")}
          description={browser.i18n.getMessage(
            "OptionsBehaviorAutoplayDescription",
          )}
        />
        <Alert status="warning" mt={2}>
          <Text
            dangerouslySetInnerHTML={{
              __html: browser.i18n.getMessage("AutoplayVideosBlockedTip"),
            }}
          />
        </Alert>
      </Box>
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
            `OptionsSubstitutionBehaviorTarget${options["target"]}`,
          ),
        )}
        description={browser.i18n.getMessage(
          "OptionsBehaviorReuseWindowsTabsDescription",
          browser.i18n
            .getMessage(`OptionsSubstitutionBehaviorTarget${options["target"]}`)
            .toLowerCase(),
        )}
      />
    );
  }

  function RotationControls() {
    return (
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={6}
        align="stretch"
      >
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
      </VStack>
    );
  }

  return (
    <VStack align="stretch">
      <TabPanelHeader
        icon={TuneIcon}
        title={browser.i18n.getMessage("OptionsHeadingBehavior")}
      />
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={6}
        align="stretch"
      >
        <Box>
          <TargetOptionControl />
        </Box>
        <Box>
          <ReuseExistingOptionControl />
        </Box>
        <Box>
          <ShowControlsOptionControl />
        </Box>
        <Box>
          <AutoplayControl />
        </Box>
        <Box>
          <LoopControl />
        </Box>
        <Box>
          <RotationControls />
        </Box>
      </VStack>
    </VStack>
  );
}

BehaviorTab.whyDidYouRender = true;
