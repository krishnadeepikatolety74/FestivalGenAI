import { generateImage } from "../server/_core/imageGeneration";

async function main() {
  console.log("Testing server/_core/imageGeneration...");
  try {
    const res = await generateImage({
      prompt: "Create a simple yellow light diya candle flame, vector style, white background"
    });
    console.log("Success! Image URL:", res.url);
  } catch (error) {
    console.error("Failed:", error);
  }
}

main();
