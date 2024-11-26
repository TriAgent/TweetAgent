import { enqueueSnackbar } from "notistack";

export const errorToast = (message: string) => {
  return enqueueSnackbar({ variant: "error", message, autoHideDuration: 3000 });
};
