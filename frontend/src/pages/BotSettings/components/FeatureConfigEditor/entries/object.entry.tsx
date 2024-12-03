import { Stack } from "@mui/material";
import { RawZodSchema } from "@x-ai-wallet-bot/common";
import { FC, ReactNode, useCallback, useState } from "react";
import { OnInputChangeHandler } from "../FeatureConfigEditor";
import { DescriptionLabel } from "../FeatureConfigEditor.styles";
import { BooleanEntry } from "./boolean.entry";
import { NumberEntry } from "./number.entry";

export
  const ObjectEntry: FC<{
    label: string;
    inputFormat: RawZodSchema;
    value: any;
    onValueChange: OnInputChangeHandler;
  }> = ({ inputFormat, value, onValueChange }) => {
    const [newValue, setNewValue] = useState<typeof value>(value);

    const handleChange = useCallback((childKey: string, childValue: any) => {
      const newVal = { ...value };
      newVal[childKey] = childValue;
      setNewValue(newVal);
      onValueChange(newVal);
    }, [onValueChange, value]);

    const childComponent = useCallback((childLabel: string, child: RawZodSchema): ReactNode => {
      switch (child.type) {
        case "string":
          return <div>STRING INPUT TODO</div>;
        case "number":
          return <NumberEntry label={childLabel} value={newValue[childLabel]} onValueChange={(newVal) => handleChange(childLabel, newVal)} />;
        case "boolean":
          return <BooleanEntry label={childLabel} value={newValue[childLabel]} onValueChange={(newVal) => handleChange(childLabel, newVal)} />;
        case "object":
        default:
          return null;
      }
    }, [handleChange, newValue]);

    return <Stack>{
      Object.keys(inputFormat.properties).map((prop, i) => <Stack key={i}>
        <DescriptionLabel>{inputFormat.properties[prop].description}</DescriptionLabel>
        {childComponent(prop, inputFormat.properties[prop])}
      </Stack>
      )
    }
    </Stack>
  }
