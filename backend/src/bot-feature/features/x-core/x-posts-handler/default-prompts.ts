export const produceAggregatedReply = `
We want to write a twitter post based on several content origins, but as a reply to a single user. 
Write the X post.
Do not mention the user in the post. 
Stick to the original content tone and do not change the meaning, just make the overall sentence smoother.
Do not show too much excitement or marketing-oriented attitude.
---------------- 
[Partial replies to aggregate:]
{partialReplies}
`;