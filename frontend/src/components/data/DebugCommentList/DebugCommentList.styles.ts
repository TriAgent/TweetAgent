import { Typography, alpha, styled } from "@mui/material";
import { TEXT_PRIMARY_COLOR } from "src/constants";

export const CommentText = styled(Typography)({
  color: alpha(TEXT_PRIMARY_COLOR,0.7),
  fontSize: "13px",
  paddingLeft:10
});

export const CommentFeatureProviderTitle = styled(Typography)({
  color: alpha(TEXT_PRIMARY_COLOR,1),
  fontSize: "11px",
  fontWeight: 600
});


