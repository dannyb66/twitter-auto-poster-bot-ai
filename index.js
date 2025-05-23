import { GoogleGenAI } from "@google/genai";
import { TwitterApi } from "twitter-api-v2";
import SECRETS from "./SECRETS.js"; // Ensure this exports your keys properly

const twitterClient = new TwitterApi({
  appKey: SECRETS.APP_KEY,
  appSecret: SECRETS.APP_SECRET,
  accessToken: SECRETS.ACCESS_TOKEN,
  accessSecret: SECRETS.ACCESS_SECRET,
});

const ai = new GoogleGenAI({ apiKey: SECRETS.GEMINI_API_KEY });

async function run() {
  const tips_prompt =
    "Generate a tweet (plain text, under 280 characters, emojis allowed) with a unique, practical tip, trick, or insight on using AI tools effectively in everyday life. Focus on recent AI trends, unique tools, example tools, or updates. Keep it clear, non-vague, and helpful for everyone. Add atleast one tool website link that is helpful. Return only the output tweet without any text or code block formatting and without any pre or post tweet words. Just the tweet content like it should be on twitter. Start with the tweet directly, no need for acknowledgment of my prompt. Included viral trending hashtags. Always ensure the content is under 280 characters.";

  const news_prompt =
    "Generate a tweet (plain text, under 280 characters, emojis allowed) that highlights a trending news story in AI or tech. Briefly explain what happened and include the general sentiment (positive, negative, or surprising). Include the website link of a related news article. Make it engaging and informative to hook readers. Use viral/trending hashtags to increase reach. Return only the tweet content without any text or code block formatting and without any pre or post tweet words. Just the tweet like it should appear on Twitter. Start the tweet directly, no acknowledgments or preamble about what will be returned. Just the tweet text only. Ensure the content is under 280 characters.";

  // Randomly pick one of the prompts
  const selectedPrompt = Math.random() < 0.2 ? tips_prompt : news_prompt;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [selectedPrompt],
    config: {
      maxOutputTokens: 100,
      tools: [{ googleSearch: {} }],
    },
  });

  const tweet = response.text;
  console.log("Tweet:", tweet);

  // Optional: Display grounding information
  const grounded = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent;
  if (grounded) {
    // console.log("\n🔍 Grounding source info:\n", grounded);
  }

  await sendTweet(tweet);
}

async function sendTweet(text) {
  try {
    await twitterClient.v2.tweet(text);
    console.log("✅ Tweet sent successfully!");
  } catch (err) {
    console.error("❌ Tweet failed:", err);
  }
}

run();
