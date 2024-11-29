import { Typography, alpha, styled } from "@mui/material";
import { TEXT_SECONDARY_COLOR } from "src/constants";

export const HeaderUserNameLabel = styled(Typography)({
  fontWeight: 800
});

export const HeaderSecondaryLabel = styled(Typography)({
  opacity: 0.5
});

export const PostTextContainer = styled(Typography)({
  border: `solid 1px ${alpha(TEXT_SECONDARY_COLOR, 0.1)}`,
  borderRadius: 10,
  cursor: "pointer",
  padding: 6,
  width: "100%"
});
