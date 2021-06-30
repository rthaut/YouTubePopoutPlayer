import React from "react";
import CssBaseline from "@material-ui/core/CssBaseline";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Tab from "@material-ui/core/Tab";
import TabContext from "@material-ui/lab/TabContext";
import TabList from "@material-ui/lab/TabList";
import TabPanel from "@material-ui/lab/TabPanel";

import { OptionsProvider } from "./contexts/OptionsContext";

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
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? "dark" : "light",
          primary: {
            main: "#d50000",
          },
          secondary: {
            main: "#d32f2f",
          },
        },
      }),
    [prefersDarkMode]
  );

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
          <OptionsProvider>
            {Object.entries(tabs).map(([domain, panel]) => (
              <TabPanel value={domain} key={domain}>
                {panel}
              </TabPanel>
            ))}
          </OptionsProvider>
        </TabContext>
      </Paper>
    </ThemeProvider>
  );
}
