import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { PostWriterModalProvider } from "@components/modals/PostWriterModal/PostWriterModal";
import { ArrowBack } from "@mui/icons-material";
import { Divider, IconButton, List, ListItem, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { XPost } from "@services/posts/model/x-post";
import { XAccount } from "@x-ai-wallet-bot/common";
import { FC, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NewPostField } from "./components/NewPostField/NewPostField";
import { Post } from "./components/Post/Post";

const BotPosts: FC = () => {
  const activeBot = useActiveBot();
  const [rootPost, setRootPost] = useState<XPost>();
  const [posts, setPosts] = useState<XPost[]>();
  const { postId } = useParams();

  const handleCreatePost = useCallback(async (text: string, authorAccount: XAccount) => {
    const createdPost = await activeBot.createPost(text, authorAccount);
    console.log("Post created:", createdPost)
  }, [activeBot]);

  useEffect(() => {
    activeBot?.fetchPosts(postId).then(thread => {
      setRootPost(thread?.root);
      setPosts(thread?.posts);
    });
  }, [activeBot, postId]);

  useEffect(() => {
    const sub = activeBot?.onNewPost$.subscribe(post => {
      if (post.parentPostId == rootPost?.postId)
        setPosts([post, ...posts]);
    });

    return () => sub?.unsubscribe();
  }, [activeBot, posts, rootPost]);

  return (
    <>
      <PostWriterModalProvider>
        <Stack direction="column" style={{ width: 600 }}>
          <Stack direction="row" alignItems="center" gap={2}>
            <PageTitle>Posts</PageTitle>
          </Stack>
          {rootPost &&
            <Stack gap={2} alignItems="flex-start">
              <IconButton onClick={() => window.history.back()}>
                <ArrowBack />
              </IconButton>
              <Post post={rootPost} />
            </Stack>
          }
          {
            !rootPost &&
            <NewPostField width={500} onPost={handleCreatePost} />
          }
          <List>
            {posts?.map((post, i) => <Stack key={i}>
              <ListItem style={{ marginBottom: 10, marginTop: 10 }}>
                <Post post={post} />
              </ListItem>
              <Divider />
            </Stack>
            )}
          </List>
        </Stack>
      </PostWriterModalProvider>
    </>
  );
};

export default BotPosts;
