import { TextField } from "@mui/material";
import { ChangeEvent, FC, useState } from "react";
import { OnInputChangeHandler } from "../FeatureConfigEditor";

export const NumberEntry: FC<{
  label: string;
  value: number;
  onValueChange: OnInputChangeHandler;
}> = ({ label, value, onValueChange }) => {
  const [newValue, setNewValue] = useState<number>(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newOutput = parseInt(e.target.value);
    setNewValue(newOutput);
    onValueChange(newOutput);
  }

  return <TextField
    placeholder={label}
    required
    type="number"
    autoComplete="off"
    value={newValue}
    onChange={handleChange}
  />
}