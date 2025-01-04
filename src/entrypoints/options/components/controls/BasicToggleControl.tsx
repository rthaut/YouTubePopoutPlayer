import React from "react";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";

import { type OptionDomain } from "@/utils/constants";

import { useOption } from "../../hooks/use-options";

function BasicToggleControl({
  domain,
  optionName,
  label,
  description,
}: {
  domain: OptionDomain;
  optionName: string;
  label: React.ReactNode;
  description: string;
}) {
  const [value, setValue] = useOption(domain as any, optionName);

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

export default BasicToggleControl;
