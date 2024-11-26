import { IconButton, Typography, alpha, styled } from "@mui/material";

import { TEXT_INVERTED_COLOR } from "../../../constants";

export const StyledCopyField = styled("div")({
  display: "inline-flex",
  gap: "10px",
});

export const CopyFieldText = styled(Typography)(() => ({
  fontSize: "inherit",
  color: alpha(TEXT_INVERTED_COLOR, 0.87),
  textDecoration: "underline",
}));

export const CopyIconButton = styled(IconButton)(({ theme }) => ({
  padding: 0,
  backgroundColor: "transparent",
  color: alpha(TEXT_INVERTED_COLOR, 0.54),
  [theme.breakpoints.down("sm")]: {
    width: "14px",
  },
}));
