import React from "react";

import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import blue from "@material-ui/core/colors/blue";
import red from "@material-ui/core/colors/red";

import Alert from "@material-ui/lab/Alert";
import AppBar from "@material-ui/core/AppBar";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";
import Typography from "@material-ui/core/Typography";

import CloudOffIcon from "@material-ui/icons/CloudOff";

import { ExtensionStorageProvider } from "./contexts/ExtensionStorage";

import ResetOptions from "./components/ResetOptions";

import BehaviorTab, {
  DOMAIN as BehaviorDomain,
} from "./components/BehaviorTab";
import SizeTab, { DOMAIN as SizeDomain } from "./components/SizeTab";
import AdvancedTab, {
  DOMAIN as AdvancedDomain,
} from "./components/AdvancedTab";

export default function OptionsApp() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            main: blue[800],
          },
          secondary: {
            main: red["A700"],
          },
          background: {
            default: prefersDarkMode ? "#303030" : "#fff",
          },
        },
      }),
    [prefersDarkMode]
  );

  React.useEffect(() => {
    document.title = browser.i18n.getMessage("OptionsPageTitle");
  }, []);

  const tabs = {
    [BehaviorDomain]: <BehaviorTab />,
    [SizeDomain]: <SizeTab />,
    [AdvancedDomain]: <AdvancedTab />,
  };

  const [tabValue, setTabValue] = React.useState(Object.keys(tabs)[0]);

  const handleTabChange = (event, tabValue) => {
    setTabValue(tabValue);
  };

  return (
    <ExtensionStorageProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box marginTop={1} marginBottom={2}>
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
        <Paper elevation={0} square variant="outlined">
          <TabContext value={tabValue}>
            <AppBar position="static" color="default">
              <TabList onChange={handleTabChange} variant="fullWidth">
                {Object.keys(tabs).map((tab) => (
                  <Tab
                    label={browser.i18n.getMessage(`OptionsTabName${tab}`)}
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
        <Box marginTop={2} marginBottom={1}>
          <ResetOptions />
        </Box>
      </ThemeProvider>
    </ExtensionStorageProvider>
  );
}
