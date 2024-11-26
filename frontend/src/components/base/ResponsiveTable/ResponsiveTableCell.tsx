import { TableCell, styled } from "@mui/material";

export const ResponsiveTableCell = styled(TableCell)(({ theme }) => ({
  padding: 8,
  [theme.breakpoints.down("md")]: {
    width: "100%",
    padding: 0
  }
}));
