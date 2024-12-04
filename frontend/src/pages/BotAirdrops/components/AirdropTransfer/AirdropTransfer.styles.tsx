import { Stack, alpha, styled } from "@mui/material";
import { TEXT_PRIMARY_COLOR } from "src/constants";


export const TransferContainer = styled(Stack)({
  background: alpha(TEXT_PRIMARY_COLOR, 0.1),
  borderRadius: 10,
  padding: 10
});
