import { Box, Stack, Typography, alpha, styled } from "@mui/material";
import { BACKGROUND_SECONDARY_COLOR, TEXT_PRIMARY_COLOR } from "src/constants";

export const HeaderUserNameLabel = styled(Typography)({
  fontWeight: 800
});

export const HeaderSecondaryLabel = styled(Typography)({
  opacity: 0.5
});

export const PostTextContainer = styled(Stack)({
  //border: `solid 1px ${alpha(TEXT_SECONDARY_COLOR, 0.2)}`,
  borderRadius: 10,
  marginTop: 5,
  width: "100%"
});

export const PostSubInfo = styled(Typography)({
  opacity: 0.8,
  fontSize: 10
});

export const QuotedPostContainer = styled(Box)({
  background: alpha(BACKGROUND_SECONDARY_COLOR, 1),
  padding: 10,
  borderRadius: 10,
  marginLeft: 20,
  marginTop: 10
});

export const RepliedToLabel = styled(Typography)({
  fontSize: 12,
  color: TEXT_PRIMARY_COLOR,
  opacity: 0.7,
  cursor: "pointer",
  marginBottom: 10
});