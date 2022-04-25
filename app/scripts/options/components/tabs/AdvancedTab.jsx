import React from "react";
import PropTypes from "prop-types";

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
import ConditionalTooltipWrapper from "../controls/ConditionalTooltipWrapper";

import { useOptions, useOptionsForDomain } from "../../hooks/useOptions";

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

  const { options, setOption } = useOptionsForDomain(DOMAIN);
  console.log("AdvancedTab ~ options", options);

  const { getOptionForDomain } = useOptions();
  const canOpenInBackground =
    getOptionForDomain("size", "mode") !== "maximized";

  const popoutPlayerTarget = getOptionForDomain("behavior", "target");

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

  const handlePermissionSwitchToggle = async (
    optionName,
    permissionsRequest,
    setShowPermissionError,
    remove = false
  ) => {
    setShowPermissionError(false);

    if (remove) {
      await browser.permissions.remove(permissionsRequest);
      setOption(optionName, false);
      return false;
    }

    const permissionGranted = await browser.permissions.request(
      permissionsRequest
    );

    if (!permissionGranted) {
      setShowPermissionError(true);
      return false;
    }

    setOption(optionName, true);
    return true;
  };

  // TODO: make this into a reusable component for other tabs
  function BasicToggleControl({ optionName, label, description }) {
    return (
      <FormControl>
        <FormControlLabel
          label={label}
          control={
            <Switch
              name={`${optionName}ToggleSwitch`}
              color="primary"
              checked={options[optionName]}
              onChange={(event) => setOption(optionName, event.target.checked)}
            />
          }
        />
        <Typography
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </FormControl>
    );
  }

  BasicToggleControl.propTypes = {
    optionName: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    description: PropTypes.string.isRequired,
  };

  // TODO: make this into a reusable component for other tabs
  function PermissionToggleControl({
    optionName,
    label,
    description,
    permissionsRequest,
  }) {
    const [showPermissionError, setShowPermissionError] = React.useState(false);

    const onPermissionSwitchChange = async (event) => {
      handlePermissionSwitchToggle(
        optionName,
        permissionsRequest,
        setShowPermissionError,
        !event.target.checked
      );
    };

    return (
      <FormControl>
        <FormControlLabel
          label={label}
          control={
            <Switch
              name={`${optionName}PermissionToggleSwitch`}
              color="primary"
              checked={options[optionName]}
              onChange={onPermissionSwitchChange}
            />
          }
        />
        {showPermissionError && (
          <Alert
            severity="error"
            onClose={() => {
              setShowPermissionError(false);
            }}
          >
            {browser.i18n.getMessage(
              "FieldRequiredPermissionsNotGrantedMessage"
            )}
          </Alert>
        )}
        <Typography
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </FormControl>
    );
  }

  PermissionToggleControl.propTypes = {
    optionName: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    description: PropTypes.string.isRequired,
    permissionsRequest: PropTypes.shape({
      permissions: PropTypes.arrayOf(PropTypes.string),
    }).isRequired,
  };

  function AutoOpenControl() {
    return (
      <BasicToggleControl
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
