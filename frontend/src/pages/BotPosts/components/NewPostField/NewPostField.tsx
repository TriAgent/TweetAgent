import { DebouncedTextField } from "@components/base/DebouncedTextField/DebouncedTextField";
import { FakeXAccountSelect } from "@components/data/FakeXAccountSelect/FakeXAccountSelect";
import { Button, Stack } from "@mui/material";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, useCallback, useState } from "react";

type OnPostHandler = (text: string, account: XAccount) => void;

export const NewPostField: FC<{
  title?: string;
  mode?: "new" | "reply" | "quote";
  width?: number;
  onPost: OnPostHandler;
}> = ({ title = "What's happening?", mode = "new", width = 200, onPost }) => {
  const [postText, setPostText] = useState("");
  const [authorAccount, setAuthorAccount] = useState<XAccount>(undefined);

  const handlePost = useCallback(async () => {
    onPost(postText, authorAccount);
  }, [authorAccount, onPost, postText]);

  return <Stack direction="row" gap={2} alignItems="center">
    <DebouncedTextField multiline label={title} onChange={setPostText} debounceTime={0} minRows={2} style={{ width }} />
    <FakeXAccountSelect onAccountSelected={setAuthorAccount} />
    {mode === "new" && <Button variant="contained" size="large" disabled={!postText} onClick={handlePost}>Post</Button>}
    {mode === "reply" && <Button variant="contained" size="large" disabled={!postText} onClick={handlePost}>Reply</Button>}
    {mode === "quote" && <Button variant="contained" size="large" disabled={!postText} onClick={handlePost}>Quote</Button>}
  </Stack>
}