import Logo from "@assets/locker.svg";
import { Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { StyledButtonBase } from "./LogoButton.styles";

export const LogoButton = () => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <Stack alignContent="flex-start" alignItems="center">
      <StyledButtonBase onClick={handleLogoClick}>
        <img src={Logo} style={{ height: "100%" }} />
      </StyledButtonBase>
    </Stack>
  );
};
