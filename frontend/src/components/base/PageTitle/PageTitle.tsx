import { Typography, styled } from "@mui/material";
import { TEXT_PRIMARY_COLOR } from "src/constants";

export const PageTitle = styled(Typography)(({ theme }) => ({
  color: TEXT_PRIMARY_COLOR,
  fontSize: "32px",
  fontFamily: "Inter",
  fontWeight: 800,
  [theme.breakpoints.down("sm")]: {
    fontSize: "28px",
  },
}));