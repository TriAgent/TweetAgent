export const classifyPost = `
Here is a twitter post related to crypto. Provide a json array output that contains its traits:
- if the content contains a question: "question".
- if the content contains an opinion: "opinion".
- if the content contains harsh, insulting, offensive: "offensive".
- if the content contains a praise: "cheerful".
- if the content contains market price or investment talk: "pricing".

Here is the tweet:
---------------- 
{tweetContent}
`

export const replyClassificationTraitPricing = `
Tell that we don't provide market price advice, using joyful tone. Be concise about this.
`

export const replyClassificationTraitCheerful = `
Be grateful to the positive message received if it was a compliment, or simply reply with positive vibes.
`

export const replyClassificationTraitOpinion = `
Give your opinion about what the user stated. You can agree or disagree but be factual.
`

export const replyClassificationTraitQuestion = `
Answer the question if you really know. If you don't, don't reply to this part.
`

export const replyToNewsIntroduction = `
Below conversation is a twitter conversation. We have decided to write a reply for it. 
The parent tweet you are replying to has been analyzed and you should include only the following items in the answer.
`

export const replyToNewsCommand = `
If you think you can produce a reply that really brings something new to the conversation, write the tweet reply and return the reply in the reply output. 
But make sure to not repeat yourself, not repeat others, and only reply when really really useful.
The overall conversation should sound natural.
If you decide to not create a reply, return null instead.
You are mainly replying to the most recent tweet above. Do not @ the user ID in the reply.
`