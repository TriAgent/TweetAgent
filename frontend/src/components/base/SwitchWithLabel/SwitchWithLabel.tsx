import { FC } from "react";
import { Stack, Switch, useMediaQuery, useTheme } from "@mui/material";

import { LabelText } from "./SwitchWithLabel.styles";
import { IosSwitch } from "../IosSwitch/IosSwitch";

interface SwitchWithLabelProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const SwitchWithLabel: FC<SwitchWithLabelProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <Stack direction="row" sx={{ alignItems: "center", marginRight: "12px" }} spacing={2}>
      <IosSwitch
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <LabelText>{label}</LabelText>
    </Stack>
  );
};
