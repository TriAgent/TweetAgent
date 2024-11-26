import { Sync } from "@mui/icons-material";
import { IconButton, Stack, StackProps, alpha, styled } from "@mui/material";
import { FC, ReactNode, useCallback, useState } from "react";

import { TEXT_SECONDARY_COLOR } from "../../../constants";

const StyledRefreshWrapper = styled(Stack)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const StyledSyncIcon = styled(Sync)(({ theme }) => ({
  width: "24px",
  height: "24px",
  color: alpha(TEXT_SECONDARY_COLOR, 0.54),
  [theme.breakpoints.down("sm")]: {
    width: "16px",
    height: "16px",
  },
}));

const styles = `
  @keyframes spin: {
    "0%": {
      transform: "rotate(360deg)"
    },
    "100%": {
      transform: "rotate(0deg)"
    }
  }

  .rotateAni {
    animation: spin 0.2s ease-out both;
  }
`;

export const Refresh: FC<
  { children?: ReactNode; onRefresh: Function } & StackProps
> = (props) => {
  const { children, onRefresh, ...rest } = props;
  const [spin, setSpin] = useState(false);

  const refresh = useCallback(() => {
    setSpin(true);
    onRefresh();
    setTimeout(() => {
      setSpin(false);
    }, 1000);
  }, [onRefresh]);

  return (
    <StyledRefreshWrapper
      direction="row"
      alignItems="center"
      spacing="5px"
      {...rest}
    >
      <style>{styles}</style>
      {children}
      <IconButton onClick={refresh} sx={{ marginLeft: 0, padding: 0 }}>
        <StyledSyncIcon className={spin ? "rotateAni" : ""} />
      </IconButton>
    </StyledRefreshWrapper>
  );
};
