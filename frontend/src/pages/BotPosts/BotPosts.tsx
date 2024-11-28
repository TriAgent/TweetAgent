import { PageTitle } from "@components/base/PageTitle/PageTitle";
import { ArrowBack } from "@mui/icons-material";
import { IconButton, List, ListItem, Stack } from "@mui/material";
import { useActiveBot } from "@services/bots/hooks/useActiveBot";
import { XPost } from "@services/posts/model/x-post";
import { FC, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NewPostField } from "./components/NewPostField/NewPostField";
import { Post } from "./components/Post/Post";

const BotPosts: FC = () => {
  const activeBot = useActiveBot();
  const [rootPost, setRootPost] = useState<XPost>();
  const [posts, setPosts] = useState<XPost[]>();
  const { postId } = useParams();

  useEffect(() => {
    activeBot?.fetchPosts(postId).then(thread => {
      setRootPost(thread?.root);
      setPosts(thread?.posts);
    });
  }, [activeBot, postId]);

  useEffect(() => {
    const sub = activeBot?.onNewPost$.subscribe(post => {
      console.log("new post:", post);
      if (post.parentPostId == rootPost?.postId)
        setPosts([post, ...posts]);
    });

    return () => sub?.unsubscribe();
  }, [activeBot, posts, rootPost]);

  return (
    <>
      <Stack direction="column">
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
          <NewPostField />
        }
        <List>
          {posts?.map((post, i) => <ListItem key={i}>
            <Post post={post} />
          </ListItem>)}
        </List>
      </Stack>
    </>
  );
};

export default BotPosts;
