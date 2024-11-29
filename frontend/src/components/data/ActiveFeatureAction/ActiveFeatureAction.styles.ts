import { Stack, Typography, alpha, styled } from "@mui/material";
import { BACKGROUND_PRIMARY_COLOR, TEXT_PRIMARY_COLOR } from "src/constants";

export const ActiveFeatureActionContainer = styled(Stack)({
  background: alpha(BACKGROUND_PRIMARY_COLOR, 1),
  borderRadius: 5,
  padding: 5,
})

export const ActiveFeatureActionTitle = styled(Typography)({
  fontSize: 10,
  marginBottom:10,
  borderBottom: `solid 1px ${alpha(TEXT_PRIMARY_COLOR, 0.3)}`,
  textAlign:"center"
});

export const ActiveFeatureActionBot = styled(Typography)({
  fontSize: 12
});

export const ActiveFeatureActionFeature = styled(Typography)({
  fontWeight: "600",
  fontSize: 14,
  marginBottom:10
});

export const ActiveFeatureActionAction = styled(Typography)({
  fontWeight: "600",
  fontSize: 12
});

export const ActiveFeatureActionActive = styled(Typography)({
  fontSize: 12,
  opacity: 0.5,
  textAlign:"right"
});

export const ActiveFeatureActionDate = styled(Typography)({
  fontSize: 12,
  opacity: 0.5,
  textAlign:"right"
});