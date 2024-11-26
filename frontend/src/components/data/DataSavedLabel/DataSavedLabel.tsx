import { Stack } from "@mui/material";
import { dataSaved$ } from "@services/ui-ux/ui.service";
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useEffect, useState } from "react";
import { UpdateLabel } from "./DataSavedLabel.styles";

export const DataSavedLabel: FC<{
  width: number | string;
}> = ({ width }) => {
  const [label, setLabel] = useState('');

  useEffect(() => {
    let timer: any;

    const subscription = dataSaved$.subscribe(() => {
      clearTimeout(timer);

      setLabel('Saved');

      // Hide the label after a while
      timer = setTimeout(() => setLabel(''), 1000);

      return () => clearTimeout(timer);
    });

    // Cleanup subscription on component unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Stack width={width}>
      <AnimatePresence>
        {label && <motion.span
          key={label}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <UpdateLabel>{label}</UpdateLabel>
        </motion.span>}
      </AnimatePresence>
    </Stack>
  );
};