import { Comment, Repeat } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { XPost } from "@services/posts/model/x-post";
import { formatDate } from "@utils/dates";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { HeaderSecondaryLabel, HeaderUserNameLabel, PostTextContainer } from "./Post.styles";

export const Post: FC<{
  post: XPost;
}> = ({ post }) => {
  const navigate = useNavigate();

  const handlePostClicked = useCallback((post: XPost) => {
    navigate(`/bot/posts/${post.id}`);
  }, [navigate]);

  return <Stack direction="column" gap={0}>
    <Stack direction="row" gap={2}>
      <HeaderUserNameLabel>{post.xAccount.userName}</HeaderUserNameLabel> <HeaderSecondaryLabel>@{post.xAccount.userScreenName}</HeaderSecondaryLabel> <HeaderSecondaryLabel>{formatDate(post.publishedAt)}</HeaderSecondaryLabel>
    </Stack>
    <PostTextContainer onClick={() => handlePostClicked(post)}>{post.text}</PostTextContainer>

    {/* Action buttons */}
    <Stack alignItems="flex-start" direction="row">
      <IconButton>
        <Comment />
      </IconButton>
      <IconButton>
        <Repeat />
      </IconButton>
    </Stack>
  </Stack>
}