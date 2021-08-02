import React from "react";
import PropTypes from "prop-types";

import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";

import { useOptions } from "../hooks/useOptions";

export function ModeOptionRadioControl({ domain, optionName, values }) {
  const { getOptionForDomain, setOptionForDomain } = useOptions();
  const [value, setValue] = React.useState(
    getOptionForDomain(domain, optionName)
  );

  React.useEffect(() => {
    if (
      values.includes(value) &&
      value !== getOptionForDomain(domain, optionName)
    ) {
      setOptionForDomain(domain, optionName, value);
    }
  }, [value]);

  return (
    <FormControl component="fieldset">
      <RadioGroup
        name={`${domain}-mode`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {values.map((option) => (
          <React.Fragment key={option}>
            <FormControlLabel
              value={option}
              control={<Radio color="primary" />}
              label={browser.i18n.getMessage(
                `Options${domain}Mode${option}Label`
              )}
            />
            <Typography
              color="textSecondary"
              gutterBottom
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  `Options${domain}Mode${option}Description`
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
  const { getOptionForDomain, setOptionForDomain } = useOptions();
  const [value, setValue] = React.useState(
    getOptionForDomain(domain, optionName)
  );

  React.useEffect(() => {
    if (
      values.includes(value) &&
      value !== getOptionForDomain(domain, optionName)
    ) {
      setOptionForDomain(domain, optionName, value);
    }
  }, [value]);

  return (
    <FormControl fullWidth>
      <InputLabel id={`${domain}-mode-label`}>
        {browser.i18n.getMessage(`${domain}ModeLabel`)}
      </InputLabel>
      <Select
        labelId={`${domain}-mode-label`}
        id={`${domain}-mode-select`}
        value={value}
        onChange={(event) => setValue(event.target.value)}
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
