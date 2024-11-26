import { ArrowBack } from "@mui/icons-material";
import { Breadcrumbs, Stack, Typography, styled } from "@mui/material";
import { FC, ReactNode, isValidElement } from "react";
import { useNavigate } from "react-router-dom";

import { TEXT_PRIMARY_COLOR } from "../../../constants";

export const BreadcrumbsTitle = styled(Typography)(({ theme }) => ({
  color: TEXT_PRIMARY_COLOR,
  fontSize: "28px",
  fontStyle: "italic",
  fontWeight: 600,
  lineHeight: "143%",
  letterSpacing: "0.17px",
  [theme.breakpoints.down("md")]: {
    fontSize: "20px",
  },
}));

export const BreadcrumbsWithGoBack: FC<{
  href: string;
  category: ReactNode;
  children?: ReactNode;
}> = (props) => {
  const { href, children, category, ...rest } = props;
  const navigate = useNavigate();

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      {...rest}
      sx={{
        display: "flex",
        color: TEXT_PRIMARY_COLOR,
        height: {
          xs: "fit-content",
          sm: "64px",
        },
        fontSize: {
          xs: "20px",
          sm: "28px",
        },
        fontStyle: "normal",
        fontWeight: 700,
        lineHeight: "143%",
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        gap="10px"
        onClick={() => navigate(href)}
        sx={{ color: "inherit", textDecoration: "none" }}
      >
        <ArrowBack
          sx={{
            width: "24px",
            height: "24px",
            color: TEXT_PRIMARY_COLOR,
          }}
        />
        {isValidElement(category) ? (
          category
        ) : (
          <Typography
            sx={{
              fontSize: {
                xs: "20px",
                sm: "28px",
              },
            }}
            fontWeight="700"
          >
            {category}
          </Typography>
        )}
      </Stack>
      {children ? (
        <Typography
          sx={{
            fontSize: {
              xs: "20px",
              sm: "28px",
            },
          }}
          fontWeight="700"
        >
          {children}
        </Typography>
      ) : null}
    </Breadcrumbs>
  );
};
