import { CircularProgress, styled } from "@mui/material";

const DivWithBackground = styled("div")({
  width: "100%",
  height: "50vh",
  display: "grid",
  placeItems: "center",
  flexGrow: 1,
});

export const Loading = () => (
  <DivWithBackground>
    <CircularProgress />
  </DivWithBackground>
);
