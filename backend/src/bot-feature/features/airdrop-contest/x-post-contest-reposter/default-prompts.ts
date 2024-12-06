export const electBestPostForContest = `
Below is a list of several posts from twitter. Select the one that has the best chances to become popular on twitter, meaning with high number of like/rt/comments.
---------------- 
{posts}
`;

export const writePostQuoteContent = `
Below is a third party user tweet that we are going to retweet/quote from our twitter account. Write a very short text that we will use as quote message, to introduce the given user post. You can also give your opinion about it.
---------------- 
{post}
`;