import { Stack, Typography } from "@mui/material";
import { fetchAccounts } from "@services/accounts/accounts.service";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, useEffect, useState } from "react";
import { AccountDetails } from "./components/AccountDetails/AccountDetails";

export const XAccounts: FC = () => {
  const [accounts, setAccounts] = useState<XAccount[]>();
  const [expandedAccordionId, setExpandedAccordionId] = useState<string>('');

  useEffect(() => {
    fetchAccounts().then(_accounts => {
      setAccounts(_accounts);
    })
  }, []);

  return (
    <Stack direction="column" alignItems="flex-start" >
      <Stack direction="column" mt={2} width="100%">
        {
          accounts?.map((account, i) => <AccountDetails
            key={i}
            account={account}
            expandedAccordionId={expandedAccordionId}
            onAccordionChange={isExpanded => setExpandedAccordionId(isExpanded && account.userId)} />)
        }
        {
          accounts && accounts.length === 0 &&
          <Typography>No account fetched yet.</Typography>
        }
      </Stack>
    </Stack>
  );
};

export default XAccounts;
