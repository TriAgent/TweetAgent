import { AppBar, Container, Toolbar, styled } from "@mui/material";

import { BACKGROUND_PRIMARY_COLOR } from "../../constants";

const normalAppBarHeight = 0; //72;
const smallAppBarHeight = 55;

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: BACKGROUND_PRIMARY_COLOR,
  height: `${normalAppBarHeight}px`,
  boxShadow: "0px 1px 0px 0px rgba(190, 194, 218, 0.20)",
  [theme.breakpoints.down("sm")]: {
    height: `${smallAppBarHeight}px`,
  },
}));

export const SearchWrapper = styled("div")({
  display: "flex",
  flexGrow: 1,
});

export const MainContainerWrapper = styled("div")(({ theme }) => ({
  marginTop: `${normalAppBarHeight}px`,
  backgroundColor: BACKGROUND_PRIMARY_COLOR,
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  minHeight: `calc(100vh - ${normalAppBarHeight}px)`,
  [theme.breakpoints.down("sm")]: {
    marginTop: `${smallAppBarHeight}px`,
    minHeight: `calc(100vh - ${smallAppBarHeight}px)`,
  },
}));

export const MainContainer = styled("div")(({ theme }) => ({
  paddingTop: "50px",
  padding: 20,
  margin: "10px",
  [theme.breakpoints.down("sm")]: {
    paddingTop: "25px",
    marginBottom: "30px",
  },
}));

export const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: 10,
  height: `${normalAppBarHeight}px`,
  [theme.breakpoints.down("sm")]: {
    height: `${smallAppBarHeight}px`,
  },
}));

export const Footer = styled("div")({
  width: "100%",
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "flex-end",
  gap: "20px",
  paddingBottom: "87px",
});

export const Icon = styled("div")<{ iconUrl: string }>(({ iconUrl }) => ({
  height: "42px",
  width: "42px",
  backgroundSize: "42px",
  backgroundImage: `${iconUrl}`,
}));
