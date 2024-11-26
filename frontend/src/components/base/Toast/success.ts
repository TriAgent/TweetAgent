import { enqueueSnackbar } from "notistack";

export const successToast = (message = "Done!") => {
  return enqueueSnackbar({ variant: "success", message, autoHideDuration: 3000 });
};
