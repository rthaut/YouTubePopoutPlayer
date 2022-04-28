import React from "react";

import { makeStyles, createStyles } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import CheckIcon from "@material-ui/icons/Check";
import SettingsIcon from "@material-ui/icons/Settings";

import TabPanelHeader from "../TabPanelHeader";
import BasicToggleControl from "../controls/BasicToggleControl";
import PermissionToggleControl from "../controls/PermissionToggleControl";
import ConditionalTooltipWrapper from "../controls/ConditionalTooltipWrapper";

import useOptionsStore, {
  useOptionsForDomain,
} from "../../stores/optionsStore";

import { useDebounce } from "react-use";

import { IsFirefox } from "../../../helpers/utils";

export const DOMAIN = "advanced";

const useStyles = makeStyles((theme) =>
  createStyles({
    disabled: {
      color: theme.palette.text.disabled,
    },
  })
);

export default function AdvancedTab() {
  const classes = useStyles();

  const [options, { setOption }] = useOptionsForDomain(DOMAIN);
  console.log("AdvancedTab ~ options", options);

  const canOpenInBackground =
    useOptionsStore((store) => store["size.mode"]) !== "maximized";

  const popoutPlayerTarget = useOptionsStore(
    (store) => store["behavior.target"]
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

  function AutoOpenControl() {
    return (
      <BasicToggleControl
        domain={DOMAIN}
        optionName="autoOpen"
        label={browser.i18n.getMessage("OptionsAdvancedAutoOpenLabel")}
        description={browser.i18n.getMessage(
          "OptionsAdvancedAutoOpenDescription"
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
            browser.i18n.getMessage("OptionsSizeModeMaximizedLabel")
          )}
        >
          <FormControlLabel
            label={browser.i18n.getMessage(
              "OptionsAdvancedOpenInBackgroundLabel",
              browser.i18n.getMessage(
                `OptionsSubstitutionBehaviorTarget${popoutPlayerTarget}`
              )
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
          className={canOpenInBackground ? "" : classes.disabled}
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage(
              "OptionsAdvancedOpenInBackgroundDescription",
              browser.i18n
                .getMessage(
                  `OptionsSubstitutionBehaviorTarget${popoutPlayerTarget}`
                )
                .toLowerCase()
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
          "OptionsAdvancedContextualIdentityLabel"
        )}
        description={browser.i18n.getMessage(
          "OptionsAdvancedContextualIdentityDescription"
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
            browser.i18n.getMessage("OptionsBehaviorTargetTabLabel")
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
                  <IconButton onClick={saveTitle} edge="end">
                    <CheckIcon />
                  </IconButton>
                </InputAdornment>
              )
            }
          />
        </ConditionalTooltipWrapper>
        <Typography
          color={canSetTitle ? "textSecondary" : "inherit"}
          className={canSetTitle ? "" : classes.disabled}
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
          "OptionsAdvancedYouTubeNoCookieDomainLabel"
        )}
        description={browser.i18n.getMessage(
          "OptionsAdvancedYouTubeNoCookieDomainDescription"
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

AdvancedTab.whyDidYouRender = true;
