import { enqueueSnackbar } from "notistack";

export const waitForSignToast = () => {
  return enqueueSnackbar({
    variant: "info",
    message: "Please finalize the transaction in your wallet",
    autoHideDuration: null,
  });
};
