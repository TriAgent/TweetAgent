import { TextField } from "@mui/material";
import { useDebounceInput } from "@services/ui-ux/hooks/useDebounceInput";
import { FC } from "react";

export const DebouncedTextField: FC<{
  label: string;
  defaultValue: string;
  multiline?: boolean;
  maxRows?: number; // for multline only
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (newValue: string) => void;
}> = ({ label, defaultValue, onChange, multiline = false, maxRows = 5 }) => {
  const [inputSubject] = useDebounceInput(defaultValue, newValue => {
    onChange(newValue);
  }, 500);

  return <TextField label={label} variant="outlined"
    multiline={multiline}
    maxRows={maxRows}
    defaultValue={defaultValue || ""}
    onChange={e => { inputSubject.next(e.target.value) }}
  />
}