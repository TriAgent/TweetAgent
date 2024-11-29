import { FormControl, MenuItem, Select } from "@mui/material";
import { fakeAccounts$ } from "@services/accounts/accounts.service";
import { useBehaviorSubject } from "@services/ui-ux/hooks/useBehaviorSubject";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, useCallback, useEffect, useState } from "react";

export const FakeXAccountSelect: FC<{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onAccountSelected: (account: XAccount) => void;
}> = ({ onAccountSelected }) => {
  const [selectedAccount, setSelectedAccount] = useState<XAccount>(undefined);
  const fakeAccounts = useBehaviorSubject(fakeAccounts$);

  const accountById = useCallback((id: string) => fakeAccounts?.find(account => account.userId === id), [fakeAccounts]);

  const handleAccountChange = useCallback((userId: string) => {
    const account = accountById(userId);

    setSelectedAccount(account);
    onAccountSelected(account);
  }, [accountById, onAccountSelected]);

  // Select first user by default
  useEffect(() => {
    if (fakeAccounts && !selectedAccount)
      handleAccountChange(fakeAccounts[0].userId);
  }, [fakeAccounts, handleAccountChange, selectedAccount]);

  return (
    <FormControl sx={{ minWidth: 100, height: "100%", margin: 0, mt: "2px" }} size="small">
      <Select displayEmpty value={selectedAccount?.userId || ""} onChange={e => handleAccountChange(e.target.value)} sx={{ height: 56 }} renderValue={(selected) => {
        return accountById(selected)?.userName || ""
      }}>
        {
          fakeAccounts?.map((account, i) =>
            <MenuItem value={account.userId} key={i}>
              {account.userName}
            </MenuItem>
          )
        }
      </Select>
    </FormControl>
  )
}

