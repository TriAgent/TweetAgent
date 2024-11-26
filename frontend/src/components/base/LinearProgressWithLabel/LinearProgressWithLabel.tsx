import { Box, TypographyProps } from "@mui/material";

import {
  StyledLinearProgress,
  StyledTypography,
} from "./LinearProgressWithLabel.styles";

export const LinearProgressWithLabel = (
  props: TypographyProps & { value: number }
) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <StyledLinearProgress
          variant="determinate"
          color="primary"
          value={props.value}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <StyledTypography {...props}>
          {`${props.value.toFixed(2)}%`}
        </StyledTypography>
      </Box>
    </Box>
  );
};
