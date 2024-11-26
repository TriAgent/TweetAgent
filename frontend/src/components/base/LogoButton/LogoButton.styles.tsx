import { ButtonBase, Typography, styled } from "@mui/material";

export const StyledButtonBase = styled(ButtonBase)(({ theme }) => ({
  height: "35px",
  /* backgroundImage: `url(${LogoSVG})`,
  backgroundRepeat: "no-repeat",
  backgroundOrigin: "content-box", */
  [theme.breakpoints.down("sm")]: {
    height: "20px",
    backgroundSize: "20px",
  },
}));

export const LogoText = styled(Typography)(({ theme }) => ({
  //marginTop: "-6px",
  opacity: 0.5,
  [theme.breakpoints.down("sm")]: {
    textAlign: "left",
    fontSize: "12px",
    fontWeight: "500",
  },
  [theme.breakpoints.up("sm")]: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "300",
  },
}));
