import NoDataIcon from "@assets/no-data.svg";
import { Stack } from "@mui/material";
import { NoDataText } from "./NoData.styles";

export const NoData = () => (
  <Stack alignItems="center" justifyContent="center" padding={8} width="100%">
    <img src={NoDataIcon} />
    <NoDataText>No Data</NoDataText>
  </Stack>
);
