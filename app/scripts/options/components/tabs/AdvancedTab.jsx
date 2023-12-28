import React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  StackDivider,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  MdCheckCircleOutline as CheckIcon,
  MdSettings as SettingsIcon,
} from "react-icons/md";
import { useDebounce } from "react-use";

import { IsFirefox } from "../../../helpers/utils";
import useOptionsStore, {
  useOptionsForDomain,
} from "../../stores/optionsStore";
import BasicToggleControl from "../controls/BasicToggleControl";
import PermissionToggleControl from "../controls/PermissionToggleControl";
import TabPanelHeader from "../TabPanelHeader";

export const DOMAIN = "advanced";

export default function AdvancedTab() {
  const [options, { setOption }] = useOptionsForDomain(DOMAIN);
  console.log("AdvancedTab ~ options", options);

  const canOpenInBackground =
    useOptionsStore((store) => store["size.mode"]) !== "maximized";

  const popoutPlayerTarget = useOptionsStore(
    (store) => store["behavior.target"],
  );

  const [isFirefox, setIsFirefox] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      setIsFirefox(await IsFirefox());
    })();
  }, []);

  React.useEffect(() => {
    if (!canOpenInBackground) {
      setOption("background", false);
    }
  }, [canOpenInBackground]);

  const disabledTipBgColor = useColorModeValue("orange.100", "whiteAlpha.100");
  const disabledTipBorderColor = useColorModeValue(
    "orange.200",
    "whiteAlpha.300",
  );

  function AutoOpenControl() {
    return (
      <BasicToggleControl
        domain={DOMAIN}
        optionName="autoOpen"
        label={browser.i18n.getMessage("OptionsAdvancedAutoOpenLabel")}
        description={browser.i18n.getMessage(
          "OptionsAdvancedAutoOpenDescription",
        )}
      />
    );
  }

  function BackgroundTabControl() {
    return (
      <>
        <BasicToggleControl
          domain={DOMAIN}
          optionName="background"
          label={browser.i18n.getMessage(
            "OptionsAdvancedOpenInBackgroundLabel",
            browser.i18n.getMessage(
              `OptionsSubstitutionBehaviorTarget${popoutPlayerTarget}`,
            ),
          )}
          description={browser.i18n.getMessage(
            "OptionsAdvancedOpenInBackgroundDescription",
            browser.i18n
              .getMessage(
                `OptionsSubstitutionBehaviorTarget${popoutPlayerTarget}`,
              )
              .toLowerCase(),
          )}
          isDisabled={!canOpenInBackground}
        />
        {!canOpenInBackground && (
          <Box
            bg={disabledTipBgColor}
            p={2}
            mt={2}
            borderWidth={1}
            borderColor={disabledTipBorderColor}
          >
            <Text
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  "OptionsSettingDisabled",
                  browser.i18n.getMessage("OptionsSizeModeMaximizedLabel"),
                ),
              }}
            />
          </Box>
        )}
      </>
    );
  }

  function CloseOptionControl() {
    return (
      <PermissionToggleControl
        domain={DOMAIN}
        optionName="close"
        label={browser.i18n.getMessage("OptionsAdvancedCloseLabel")}
        description={browser.i18n.getMessage("OptionsAdvancedCloseDescription")}
        permissionsRequest={{
          permissions: ["tabs"],
        }}
      />
    );
  }

  function ContextualIdentitySupportControl() {
    return (
      <PermissionToggleControl
        domain={DOMAIN}
        optionName="contextualIdentity"
        label={browser.i18n.getMessage(
          "OptionsAdvancedContextualIdentityLabel",
        )}
        description={browser.i18n.getMessage(
          "OptionsAdvancedContextualIdentityDescription",
        )}
        permissionsRequest={{
          permissions: ["cookies"],
        }}
      />
    );
  }

  function TitleOptionControl() {
    const [title, setTitle] = React.useState(options["title"]);

    const toast = useToast();

    const saveTitle = () => {
      if (title !== options["title"]) {
        setOption("title", title);
        toast({
          description: browser.i18n.getMessage(
            "OptionsSettingSavedSuccess",
            browser.i18n.getMessage("OptionsAdvancedTitleLabel"),
          ),
          status: "success",
          duration: 3_000,
          isClosable: true,
          position: "top",
        });
      }
    };

    useDebounce(saveTitle, 2000, [title, options]);

    const canSetTitle = popoutPlayerTarget === "window";

    return (
      <>
        <FormControl isDisabled={!canSetTitle}>
          <FormLabel htmlFor="title-input" variant="standard">
            {browser.i18n.getMessage("OptionsAdvancedTitleLabel")}
          </FormLabel>
          <InputGroup>
            <Input
              id="title-input"
              type="text"
              value={canSetTitle ? title : ""}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.code === "Enter") {
                  saveTitle();
                }
              }}
            />
            <InputRightElement>
              <IconButton
                isDisabled={!canSetTitle || title === options["title"]}
                onClick={saveTitle}
                icon={<Icon as={CheckIcon} />}
              />
            </InputRightElement>
          </InputGroup>
          <FormHelperText
            opacity={canSetTitle ? undefined : "0.4"}
            dangerouslySetInnerHTML={{
              __html: browser.i18n.getMessage(
                "OptionsAdvancedTitleDescription",
              ),
            }}
          />
        </FormControl>
        {!canSetTitle && (
          <Box
            bg={disabledTipBgColor}
            p={2}
            mt={2}
            borderWidth={1}
            borderColor={disabledTipBorderColor}
          >
            <Text
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  "OptionsSettingDisabled",
                  browser.i18n.getMessage("OptionsBehaviorTargetTabLabel"),
                ),
              }}
            />
          </Box>
        )}
      </>
    );
  }

  function YouTubeNoCookieDomainControl() {
    return (
      <BasicToggleControl
        domain={DOMAIN}
        optionName="noCookieDomain"
        label={browser.i18n.getMessage(
          "OptionsAdvancedYouTubeNoCookieDomainLabel",
        )}
        description={browser.i18n.getMessage(
          "OptionsAdvancedYouTubeNoCookieDomainDescription",
        )}
      />
    );
  }

  return (
    <VStack align="stretch">
      <TabPanelHeader
        icon={SettingsIcon}
        title={browser.i18n.getMessage("OptionsHeadingAdvanced")}
      />
      <VStack
        divider={<StackDivider borderColor="gray.200" />}
        spacing={6}
        align="stretch"
      >
        <Box>
          <CloseOptionControl />
        </Box>
        <Box>
          <BackgroundTabControl />
        </Box>
        <Box>
          <YouTubeNoCookieDomainControl />
        </Box>
        {isFirefox && (
          <Box>
            <TitleOptionControl />
          </Box>
        )}
        {isFirefox && (
          <Box>
            <ContextualIdentitySupportControl />
          </Box>
        )}
        <Box>
          <AutoOpenControl />
        </Box>
      </VStack>
    </VStack>
  );
}

AdvancedTab.whyDidYouRender = true;
