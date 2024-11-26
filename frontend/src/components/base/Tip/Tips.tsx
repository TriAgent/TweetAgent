import { ErrorOutline } from "@mui/icons-material";
import {
  ClickAwayListener,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, ReactNode, useState } from "react";

/**
 * Shows a question mark icon.
 * When hovered, that icon shows a tooltip.
 */
export const IconTip: FC<{
  title?: string;
  content: string;
}> = ({ title, content }) => {
  const theme = useTheme();
  const matchSmallMedia = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false)
  };

  const handleTooltipOpen = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    e.stopPropagation();
    setOpen(true);
  };

  const TitleEl: ReactNode = (
    <>
      {title && <Typography fontWeight={600}>{title}</Typography>}
      <Typography>{content}</Typography>
    </>
  );

  return matchSmallMedia ? (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip placement="top" open={open} arrow
        PopperProps={{
          disablePortal: true,
        }}
        title={TitleEl}>
        <ErrorOutline onClick={handleTooltipOpen} />
      </Tooltip>
    </ClickAwayListener>
  ) : (
    <Tooltip placement="top" title={TitleEl} arrow>
      <ErrorOutline />
    </Tooltip>
  );
}
