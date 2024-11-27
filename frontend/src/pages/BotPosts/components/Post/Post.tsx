import { Comment, Repeat } from "@mui/icons-material";
import { IconButton, Stack } from "@mui/material";
import { XPost } from "@services/posts/model/x-post";
import { formatDate } from "@utils/dates";
import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export const Post: FC<{
  post: XPost;
}> = ({ post }) => {
  const navigate = useNavigate();

  const handlePostClicked = useCallback((post: XPost) => {
    navigate(`/bot/posts/${post.id}`);
  }, [navigate]);

  return <Stack direction="column" gap={2}>
    <Stack direction="row">
      {post.xAccount.userName} @{post.xAccount.userScreenName} - {formatDate(post.publishedAt)}
    </Stack>
    <div onClick={() => handlePostClicked(post)} style={{ cursor: "pointer" }}>{post.text}</div>

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