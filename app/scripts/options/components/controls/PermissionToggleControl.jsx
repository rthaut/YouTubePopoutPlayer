import React from "react";
import PropTypes from "prop-types";

import Alert from "@material-ui/lab/Alert";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Typography from "@material-ui/core/Typography";

import { useOption } from "../../stores/optionsStore";

function PermissionToggleControl({
  domain,
  optionName,
  label,
  description,
  permissionsRequest,
}) {
  const [value, setValue] = useOption(domain, optionName);
  const [showPermissionError, setShowPermissionError] = React.useState(false);

  const handlePermissionSwitchToggle = async (remove = false) => {
    setShowPermissionError(false);

    if (remove) {
      await browser.permissions.remove(permissionsRequest);
      setValue(false);
      return false;
    }

    const permissionGranted = await browser.permissions.request(
      permissionsRequest
    );

    if (!permissionGranted) {
      setShowPermissionError(true);
      return false;
    }

    setValue(true);
    return true;
  };

  const onPermissionSwitchChange = async (event) => {
    handlePermissionSwitchToggle(!event.target.checked);
  };

  return (
    <FormControl>
      <FormControlLabel
        label={label}
        control={
          <Switch
            name={`${optionName}PermissionToggleSwitch`}
            color="primary"
            checked={value}
            onChange={onPermissionSwitchChange}
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
          {browser.i18n.getMessage("FieldRequiredPermissionsNotGrantedMessage")}
        </Alert>
      )}
      <Typography
        color="textSecondary"
        dangerouslySetInnerHTML={{
          __html: description,
        }}
      />
    </FormControl>
  );
}

PermissionToggleControl.propTypes = {
  domain: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  description: PropTypes.string.isRequired,
  permissionsRequest: PropTypes.shape({
    permissions: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

PermissionToggleControl.whyDidYouRender = true;

export default PermissionToggleControl;
