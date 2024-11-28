import { TextField } from "@mui/material";
import { useDebounceInput } from "@services/ui-ux/hooks/useDebounceInput";
import { CSSProperties, FC, useCallback, useEffect, useState } from "react";

export const DebouncedTextField: FC<{
  label: string;
  defaultValue?: string;
  multiline?: boolean;
  maxRows?: number; // for multline only
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (newValue: string) => void;
  debounceTime?: number; // Milliseconds. Can use 0
  style?: CSSProperties;
}> = ({ label, defaultValue = "", onChange, multiline = false, maxRows = 100, debounceTime = 1000, style }) => {
  const [value, setValue] = useState(defaultValue);

  const onDebouncedChange = useCallback(onChange, [onChange]);
  const [inputSubject] = useDebounceInput(value, onDebouncedChange, debounceTime);

  // Force re-apply default value when it changes
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return <TextField label={label} variant="outlined"
    multiline={multiline}
    maxRows={maxRows}
    value={value || ""}
    style={style}
    onChange={e => { setValue(e.target.value); inputSubject.next(e.target.value) }}
  />
}