import { Stack } from "@mui/material";

const NotFound = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      component="section"
      sx={{
        p: 2,
        height: "100vh",
      }}
    >
      Page not found, or app crashed.
    </Stack>
  );
};

export default NotFound;
