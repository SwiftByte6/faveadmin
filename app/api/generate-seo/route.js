import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request) {
  const { rawDescription } = await request.json();

  // Initialize the Gemini API
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Craft a prompt to generate a product title and description
  const prompt = `Generate a product title and a SEO-friendly product description for an e-commerce website based on the following raw description. The product is for a women's fashion store. Do not use emojis.

Raw Description:
${rawDescription}

Output in the following JSON format:
{
  "title": "Generated Product Title",
  "description": "Generated product description which is SEO-friendly and at least 50 words."
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the JSON from the response
    try {
      // Remove Markdown code block indicators if present
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedData = JSON.parse(cleanedText);
      return Response.json(generatedData);
    } catch (e) {
      console.error("Error parsing Gemini response:", e);
      return Response.json({ error: "Failed to parse the generated content." }, { status: 500 });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return Response.json({ error: "Failed to generate content." }, { status: 500 });
  }
}
