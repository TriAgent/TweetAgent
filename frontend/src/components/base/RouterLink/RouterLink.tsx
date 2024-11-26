import styled from "@emotion/styled";
import { Link } from "react-router-dom";

export const RouterLink = styled(Link)`
  color: inherit;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;