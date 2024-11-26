import { CircularProgress, InputBase, styled } from "@mui/material";

import { BACKGROUND_LIGHT_GRAY, TEXT_PRIMARY_COLOR } from "../../../constants";

export const Search = styled("div")({
  display: "flex",
  position: "relative",
  borderRadius: "8px",
  alignItems: "center",
  justifyItems: "center",
  border: "2px solid rgba(190, 194, 218, 0.30)",
  backgroundColor: BACKGROUND_LIGHT_GRAY,
  flexGrow: 1,
});

export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: TEXT_PRIMARY_COLOR,
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiInputBase-input": {
      padding: theme.spacing(0.5, 0.5, 0.5, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      height: "22px",
      fontSize: "12px",
    },
  },
}));

export const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const SearchLoader = styled(CircularProgress)(({ theme }) => ({
  margin: theme.spacing(0, 2)
}));
