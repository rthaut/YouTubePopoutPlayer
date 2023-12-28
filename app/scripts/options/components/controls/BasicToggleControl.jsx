import React from "react";
import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Switch,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

import { useOption } from "../../stores/optionsStore";

const BasicToggleControl = React.forwardRef(function BasicToggleControl(
  { domain, optionName, label, description, isDisabled = false },
  ref,
) {
  const [value, setValue] = useOption(domain, optionName);

  return (
    <FormControl isDisabled={isDisabled} ref={ref}>
      <VStack align="stretch">
        <Flex gap={2} alignItems="center">
          <Switch
            id={`${optionName}ToggleSwitch`}
            name={`${optionName}ToggleSwitch`}
            color="primary"
            isChecked={value}
            onChange={(event) => setValue(event.target.checked)}
          />
          <FormLabel htmlFor={`${optionName}ToggleSwitch`} mb="0">
            {label}
          </FormLabel>
        </Flex>
        <FormHelperText
          opacity={isDisabled ? "0.4" : undefined}
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </VStack>
    </FormControl>
  );
});

BasicToggleControl.propTypes = {
  domain: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  description: PropTypes.string.isRequired,
  isDisabled: PropTypes.bool,
};

BasicToggleControl.whyDidYouRender = true;

export default BasicToggleControl;
