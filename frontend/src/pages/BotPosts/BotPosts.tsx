import { PostWriterModalProvider } from "@components/modals/PostWriterModal/PostWriterModal";
import { ArrowBack } from "@mui/icons-material";
import { Divider, IconButton, List, ListItem, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { XPost } from "@services/posts/model/x-post";
import { onPostUpdate$ } from "@services/posts/posts.service";
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

  // React on new post or post content update
  useEffect(() => {
    const sub = onPostUpdate$.subscribe(newPost => {
      // Only handle posts for current bot
      if (newPost.botId !== activeBot.id)
        return;

      if (rootPost?.id === newPost.id) {
        // Upcoming post is an update for the root post
        setRootPost(newPost);
      }
      else {
        if (rootPost && newPost.parentPostId !== rootPost.postId) {
          // This is not for this page, as we are showing a root post thread but 
          // the upcoming post has a different parent post id. Do nothing
        }
        else {
          // Same root post, so we can upsert the upcoming post to the current posts list
          const newPosts: XPost[] = [
            ...posts?.filter(p => p.id !== newPost.id),
            newPost
          ];
          newPosts.sort((p1, p2) => p2.createdAt.getTime() - p1.createdAt.getTime());
          setPosts(newPosts);
        }
      }
    });

    return () => sub?.unsubscribe();
  })

  return (
    <>
      <PostWriterModalProvider>
        <Stack direction="column" style={{ width: 600 }}>
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
