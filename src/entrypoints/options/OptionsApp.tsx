import React from "react";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import Alert from "@mui/lab/Alert";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import { blue, red } from "@mui/material/colors";
import CssBaseline from "@mui/material/CssBaseline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider,
  type PaletteMode,
} from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import ResetOptions from "./components/ResetOptions";
import AdvancedTab, {
  DOMAIN as AdvancedDomain,
} from "./components/tabs/AdvancedTab";
import BehaviorTab, {
  DOMAIN as BehaviorDomain,
} from "./components/tabs/BehaviorTab";
import SizePositionTab, {
  DOMAIN as SizePositionDomain,
} from "./components/tabs/SizePositionTab";
import { OptionsProvider } from "./hooks/use-options";

export default function OptionsApp() {
  const [forceDarkMode, setForceDarkMode] = React.useState(
    localStorage.getItem("force-dark-mode") === "true",
  );
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<PaletteMode>(
    forceDarkMode ? "dark" : prefersDarkMode ? "dark" : "light",
  );

  React.useEffect(() => {
    try {
      if (forceDarkMode) {
        setMode("dark");
        localStorage.setItem("force-dark-mode", "true");
      } else {
        setMode(prefersDarkMode ? "dark" : "light");
        localStorage.removeItem("force-dark-mode");
      }
    } catch (error) {
      console.warn("Failed to persist force dark mode to local storage");
    }
  }, [prefersDarkMode, forceDarkMode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: blue[800],
          },
          secondary: {
            main: red["A700"],
          },
          background: {
            default: mode === "dark" ? "#303030" : "#fff",
          },
        },
      }),
    [mode],
  );

  React.useEffect(() => {
    document.title = browser.i18n.getMessage("OptionsPageTitle");
  }, []);

  const tabs = {
    [BehaviorDomain]: <BehaviorTab />,
    [SizePositionDomain]: <SizePositionTab />,
    [AdvancedDomain]: <AdvancedTab />,
  } as const;

  const [tabValue, setTabValue] = React.useState(Object.keys(tabs)[0]);

  const handleTabChange = (event: React.SyntheticEvent, tabValue: string) => {
    setTabValue(tabValue);
  };

  return (
    <OptionsProvider>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Paper elevation={0} square variant="outlined">
            <TabContext value={tabValue}>
              <AppBar position="static" color="default">
                <TabList onChange={handleTabChange} variant="fullWidth">
                  {Object.keys(tabs).map((tab) => (
                    <Tab
                      label={browser.i18n.getMessage(
                        // TODO: `tab as keyof typeof tabs` gives us the wrong casing,
                        // but technically `browser.i18n.getMessage` is case-insensitive
                        `OptionsTabName${tab as keyof typeof tabs}` as any,
                      )}
                      value={tab}
                      key={tab}
                    />
                  ))}
                </TabList>
              </AppBar>
              {Object.entries(tabs).map(([domain, panel]) => (
                <TabPanel value={domain} key={domain}>
                  {panel}
                </TabPanel>
              ))}
            </TabContext>
          </Paper>
          <Box marginTop={1} marginBottom={2} marginX={1}>
            <Alert
              severity="info"
              icon={<CloudOffIcon color="primary" fontSize="inherit" />}
              // onClose={() => {}} // TODO: use a cookie here? or an extension storage item? how/when to re-display it?
            >
              <Typography
                dangerouslySetInnerHTML={{
                  __html: browser.i18n.getMessage("OptionsPerDeviceWarning"),
                }}
              />
            </Alert>
          </Box>
          <Box marginTop={2} marginBottom={1}>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems="center"
            >
              <ResetOptions />
              <FormControlLabel
                control={
                  <Switch
                    checked={forceDarkMode}
                    onChange={(event) => setForceDarkMode(event.target.checked)}
                  />
                }
                label={browser.i18n.getMessage("OptionsPageForceDarkMode")}
              />
            </Stack>
          </Box>
        </ThemeProvider>
      </StyledEngineProvider>
    </OptionsProvider>
  );
}
