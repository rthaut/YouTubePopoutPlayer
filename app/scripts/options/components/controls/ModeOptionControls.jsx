import React from "react";
import {
  Box,
  FormControl,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types";

import { useOption } from "../../stores/optionsStore";

export const ModeOptionRadioControl = React.forwardRef(
  function ModeOptionRadioControl({ domain, optionName, values }, ref) {
    const [value, setValue] = useOption(domain, optionName);
    const [controlValue, setControlValue] = React.useState(value);

    React.useEffect(() => {
      if (values.includes(controlValue) && controlValue !== value) {
        setValue(controlValue);
      }
    }, [controlValue]);

    return (
      <FormControl ref={ref}>
        <RadioGroup
          name={`${domain}-mode`}
          value={controlValue}
          onChange={(newValue) => setControlValue(newValue)}
        >
          <VStack spacing={4} align="stretch">
            {values.map((option) => (
              <Box key={option}>
                <Radio value={option}>
                  {browser.i18n.getMessage(
                    `Options${domain}Mode${option}Label`,
                  )}
                </Radio>
                <Text
                  fontSize="md"
                  dangerouslySetInnerHTML={{
                    __html: browser.i18n.getMessage(
                      `Options${domain}Mode${option}Description`,
                    ),
                  }}
                />
              </Box>
            ))}
          </VStack>
        </RadioGroup>
      </FormControl>
    );
  },
);

export const ModeOptionSelectControl = React.forwardRef(
  function ModeOptionSelectControl({ domain, optionName, values }, ref) {
    const [value, setValue] = useOption(domain, optionName);
    const [controlValue, setControlValue] = React.useState(value);

    React.useEffect(() => {
      if (values.includes(controlValue) && controlValue !== value) {
        setValue(controlValue);
      }
    }, [controlValue]);

    return (
      <FormControl ref={ref}>
        <FormLabel htmlFor={`${domain}-mode-label`}>
          {browser.i18n.getMessage(`${domain}ModeLabel`)}
        </FormLabel>
        <Select
          id={`${domain}-mode-select`}
          value={controlValue}
          onChange={(newValue) => setControlValue(newValue)}
        >
          {values.map((option) => (
            <option value={option} key={option}>
              {browser.i18n.getMessage(`Options${domain}Mode${option}Label`)}
            </option>
          ))}
        </Select>
        <FormHelperText
          dangerouslySetInnerHTML={{
            __html: browser.i18n.getMessage(`${domain}ModeDescription`),
          }}
        />
      </FormControl>
    );
  },
);

ModeOptionRadioControl.propTypes = ModeOptionSelectControl.propTypes = {
  domain: PropTypes.string.isRequired,
  optionName: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
};
