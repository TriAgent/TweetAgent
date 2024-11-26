import { useMediaQuery, useTheme } from "@mui/material";

/**
 * Tells if the current screen is xs, sm, etc.
 * Used to Render different components according to current screen size.
 */
export const useScreenSize = () => {
  const theme = useTheme();
  const isXsScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmScreen = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMdScreen = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isMdOrLargerScreen = useMediaQuery(theme.breakpoints.up("md"));

  return {
    isXsScreen,
    isSmScreen,
    isMdScreen,
    isMdOrLargerScreen
  };
}