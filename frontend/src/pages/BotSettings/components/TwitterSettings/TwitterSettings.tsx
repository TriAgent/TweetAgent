import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { Button, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { TwitterAuthenticationRequest } from "@x-ai-wallet-bot/common";
import { FC, useCallback, useState } from "react";

export const TwitterSettings: FC = () => {
  const activeBot = useActiveBot();
  const [authenticating, setAuthenticating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [awaitingPIN, setAwaitingPIN] = useState(false);
  const [PIN, setPIN] = useState("");
  const [twitterAuthRequest, setTwitterAuthRequest] = useState<TwitterAuthenticationRequest>();

  const handleTwitterAuth = useCallback(async () => {
    setAuthenticating(true);
    const authRequest = await activeBot.startTwitterAuth();
    setTwitterAuthRequest(authRequest);

    if (authRequest) {
      window.open(
        authRequest.url,
        'X Bot Authentication',
        `width=${600},height=${800},top=${200},left=${200}`
      );

      setAwaitingPIN(true);
    }

    setAuthenticating(false);
  }, [activeBot]);

  const handlePINChange = useCallback((value: string) => {
    setPIN(value);
  }, []);

  const handlePINConfirmation = useCallback(async () => {
    setConfirming(true);
    const authStatus = await activeBot.finalizeTwitterAuthWithPIN(twitterAuthRequest, PIN);
    console.log("authStatus", authStatus)
    setConfirming(false);
  }, [PIN, activeBot, twitterAuthRequest]);

  const handleCancellation = useCallback(() => {
    setAuthenticating(false);
    setAwaitingPIN(false);
  }, []);

  return <Stack direction="column" gap={2}>
    {/* Twitter account info */}
    <Stack direction="column" gap={1}>
      <div>ID: {activeBot.twitterUserId}</div>
      <div>User name: {activeBot.twitterUserName}</div>
      <div>Screen name: {activeBot.twitterUserScreenName}</div>
    </Stack>
    {
      !awaitingPIN &&
      <Button variant="contained" onClick={handleTwitterAuth} disabled={authenticating}>New authentication</Button>
    }
    {
      awaitingPIN &&
      <Stack direction="row" gap={2}>
        <DebouncedTextField label="PIN code" defaultValue="" onChange={handlePINChange} debounceTime={0} />
        <Button variant="contained" onClick={handlePINConfirmation} disabled={PIN.length === 0 || confirming}>Confirm</Button>
        <Button variant="outlined" onClick={handleCancellation} disabled={confirming}>Cancel</Button>
      </Stack>
    }
  </Stack>
}