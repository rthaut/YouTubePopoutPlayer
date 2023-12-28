import React from "react";
import {
  Alert,
  AlertDescription,
  Box,
  CloseButton,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Switch,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

import { useOption } from "../../stores/optionsStore";

const PermissionToggleControl = React.forwardRef(
  function PermissionToggleControl(
    { domain, optionName, label, description, permissionsRequest },
    ref,
  ) {
    const [value, setValue] = useOption(domain, optionName);
    const [showPermissionError, setShowPermissionError] = React.useState(false);

    const handlePermissionSwitchToggle = async (remove = false) => {
      setShowPermissionError(false);

      if (remove) {
        await browser.permissions.remove(permissionsRequest);
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

    const onPermissionSwitchChange = async (event) => {
      await handlePermissionSwitchToggle(!event.target.checked);
    };

    return (
      <FormControl ref={ref}>
        <VStack align="stretch">
          <Flex gap={2} alignItems="center">
            <Switch
              id={`${optionName}PermissionToggleSwitch`}
              name={`${optionName}PermissionToggleSwitch`}
              color="primary"
              isChecked={value && !showPermissionError}
              onChange={onPermissionSwitchChange}
            />
            <FormLabel htmlFor={`${optionName}PermissionToggleSwitch`} mb="0">
              {label}
            </FormLabel>
          </Flex>
          {showPermissionError && (
            <Alert status="error" display="flex" flexDirection="row">
              <Box flexGrow={1}>
                <AlertDescription>
                  {browser.i18n.getMessage(
                    "FieldRequiredPermissionsNotGrantedMessage",
                  )}
                </AlertDescription>
              </Box>
              <CloseButton
                onClick={() => {
                  setShowPermissionError(false);
                  setValue(false);
                }}
              />
            </Alert>
          )}
          <FormHelperText
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        </VStack>
      </FormControl>
    );
  },
);

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
