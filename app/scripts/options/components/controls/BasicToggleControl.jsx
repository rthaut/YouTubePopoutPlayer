import React from "react";
import PropTypes from "prop-types";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { useOption } from "../../stores/optionsStore";

function BasicToggleControl({ domain, optionName, label, description }) {
  const [value, setValue] = useOption(domain, optionName);

  return (
    <FormControl>
      <FormControlLabel
        label={label}
        control={
          <Switch
            name={`${optionName}ToggleSwitch`}
            color="primary"
            checked={value}
            onChange={(event) => setValue(event.target.checked)}
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
  domain: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  description: PropTypes.string.isRequired,
};

BasicToggleControl.whyDidYouRender = true;

export default BasicToggleControl;
