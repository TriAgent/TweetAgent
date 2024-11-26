import { TableRow, styled } from "@mui/material";

export const ResponsiveTableRow = styled(TableRow)(({ theme }) => ({
  alignItems: "center",
  margin: "34px 20px",
  gap: 10,
  [theme.breakpoints.down("md")]: {
    display: "flex",
    flexDirection: "column",
    margin: 0,
    gap: 0,
    overflow: "hidden",
    marginBottom: 8
  }
}));