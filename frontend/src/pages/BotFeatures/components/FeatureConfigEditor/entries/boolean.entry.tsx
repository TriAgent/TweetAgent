import { Checkbox, FormControlLabel } from "@mui/material";
import { ChangeEvent, FC, useState } from "react";
import { OnInputChangeHandler } from "../FeatureConfigEditor";
import { PropertyNameLabel } from "../FeatureConfigEditor.styles";

export const BooleanEntry: FC<{
  label: string;
  value: boolean;
  onValueChange: OnInputChangeHandler;
}> = ({ label, value, onValueChange }) => {
  const [newValue, setNewValue] = useState<boolean>(value);

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newOutput = e.target.checked;
    setNewValue(newOutput);
    onValueChange(newOutput)
  }

  return <FormControlLabel
    control={
      <Checkbox
        checked={newValue}
        onChange={handleValueChange} />
    }
    label={<PropertyNameLabel>{label}</PropertyNameLabel>}
  />
}