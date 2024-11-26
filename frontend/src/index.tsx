window.Buffer = window.Buffer || require("buffer").Buffer;

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import * as ReactDOM from "react-dom/client";
import { Routing } from "./routes/routing";
import theme from "./theme";

import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
TimeAgo.addDefaultLocale(en);

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement!);

root.render(
  <ThemeProvider theme={theme}>
    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
    <CssBaseline />
    <SnackbarProvider
      maxSnack={1}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={1000}
    >
      <Routing />
    </SnackbarProvider>
  </ThemeProvider>
);
