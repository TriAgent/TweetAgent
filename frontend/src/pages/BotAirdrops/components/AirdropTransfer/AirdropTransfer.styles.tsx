import { Stack, alpha, styled } from "@mui/material";
import { TEXT_PRIMARY_COLOR } from "src/constants";

export const TransferContainer = styled(Stack)({
  background: alpha(TEXT_PRIMARY_COLOR, 0.1),
  borderRadius: 10,
  padding: 10
});

export const InfoRow = styled(Stack)({
  gap: 5,
  alignItems: "center",
  flexDirection: "row"
});

export const InfoLabel = styled("span")({
  textTransform: "uppercase",
  fontSize: 12,
  opacity: 0.6
});
