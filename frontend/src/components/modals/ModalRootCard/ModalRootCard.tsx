import { Card, styled } from "@mui/material";

export const ModalRootCard = styled(Card)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "700px",
  [theme.breakpoints.down("sm")]: {
    width: "95%",
  },
  display: "flex",
  flexDirection: "column",
  maxHeight: "95vh"
}));