import styled from "@emotion/styled";
import { LinearProgress, Typography, alpha } from "@mui/material";

import { TEXT_INVERTED_COLOR } from "../../../constants";

export const StyledTypography = styled(Typography)({
  color: alpha(TEXT_INVERTED_COLOR, 0.87),
  fontSize: "inherit",
  fontWeight: "400",
  lineHeight: "143%",
  letterSpacing: "0.17px",
});

export const StyledLinearProgress = styled(LinearProgress)({
  backgroundColor: alpha("#FFFFFF", 0.3),

  ".MuiLinearProgress-barColorPrimary": {
    backgroundColor: "#97FEAE",
  },
});
