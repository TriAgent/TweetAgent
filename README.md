# X AI Wallet Bot

## Airdrop contest user guide

### Rules

- Regular X users can get ELA token airdrops regularly, by finding hot X posts (related to crypto space) and recommending them to the bot for the airdrop contest. 
- The bot decides which posts are best and every hour, it quotes one of those contest posts.
- The user who mentioned us to make the post join the contest should then do his best to promot our bot quote post as much as he can (RT, like, comment) as the more social interaction on the post, the higher score, the more tokens compared to what other competitors of the same day receive (the amount of tokens per airdrop is fixed).
- After 1 week, the bot takes all the quote posts he published 7 days ago and no later than 8 days ago (24h window) and takes a snapshot of the social stats for each post.
- The bot then dispatches a fixed per-day amount of tokens to users, proportionally to their social score.
- Both the original post author, and the user who mentioned our bot to make the post join the contest, are eligible for the airdrop.
- In case it's the first time this user joins the contest, he will be asked to provide his wallet address as a reply post, so the bot knows where to send tokens. If no address is provided at the time of airdrop, tokens are "lost" and remain in the bot's wallet for later use.
- After tokens have been sent, users are made aware of the transaction through a X reply from the bot.

### X user usage

- Find a good crypto post
- Reply to that post, mention our bot and ask it to make the post enter the contest. 
  - eg: in reply to bloomberg's post saying "Elastos will moon soon", reply: "@thebot please add this post to the contest".
- *The bot lets user know if the post is elected for the contest.*
- *The bot creates a quote post and lets user know the bot post is ready to share.*
- Now, find ways to promote the bot's post to get as much social interaction as possible.

## Development setup

- From the common/ folder: 
  - `yarn link`
  - `yarn build`
- From backend/ and frontend/ folders: `yarn link x-ai-wallet-bot/common`
- Then check READMEs inside backend/ and frontend/