import React from "react";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import type { MessageName } from "@/utils/i18n";

import { useOption } from "../../hooks/use-options";

// Message names for each mode option, keyed by option domain and value
const MODE_OPTION_MESSAGES = {
  size: {
    current: {
      label: "OptionsSizeModeCurrentLabel",
      description: "OptionsSizeModeCurrentDescription",
    },
    previous: {
      label: "OptionsSizeModePreviousLabel",
      description: "OptionsSizeModePreviousDescription",
    },
    maximized: {
      label: "OptionsSizeModeMaximizedLabel",
      description: "OptionsSizeModeMaximizedDescription",
    },
    custom: {
      label: "OptionsSizeModeCustomLabel",
      description: "OptionsSizeModeCustomDescription",
    },
  },
  position: {
    auto: {
      label: "OptionsPositionModeAutoLabel",
      description: "OptionsPositionModeAutoDescription",
    },
    previous: {
      label: "OptionsPositionModePreviousLabel",
      description: "OptionsPositionModePreviousDescription",
    },
    custom: {
      label: "OptionsPositionModeCustomLabel",
      description: "OptionsPositionModeCustomDescription",
    },
  },
} as const satisfies Record<
  string,
  Record<string, { label: MessageName; description: MessageName }>
>;

type ModeOptionDomain = keyof typeof MODE_OPTION_MESSAGES;
type ModeOptionValue<TDomain extends ModeOptionDomain> =
  keyof (typeof MODE_OPTION_MESSAGES)[TDomain] & string;
type ModeOptionMessages = {
  label: MessageName;
  description: MessageName;
};

// Message names for each mode select control, keyed by the same option domain
const MODE_MESSAGES = {
  size: {
    label: "SizeModeLabel",
    description: "SizeModeDescription",
  },
  position: {
    label: "PositionModeLabel",
    description: "PositionModeDescription",
  },
} as const satisfies Record<ModeOptionDomain, ModeOptionMessages>;

// Keeps callers from mixing a mode domain with an option value from another domain
const GetModeOptionMessages = <TDomain extends ModeOptionDomain>(
  domain: TDomain,
  option: ModeOptionValue<TDomain>,
): ModeOptionMessages =>
  (MODE_OPTION_MESSAGES[domain] as Record<string, ModeOptionMessages>)[option];

const GetModeMessages = <TDomain extends ModeOptionDomain>(
  domain: TDomain,
): ModeOptionMessages => MODE_MESSAGES[domain];

export function ModeOptionRadioControl<const TDomain extends ModeOptionDomain>({
  domain,
  optionName,
  values,
}: {
  domain: TDomain;
  optionName: string;
  values: readonly ModeOptionValue<TDomain>[];
}) {
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
                GetModeOptionMessages(domain, option).label,
              )}
            />
            <Typography
              color="textSecondary"
              gutterBottom
              dangerouslySetInnerHTML={{
                __html: browser.i18n.getMessage(
                  GetModeOptionMessages(domain, option).description,
                ),
              }}
            />
          </React.Fragment>
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export function ModeOptionSelectControl<
  const TDomain extends ModeOptionDomain,
>({
  domain,
  optionName,
  values,
}: {
  domain: TDomain;
  optionName: string;
  values: readonly ModeOptionValue<TDomain>[];
}) {
  const [value, setValue] = useOption(domain, optionName);
  const [controlValue, setControlValue] = React.useState(value);
  const modeMessages = GetModeMessages(domain);

  React.useEffect(() => {
    if (values.includes(controlValue) && controlValue !== value) {
      setValue(controlValue);
    }
  }, [controlValue]);

  return (
    <FormControl fullWidth>
      <InputLabel id={`${domain}-mode-label`}>
        {browser.i18n.getMessage(modeMessages.label)}
      </InputLabel>
      <Select
        label={browser.i18n.getMessage(modeMessages.label)}
        labelId={`${domain}-mode-label`}
        id={`${domain}-mode-select`}
        value={controlValue}
        onChange={(event) => setControlValue(event.target.value)}
      >
        {values.map((option) => (
          <MenuItem value={option} key={option}>
            {browser.i18n.getMessage(
              GetModeOptionMessages(domain, option).label,
            )}
          </MenuItem>
        ))}
      </Select>
      <Typography
        color="textSecondary"
        dangerouslySetInnerHTML={{
          __html: browser.i18n.getMessage(modeMessages.description),
        }}
      />
    </FormControl>
  );
}
