import { NoData } from "@components/data/NoData";
import { Pagination, Stack } from "@mui/material";
import { Children, FC, ReactNode, isValidElement } from "react";
import { PAGINATION_OPTION } from "src/constants";

export const CardTableContainer: FC<{
  total: number;
  page: number;
  onPageChange: (p: number) => void;
  children: ReactNode;
}> = (props) => {
  const { total, page, children, onPageChange } = props;

  const validChildren = Children.map(children, (child) => {
    if (!isValidElement(child) /* || child.type !== CardTableItem */) {
      console.error("Invalid child component!"); //  Only CardTableItem is allowed.
      return null;
    }
    return child;
  });

  return (
    <Stack
      spacing="10px"
      direction="column"
      marginTop="20px"
      sx={{ display: { sm: "none", xs: "flex" } }}>
      {total === 0 && <NoData />}
      {validChildren}
      {total > 0 && (
        <Pagination
          page={page}
          count={Math.ceil(total / PAGINATION_OPTION.limit)}
          onChange={(_, index) => onPageChange(index)}
          shape="rounded"
          siblingCount={0}
          size="medium"
          sx={{ justifyContent: "center", fontSize: "12px" }}
        />
      )}
    </Stack>
  );
};
