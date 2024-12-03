import { TextField } from "@mui/material";
import { useDebounceInput } from "@services/ui-ux/hooks/useDebounceInput";
import { CSSProperties, forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";

type Props = {
  label: string;
  defaultValue?: string;
  multiline?: boolean;
  minRows?: number; // for multline only
  maxRows?: number; // for multline only
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onChange: (newValue: string) => void;
  debounceTime?: number; // Milliseconds. Can use 0
  style?: CSSProperties;
};

export const DebouncedTextField = forwardRef<{ clear: () => void }, Props>(({ label, defaultValue = "", onChange, multiline = false, minRows = 1, maxRows = 100, debounceTime = 1000, style }, ref) => {
  const [value, setValue] = useState(defaultValue);

  useImperativeHandle(ref, () => ({
    clear: () => setValue(''),
  }));

  const onDebouncedChange = useCallback(onChange, [onChange]);
  const [inputSubject] = useDebounceInput(value, onDebouncedChange, debounceTime);

  // Force re-apply default value when it changes
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return <TextField label={label} variant="outlined"
    multiline={multiline}
    minRows={minRows}
    maxRows={maxRows}
    value={value || ""}
    style={style}
    onChange={e => { setValue(e.target.value); inputSubject.next(e.target.value) }}
  />
});