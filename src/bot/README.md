# Bot

- We run a single bot but this bot has various features.
- Those features are launched through a scheduler to ensure things run in a specific order.
- Services that fetch posts are queued one after another to make sure the same posts are not duplicate/conflicting.

## X scheduler service
- gathers X posts from target accounts, or posts we are mentionned in
- those posts can be later used by several features: could be for post contest, to gather airdrop address, to summarize news, or for anything else
- also posts queues reply posts to X when necessary.

## Replier service
- for every unhandled posts that are not from us:
  - manually ask features in sequence to generate a post reply (internally they use post classification, routing, etc for themselves)
  - features return their reply part. In the end, the replier service can get reply part from multiple features, and we ask AI to make a combined final reply. Then the post gets created and queued by the replier service.

# Bot features

- crypto-news: 
  - fetches recent X posts from a specific list of accounts on X
  - categorizes posts as real news or not with AI
  - saves post into DB
- x-summary-writer:
  - AI generates news summary from time to time, based on third party users posts, and posts on X
- x-replier:
  - Monitors and replies to X users who mention the bot

## External services in use

- XPosts: database helper for posts coming/going from/to X.
- XAccounts: database helper to map X/cache user id and user screen names 