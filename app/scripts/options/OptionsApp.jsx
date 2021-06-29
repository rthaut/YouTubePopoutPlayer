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

import BehaviorTab, {
  DOMAIN as BehaviorDomain,
} from "./components/BehaviorTab";
import SizeTab, { DOMAIN as SizeDomain } from "./components/SizeTab";
import AdvancedTab, {
  DOMAIN as AdvancedDomain,
} from "./components/AdvancedTab";

import { OPTION_DEFAULTS } from "../helpers/constants";
import Options from "../helpers/options";

export default function App() {
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
    [BehaviorDomain]: BehaviorTab,
    [SizeDomain]: SizeTab,
    [AdvancedDomain]: AdvancedTab,
  };

  const [tabValue, setTabValue] = React.useState(Object.keys(tabs)[0]);

  const handleTabChange = (event, tabValue) => {
    setTabValue(tabValue);
  };

  const [options, setOptions] = React.useState(OPTION_DEFAULTS);

  React.useEffect(() => {
    (async () => {
      const options = {};
      for (const domain of Object.keys(tabs)) {
        options[domain] = await Options.GetLocalOptionsForDomain(domain);
      }
      setOptions(options);
    })();
  }, []);

  const getOptionForDomain = (domain, option) => options[domain][option];

  const setOptionForDomain = (domain) => (optionName, optionType) => (event) => {
    let value = undefined;
    switch (optionType) {
      case "string":
        value = event.target.value;
        break;

      case "number":
        value =
          event.target.value !== "" ? parseInt(event.target.value, 10) : 0;
        break;

      case "boolean":
        value = event.target.checked;
        break;
    }

    if (value === undefined) {
      return;
    }

    const domainOptions = {
      ...options[domain],
      [optionName]: value,
    };

    setOptionsForDomain(domain)(domainOptions);
  };

  const setOptionsForDomain = (domain) => (domainOptions) => {
    setOptions((options) => ({
      ...options,
      [domain]: domainOptions,
    }));

    Options.SetLocalOptionsForDomain(domain, domainOptions);
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
          {Object.entries(tabs).map(([domain, panel]) => (
            <TabPanel value={domain} key={domain}>
              {panel({
                options: options[domain],
                setOption: setOptionForDomain(domain),
                setOptions: setOptionsForDomain(domain),
                getOptionForDomain
              })}
            </TabPanel>
          ))}
        </TabContext>
      </Paper>
    </ThemeProvider>
  );
}
