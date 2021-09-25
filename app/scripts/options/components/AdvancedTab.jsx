import React from "react";

import Alert from "@material-ui/lab/Alert";
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

import TabPanelHeader from "./TabPanelHeader";

import { useOptions, useOptionsForDomain } from "../hooks/useOptions";

import { useDebounce } from "react-use";

import { IsFirefox } from "../../helpers/utils";

export const DOMAIN = "advanced";

export default function AdvancedTab() {
  const { options, setOption } = useOptionsForDomain(DOMAIN);
  console.log("AdvancedTab ~ options", options);

  const { getOptionForDomain } = useOptions();
  const canOpenInBackground =
    getOptionForDomain("size", "mode") !== "maximized";

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

  function CloseOptionControl() {
    const [showPermissionError, setShowPermissionError] = React.useState(false);

    const handleCloseSwitchToggle = async (event) => {
      const permissionsRequest = {
        permissions: ["tabs"],
      };

      handlePermissionSwitchToggle(
        "close",
        permissionsRequest,
        setShowPermissionError,
        !event.target.checked
      );
    };

    return (
      <>
        <FormControl>
          <FormControlLabel
            label={browser.i18n.getMessage("OptionsAdvancedCloseLabel")}
            control={
              <Switch
                name="close-switch"
                color="primary"
                checked={options["close"]}
                onChange={handleCloseSwitchToggle}
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
              __html: browser.i18n.getMessage(
                "OptionsAdvancedCloseDescription"
              ),
            }}
          />
        </FormControl>
      </>
    );
  }

  function BackgroundTabControl() {
    return (
      <>
        <FormControl disabled={!canOpenInBackground}>
          <FormControlLabel
            label={browser.i18n.getMessage(
              "OptionsAdvancedOpenInBackgroundLabel"
            )}
            control={
              <Switch
                name="close-switch"
                color="primary"
                checked={options["background"]}
                onChange={(event) =>
                  setOption("background", event.target.checked)
                }
              />
            }
          />
          {canOpenInBackground ? (
            <Typography
              color="textSecondary"
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  "OptionsAdvancedOpenInBackgroundDescription"
                ),
              }}
            />
          ) : (
            <Alert severity="warning">
              <Typography
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage(
                    "OptionsSettingDisabled",
                    browser.i18n.getMessage("OptionsSizeModeMaximizedLabel")
                  ),
                }}
              />
            </Alert>
          )}
        </FormControl>
      </>
    );
  }

  function YouTubeNoCookieDomainControl() {
    return (
      <>
        <FormControl>
          <FormControlLabel
            label={browser.i18n.getMessage(
              "OptionsAdvancedYouTubeNoCookieDomainLabel"
            )}
            control={
              <Switch
                name="close-switch"
                color="primary"
                checked={options["noCookieDomain"]}
                onChange={(event) =>
                  setOption("noCookieDomain", event.target.checked)
                }
              />
            }
          />
          <Typography
            color="textSecondary"
            dangerouslySetInnerHTML={{
              __html: browser.i18n.getMessage(
                "OptionsAdvancedYouTubeNoCookieDomainDescription"
              ),
            }}
          />
        </FormControl>
      </>
    );
  }

  function ContextualIdentitySupportControl() {
    const [showPermissionError, setShowPermissionError] = React.useState(false);

    const handleCloseSwitchToggle = async (event) => {
      const permissionsRequest = {
        permissions: ["cookies"],
      };

      handlePermissionSwitchToggle(
        "contextualIdentity",
        permissionsRequest,
        setShowPermissionError,
        !event.target.checked
      );
    };

    return (
      <>
        <FormControl>
          <FormControlLabel
            label={browser.i18n.getMessage(
              "OptionsAdvancedContextualIdentityLabel"
            )}
            control={
              <Switch
                name="contextual-identity-switch"
                color="primary"
                checked={options["contextualIdentity"]}
                onChange={handleCloseSwitchToggle}
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
              __html: browser.i18n.getMessage(
                "OptionsAdvancedContextualIdentityDescription"
              ),
            }}
          />
        </FormControl>
      </>
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

    return (
      <FormControl>
        <InputLabel htmlFor="title-input" variant="standard">
          {browser.i18n.getMessage("OptionsAdvancedTitleLabel")}
        </InputLabel>
        <Input
          id="title-input"
          type="text"
          value={title}
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
        <Typography
          color="textSecondary"
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage("OptionsAdvancedTitleDescription"),
          }}
        />
      </FormControl>
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
    </Box>
  );
}

AdvancedTab.whyDidYouRender = true;
