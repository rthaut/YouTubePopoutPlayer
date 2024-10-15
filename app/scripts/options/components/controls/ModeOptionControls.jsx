import React from "react";
import PropTypes from "prop-types";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import { useOption } from "../../stores/optionsStore";

export function ModeOptionRadioControl({ domain, optionName, values }) {
  const [value, setValue] = useOption(domain, optionName);
  const [controlValue, setControlValue] = React.useState(value);

  React.useEffect(() => {
    if (values.includes(controlValue) && controlValue !== value) {
      setValue(controlValue);
    }
  }, [controlValue]);

  return (
    <FormControl component="fieldset">
      <RadioGroup
        name={`${domain}-mode`}
        value={controlValue}
        onChange={(event) => setControlValue(event.target.value)}
      >
        {values.map((option) => (
          <React.Fragment key={option}>
            <FormControlLabel
              value={option}
              control={<Radio color="primary" />}
              label={browser.i18n.getMessage(
                `Options${domain}Mode${option}Label`,
              )}
            />
            <Typography
              color="textSecondary"
              gutterBottom
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  `Options${domain}Mode${option}Description`,
                ),
              }}
            />
          </React.Fragment>
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export function ModeOptionSelectControl({ domain, optionName, values }) {
  const [value, setValue] = useOption(domain, optionName);
  const [controlValue, setControlValue] = React.useState(value);

  React.useEffect(() => {
    if (values.includes(controlValue) && controlValue !== value) {
      setValue(controlValue);
    }
  }, [controlValue]);

  return (
    <FormControl fullWidth>
      <InputLabel id={`${domain}-mode-label`}>
        {browser.i18n.getMessage(`${domain}ModeLabel`)}
      </InputLabel>
      <Select
        label={browser.i18n.getMessage(`${domain}ModeLabel`)}
        labelId={`${domain}-mode-label`}
        id={`${domain}-mode-select`}
        value={controlValue}
        onChange={(event) => setControlValue(event.target.value)}
      >
        {values.map((option) => (
          <MenuItem value={option} key={option}>
            {browser.i18n.getMessage(`Options${domain}Mode${option}Label`)}
          </MenuItem>
        ))}
      </Select>
      <Typography
        color="textSecondary"
        paragraph
        dangerouslySetInnerHTML={{
          __html: browser.i18n.getMessage(`${domain}ModeDescription`),
        }}
      />
    </FormControl>
  );
}

ModeOptionRadioControl.propTypes = ModeOptionSelectControl.propTypes = {
  domain: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};
