import React from "react";

import Alert from '@material-ui/lab/Alert';
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import IconButton from '@material-ui/core/IconButton';
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import InputLabel from "@material-ui/core/InputLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import CheckIcon from '@material-ui/icons/Check';
import SettingsIcon from "@material-ui/icons/Settings";

import TabPanelHeader from "./TabPanelHeader";

import { useOptionsForDomain } from "../hooks/useOptions";

import { useDebounce } from "react-use";

import Utils from "../../helpers/utils";

export const DOMAIN = "advanced";

export default function AdvancedTab() {
  const { options, setOption } = useOptionsForDomain(DOMAIN);
  console.log("AdvancedTab ~ options", options)

  const [isFirefox, setIsFirefox] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      setIsFirefox(await Utils.IsFirefox());
    })();
  }, []);

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

  function CloseOptionControl() {
    const [showPermissionError, setShowPermissionError] = React.useState(false);

    // TODO: extract this to a generic utility function for re-use? (if future optional permissions are ever introduced)
    const handleCloseSwitchToggle = async (event) => {
      setShowPermissionError(false);

      const permissionsRequest = {
        permissions: ["tabs"],
      };

      if (!event.target.checked) {
        await browser.permissions.remove(permissionsRequest);
        setOption("close", false);
        return;
      }

      const permissionGranted = await browser.permissions.request(
        permissionsRequest
      );

      if (!permissionGranted) {
        setShowPermissionError(true);
        return;
      }

      setOption("close", true);
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

  return (
    <Box>
      <TabPanelHeader
        icon={<SettingsIcon />}
        title={browser.i18n.getMessage("OptionsHeadingAdvanced")}
      />
      <Box marginTop={1} marginBottom={2}>
        <CloseOptionControl />
      </Box>
      {isFirefox && (
        <>
          <Divider />
          <Box marginTop={2}>
            <TitleOptionControl />
          </Box>
        </>
      )}
    </Box>
  );
}

AdvancedTab.whyDidYouRender = true;
