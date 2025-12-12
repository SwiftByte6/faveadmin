import { GoogleGenerativeAI } from "@google/generative-ai";

async function generateWithRetry(model, prompt, retries = 3, baseDelayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      const status = error?.status || error?.response?.status;

      // Try to respect server-provided retry hints
      let retryDelayMs = baseDelayMs * attempt; // exponential backoff by default
      try {
        // gRPC-style RetryInfo may be present
        const details = error?.errorDetails || error?.response?.errorDetails;
        const retryInfo = Array.isArray(details)
          ? details.find(d => (d["@type"] || "").includes("google.rpc.RetryInfo"))
          : null;
        if (retryInfo?.retryDelay) {
          // retryDelay like "33s" or { seconds: 33 }
          const s = typeof retryInfo.retryDelay === "string"
            ? parseFloat(retryInfo.retryDelay.replace("s", ""))
            : (retryInfo.retryDelay.seconds || 0);
          if (!Number.isNaN(s) && s > 0) retryDelayMs = Math.min(30000, s * 1000);
        }
      } catch {}

      // Also check HTTP Retry-After header if present
      try {
        const hdr = error?.response?.headers?.["retry-after"] || error?.response?.headers?.["Retry-After"];
        const s = hdr ? parseFloat(String(hdr)) : NaN;
        if (!Number.isNaN(s) && s > 0) retryDelayMs = Math.min(30000, s * 1000);
      } catch {}

      // Retry on rate limit or overload if attempts remain
      if ((status === 429 || status === 503) && attempt < retries) {
        console.warn(`Rate limited/overloaded (status ${status}). Retry ${attempt}/${retries} after ${retryDelayMs}ms...`);
        await new Promise(res => setTimeout(res, retryDelayMs));
        continue;
      }

      // No retry or out of attempts
      throw error;
    }
  }
}

export async function POST(request) {
  try {
    const { rawDescription } = await request.json();

    if (!rawDescription || typeof rawDescription !== "string") {
      return Response.json(
        { error: "Invalid input: rawDescription must be a non-empty string." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server configuration error: GEMINI_API_KEY missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use a valid model identifier supported by the SDK
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Generate a product title and SEO-friendly product description for a women's fashion e-commerce website.

Raw Description:
${rawDescription}

Return ONLY a JSON:
{
  "title": "Generated Product Title",
  "description": "At least 50-word SEO description."
}
`;

    // --- Retry Logic Here ---
    const result = await generateWithRetry(model, prompt);

    const text = await result.response.text();
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return Response.json(
        {
          error: "Failed to parse generated content.",
          raw: text,
          cleaned,
        },
        { status: 500 }
      );
    }

    return Response.json(parsed, { status: 200 });

  } catch (error) {
    const status = error?.status || error?.response?.status;
    const isRateLimited = status === 429;
    const isOverloaded = status === 503;
    const isModelNotFound = status === 404;

    // Surface rate limit/overload to client for better UX
    if (isRateLimited) {
      return Response.json(
        { error: "Rate limited by model. Please retry shortly." },
        { status: 429 }
      );
    }
    if (isOverloaded) {
      return Response.json(
        { error: "Model is temporarily overloaded. Please retry." },
        { status: 503 }
      );
    }

    if (isModelNotFound) {
      return Response.json(
        { error: "Model not found/unsupported. Please use a valid Gemini model (e.g., gemini-1.5-flash-latest or gemini-1.5-pro-latest)." },
        { status: 500 }
      );
    }

    console.error("Fatal API Error:", error);
    return Response.json(
      { error: "Failed to generate content." },
      { status: 500 }
    );
  }
}
