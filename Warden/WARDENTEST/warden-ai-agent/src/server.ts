import express, { Request, Response } from "express";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.SERVER_PORT || 4000;

/**
 * Webhook endpoint that handles incoming requests, verifies signatures, and returns appropriate responses for the Warden AI.
 * @param req - Express request object containing headers and body
 * @param res - Express response object for sending back responses
 * @returns JSON response with transformed data and Warden-specific text based on event type
 */
app.post("/", (req: Request, res: Response) => {
  const sigHeader = req.headers["x-signature"];
  const data = req.body;
  console.log('Webhook request received for Warden AI - data:', data);
  const webhookSecret = process.env.WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Server Error: Webhook secret is not set in environment variables.");
    return res.status(500).send("Webhook secret is not set");
  }

  const isValid = verifySignature(data, sigHeader, webhookSecret);
  if (!isValid) return res.status(403).send("Invalid signature");

  // Warden-specific response logic
  // Default Warden traits (can be overridden by request data if provided)
  let wardenPersonality = "cautious_reserved";
  let wardenName = "Unknown Warden";
  
  // Check if request contains Warden data to customize response
  if (data.wardenData && data.wardenData.personality) {
    wardenPersonality = data.wardenData.personality.conversationStyle || "cautious_reserved";
    wardenName = data.wardenData.name || "Unknown Warden";
  }
  
  // Customize response based on Warden's personality
  let responseText = "I stand ready to protect and serve.";
  if (data.eventType == "request") {
    if (wardenPersonality.includes("confident_outgoing")) {
      responseText = "Hail, friend! What do you need of me today?";
    } else if (wardenPersonality.includes("cautious_reserved")) {
      responseText = "Greetings... How may I assist you, if I must?";
    } else if (wardenPersonality.includes("blunt_direct")) {
      responseText = "Speak quickly. What do you want?";
    }
  } else {
    if (wardenPersonality.includes("confident_outgoing")) {
      responseText = "I’m at your side, ready for any challenge!";
    } else if (wardenPersonality.includes("cautious_reserved")) {
      responseText = "I’ll guard you, though I tread warily.";
    } else if (wardenPersonality.includes("blunt_direct")) {
      responseText = "I’m here. Let’s get this done.";
    }
  }
  
  return res.status(200).json({
    ...data,
    text: responseText,
    saveModified: data.eventType == "request" ? true : false, // Pass `saveModified` as `true` or `false` depending on whether to save the modified text to chat history.
    wardenName: wardenName
  });
});

/**
 * Verifies the signature of the incoming webhook request using HMAC SHA-256.
 * @param rawBody - The raw body of the request to verify
 * @param signature - The signature from the request headers to verify against
 * @param secret - The webhook secret used for signature verification
 * @returns boolean indicating whether the signature is valid
 */
function verifySignature(
  rawBody: string,
  signature: any,
  secret: string
): boolean {
  try {
    const cleanSignature = signature?.trim();
    if (!cleanSignature) return false;

    const hmac = crypto.createHmac("sha256", secret);
    const rawBodyStr =
      typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    hmac.update(rawBodyStr);
    const expected = hmac.digest("base64");

    return crypto.timingSafeEqual(
      Buffer.from(cleanSignature),
      Buffer.from(expected)
    );
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Starts the Express server and handles any startup errors
 */
app
  .listen(PORT, () => {
    console.log(`🚀 Warden AI Server is running on http://localhost:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
  })
  .on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use`);
    } else {
      console.error("❌ Warden AI Server failed to start:", error.message);
    }
    process.exit(1);
  });
