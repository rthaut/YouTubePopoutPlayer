import type { Permissions } from "wxt/browser";
import React from "react";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { type OptionDomain } from "@/utils/constants";

import { useOption } from "../../hooks/use-options";

function PermissionToggleControl({
  domain,
  optionName,
  label,
  description,
  permissionsRequest,
}: {
  domain: OptionDomain;
  optionName: string;
  label: React.ReactNode;
  description: string;
  permissionsRequest: Permissions.Permissions;
}) {
  const [value, setValue] = useOption(domain, optionName);
  const [showPermissionError, setShowPermissionError] = React.useState(false);

  const handlePermissionSwitchToggle = async (remove = false) => {
    setShowPermissionError(false);

    if (remove) {
      await browser.permissions.remove(permissionsRequest).catch((error) => {
        console.warn(
          `Failed to remove permission(s) when disabling the \"${label}\" option:`,
          error,
          permissionsRequest,
        );
      });
      setValue(false);
      return false;
    }

    const permissionGranted =
      await browser.permissions.request(permissionsRequest);

    if (!permissionGranted) {
      setShowPermissionError(true);
      return false;
    }

    setValue(true);
    return true;
  };

  const onPermissionSwitchChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
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

export default PermissionToggleControl;
