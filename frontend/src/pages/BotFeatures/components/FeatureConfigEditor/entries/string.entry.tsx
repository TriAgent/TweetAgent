import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { camelNicify } from "@utils/camelNicify";
import { FC, useState } from "react";
import { OnInputChangeHandler } from "../FeatureConfigEditor";

export const StringEntry: FC<{
  label: string;
  value: string;
  multiline?: boolean;
  onValueChange: OnInputChangeHandler;
}> = ({ label, value, multiline = true, onValueChange }) => {
  const [newValue, setNewValue] = useState<string>(value);

  const handleChange = (val: string) => {
    setNewValue(val);
    onValueChange(val);
  }

  return <DebouncedTextField
    label={camelNicify(label)}
    type="text"
    multiline={multiline}
    defaultValue={String(newValue)}
    onChange={handleChange}
    style={{ width: "100%" }}
  />
}