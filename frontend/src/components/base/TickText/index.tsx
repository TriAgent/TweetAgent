import { Typography, styled } from "@mui/material";

import { TEXT_PRIMARY_COLOR } from "../../../constants";

export const TickText = styled(Typography)<{ fontSize?: string }>(
  ({ fontSize }) => ({
    color: TEXT_PRIMARY_COLOR,
    fontSize: fontSize ?? "inherit",
    fontStyle: "italic",
    fontWeight: 600,
    lineHeight: "143%",
    letterSpacing: "0.17px",
  })
);
