import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { FC, useState } from "react";
import { OnInputChangeHandler } from "../FeatureConfigEditor";

export const NumberEntry: FC<{
  label: string;
  value: number;
  onValueChange: OnInputChangeHandler;
}> = ({ label, value, onValueChange }) => {
  const [newValue, setNewValue] = useState<number>(value);

  const handleChange = (val: string) => {
    const newOutput = parseInt(val);
    setNewValue(newOutput);
    onValueChange(newOutput);
  }

  return <DebouncedTextField
    label={label}
    type="number"
    defaultValue={String(newValue)}
    onChange={handleChange}
  />
}