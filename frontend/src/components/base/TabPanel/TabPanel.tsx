import { Box } from "@mui/material";
import { FC } from "react";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel: FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}