import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { FakeXAccountSelect } from "@components/data/FakeXAccountSelect/FakeXAccountSelect";
import { Button, Stack, Typography } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, useCallback, useRef, useState } from "react";

type OnPostHandler = (text: string, account: XAccount) => void;

export const NewPostField: FC<{
  title?: string;
  mode?: "new" | "reply" | "quote";
  width?: number;
  onPost: OnPostHandler;
}> = ({ title = "What's happening?", mode = "new", width = 200, onPost }) => {
  const activeBot = useActiveBot();
  const [postText, setPostText] = useState("");
  const [authorAccount, setAuthorAccount] = useState<XAccount>(undefined);
  const textFieldRef = useRef<any>();

  const handlePost = useCallback(async () => {
    if (postText)
      onPost(postText, authorAccount);
    if (textFieldRef.current)
      textFieldRef.current.clear();
  }, [authorAccount, onPost, postText]);

  return <Stack direction="row" gap={2} alignItems="center">
    <DebouncedTextField ref={textFieldRef} multiline label={title} onChange={setPostText} debounceTime={0} minRows={2} style={{ width }} />
    <FakeXAccountSelect onAccountSelected={setAuthorAccount} />
    {mode === "new" && <Button variant="contained" size="large" disabled={!postText} onClick={handlePost}>Post</Button>}
    {mode === "reply" && <Button variant="contained" size="large" disabled={!postText} onClick={handlePost}>Reply</Button>}
    {mode === "quote" && <Button variant="contained" size="large" disabled={!postText} onClick={handlePost}>Quote</Button>}
    <Stack>
      <Typography style={{ fontSize: 11, fontWeight: 600 }}>Bot name</Typography>
      <Typography style={{ fontSize: 11 }}>@{activeBot?.twitterUserScreenName}</Typography>
    </Stack>
  </Stack>
}