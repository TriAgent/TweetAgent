import { PageSubtitle } from "@components/base/PageSubtitle/PageSubtitle";
import { Stack } from "@mui/material";
import { RawZodSchema } from "@x-ai-wallet-bot/common";
import { FC, ReactNode, useCallback, useMemo, useState } from "react";
import { OnInputChangeHandler } from "../FeatureConfigEditor";
import { DescriptionLabel } from "../FeatureConfigEditor.styles";
import { BooleanEntry } from "./boolean.entry";
import { NumberEntry } from "./number.entry";
import { StringEntry } from "./string.entry";

export
  const ObjectEntry: FC<{
    label: string;
    inputFormat: RawZodSchema;
    value: any;
    onValueChange: OnInputChangeHandler;
  }> = ({ inputFormat, label, value, onValueChange }) => {
    const [newValue, setNewValue] = useState<typeof value>(value);

    const handleChange = useCallback((childKey: string, childValue: any) => {
      const newVal = { ...value };
      newVal[childKey] = childValue;
      setNewValue(newVal);
      onValueChange(newVal);
    }, [onValueChange, value]);

    const childComponent = useCallback((childLabel: string, child: RawZodSchema): ReactNode => {
      switch (child.type) {
        case "number":
          return <NumberEntry label={childLabel} value={newValue[childLabel]} onValueChange={(newVal) => handleChange(childLabel, newVal)} />;
        case "boolean":
          return <BooleanEntry label={childLabel} value={newValue[childLabel]} onValueChange={(newVal) => handleChange(childLabel, newVal)} />;
        case "string":
          return <StringEntry label={childLabel} value={newValue[childLabel]} onValueChange={(newVal) => handleChange(childLabel, newVal)} />;
        case "object":
          return <ObjectEntry label={childLabel} inputFormat={inputFormat.properties[childLabel]} value={newValue[childLabel]} onValueChange={(newVal) => handleChange(childLabel, newVal)} />
        default:
          return null;
      }
    }, [handleChange, inputFormat, newValue]);

    const friendlyLabel = useMemo(() => {
      if (label === "_prompts")
        return "Prompts";
      return label;
    }, [label]);

    return <Stack gap={2} width="100%">
      <PageSubtitle style={{ textTransform: "capitalize" }}>{friendlyLabel}</PageSubtitle>
      {
        Object.keys(inputFormat.properties).map((prop, i) => <Stack key={i} direction="row" alignItems="center" gap={4} width="100%">
          {childComponent(prop, inputFormat.properties[prop])}
          <DescriptionLabel>{inputFormat.properties[prop].description}</DescriptionLabel>
        </Stack>
        )
      }
    </Stack>
  }
