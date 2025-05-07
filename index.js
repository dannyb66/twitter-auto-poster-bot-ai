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
  const prompt =
    "Generate a tweet (plain text, under 280 characters, emojis allowed) with a unique, practical tip, trick, or insight on using AI tools effectively in everyday life. Focus on recent AI trends, tools, or updates. Keep it clear, non-vague, and helpful for everyone.";

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [prompt],
    config: {
      maxOutputTokens: 400,
      tools: [{ googleSearch: {} }],
    },
  });

  const tweet = response.text;
  console.log("Tweet:", tweet);

  // Optional: Display grounding information
  const grounded = response.candidates?.[0]?.groundingMetadata?.searchEntryPoint?.renderedContent;
  if (grounded) {
    console.log("\n🔍 Grounding source info:\n", grounded);
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