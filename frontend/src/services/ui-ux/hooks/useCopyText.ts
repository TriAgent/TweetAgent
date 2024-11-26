import { useSnackbar } from "notistack";
import { useCallback } from "react";
import { useCopyToClipboard } from "react-use";

export const useCopyText = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [_, copyToClipboard] = useCopyToClipboard();

  const copyText = useCallback(async (text: string, successMessage?: string) => {
    copyToClipboard(text)
    enqueueSnackbar({
      variant: "success",
      message: successMessage || "Copied!"
    });
  }, [copyToClipboard, enqueueSnackbar]);
  return {
    copyText,
  };
};
