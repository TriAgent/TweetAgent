import { ContentCopy } from "@mui/icons-material";
import { TypographyProps } from "@mui/material";
import { FC, ReactNode } from "react";
import { CopyFieldText, CopyIconButton, StyledCopyField } from "./CopyField.styles";
import { useCopyText } from "@services/ui-ux/hooks/useCopyText";

export type CopyFieldProps = {
  value: string;
  displayValue: ReactNode;
} & TypographyProps;

export const CopyField: FC<CopyFieldProps> = (props) => {
  const { value, displayValue, ...rest } = props;
  const { copyText } = useCopyText();

  return (
    <StyledCopyField>
      <CopyFieldText {...rest}>{displayValue}</CopyFieldText>
      <CopyIconButton
        onClick={(e) => {
          e.stopPropagation();
          copyText(value);
        }}
        sx={{
          borderRadius: "50%",
          backgroundColor: "transparent",
        }}
      >
        <ContentCopy
          sx={{
            background: "transparent",
          }}
        />
      </CopyIconButton>
    </StyledCopyField>
  );
};
