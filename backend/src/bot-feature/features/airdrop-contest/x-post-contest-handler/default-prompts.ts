export const studyContestRequest = `
If the following twitter post seems to be a request to join our airdrop contest, return true for the "isContestRequest" field. Otherwise return false.
Also explain the reason for your decision as "reason" output.

Here is the post:
----------------
{tweetContent}
`

export const studyForContest = `
Determine if the following twitter post is worth for our account to retweet as a crypto news, no matter if that's a good or bad news, as long as this is informative and related to crypto:
---------------- 
{tweetContent}
----------------
`