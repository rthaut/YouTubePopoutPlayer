import React from "react";
import CheckIcon from "@mui/icons-material/Check";
import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useDebounce } from "react-use";

import { IsFirefox } from "@/utils/misc";

import { useDomainOptions, useOption } from "../../hooks/use-options";
import BasicToggleControl from "../controls/BasicToggleControl";
import ConditionalTooltipWrapper from "../controls/ConditionalTooltipWrapper";
import PermissionToggleControl from "../controls/PermissionToggleControl";
import TabPanelHeader from "../TabPanelHeader";

export const DOMAIN = "advanced";

export default function AdvancedTab() {
  const { options, setOption } = useDomainOptions(DOMAIN);

  const [popoutPlayerTarget] = useOption("behavior", "target");
  const [mode] = useOption("size", "mode");
  const canOpenInBackground = mode !== "maximized";

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
      <FormControl disabled={!canOpenInBackground}>
        <ConditionalTooltipWrapper
          condition={!canOpenInBackground}
          html={browser.i18n.getMessage(
            "OptionsSettingDisabled",
            browser.i18n.getMessage("OptionsSizeModeMaximizedLabel"),
          )}
        >
          <FormControlLabel
            label={browser.i18n.getMessage(
              "OptionsAdvancedOpenInBackgroundLabel",
              browser.i18n.getMessage(
                // TODO: narrow this typing, `popoutPlayerTarget` should only ever be "tab" or "window"
                `OptionsSubstitutionBehaviorTarget${popoutPlayerTarget}` as any,
              ),
            )}
            control={
              <Switch
                name="openInBackgroundSwitch"
                color="primary"
                checked={options["background"]}
                onChange={(event) =>
                  setOption("background", event.target.checked)
                }
              />
            }
          />
        </ConditionalTooltipWrapper>
        <Typography
          color={canOpenInBackground ? "textSecondary" : "inherit"}
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage(
              "OptionsAdvancedOpenInBackgroundDescription",
              browser.i18n
                .getMessage(
                  // TODO: narrow this typing, `popoutPlayerTarget` should only ever be "tab" or "window"
                  `OptionsSubstitutionBehaviorTarget${popoutPlayerTarget}` as any,
                )
                .toLowerCase(),
            ),
          }}
        />
      </FormControl>
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

    const saveTitle = () => {
      if (title !== options["title"]) {
        setOption("title", title);
      }
    };

    useDebounce(saveTitle, 2000, [title, options]);

    const canSetTitle = popoutPlayerTarget === "window";

    return (
      <FormControl disabled={!canSetTitle}>
        <InputLabel htmlFor="title-input" variant="standard">
          {browser.i18n.getMessage("OptionsAdvancedTitleLabel")}
        </InputLabel>
        <ConditionalTooltipWrapper
          condition={!canSetTitle}
          html={browser.i18n.getMessage(
            "OptionsSettingDisabled",
            browser.i18n.getMessage("OptionsBehaviorTargetTabLabel"),
          )}
        >
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
            endAdornment={
              title !== options["title"] && (
                <InputAdornment position="end">
                  <IconButton onClick={saveTitle} edge="end" size="large">
                    <CheckIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </ConditionalTooltipWrapper>
        <Typography
          color={canSetTitle ? "textSecondary" : "inherit"}
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("OptionsAdvancedTitleDescription"),
          }}
        />
      </FormControl>
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
    <Box>
      <TabPanelHeader
        icon={<SettingsIcon />}
        title={browser.i18n.getMessage("OptionsHeadingAdvanced")}
      />
      <Box marginTop={1} marginBottom={2}>
        <CloseOptionControl />
      </Box>
      <Divider />
      <Box marginY={2}>
        <BackgroundTabControl />
      </Box>
      <Divider />
      <Box marginY={2}>
        <YouTubeNoCookieDomainControl />
      </Box>
      {isFirefox && (
        <>
          <Divider />
          <Box marginY={2}>
            <TitleOptionControl />
          </Box>
          <Divider />
          <Box marginY={2}>
            <ContextualIdentitySupportControl />
          </Box>
        </>
      )}
      <Divider />
      <Box marginY={2}>
        <AutoOpenControl />
      </Box>
    </Box>
  );
}
