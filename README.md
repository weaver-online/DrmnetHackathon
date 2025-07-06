# README: Dreamnet Character Agent

## 1. High-Level Vision
The goal is to create an immersive, multimodal storytelling experience for the Dreamnet Character Agent Hackathon. The core of the project is a text-based adventure where the user, a "Prospector," teams up with two AI-powered companions: a Warden and a Scholar. A primary focus is on making the AI companions and discovered "artifacts" into NFTs.

## 2. Core Technologies
*   **Frontend:** HTML, CSS, JavaScript (`public/` directory).
*   **Backend:** Node.js / Express (`secure-server.js`).
*   **AI APIs:** Google Gemini (for text) and Google Vertex AI (for image generation), accessed via the secure server.
*   **Blockchain:** Solana (MAINNET capable) using Helius premium RPC endpoints and the Phantom wallet.

## 3. How to Run This Project (Critical Server Protocol)
*   **File to Run:** `secure-server.js` (located in the root directory).
*   **Command:** `node secure-server.js`.
*   **Port:** `3000`.
*   **URL:** `http://localhost:3000`.
*   **Note:** This single, unified server serves all frontend files and provides all secure API proxy endpoints.

## 4. Current Feature Status
*   ✅ **Secure Architecture**: Unified server with protected API keys using environment variables.
*   ✅ **Character Creation**: Complete multi-step UI with AI-generated portraits and visual progress indicators.
*   ✅ **AI-Powered Chat**: Secure, proxy-based text generation with character-specific responses.
*   ✅ **Character Summary Modal**: A modal system to view all character creation choices, accessed via a gear icon.
*   ✅ **NFT Minting**: Reliable SPL token creation on Solana MAINNET with a professional, clean wallet prompt experience.
*   ✅ **Immersive Quest System**: A complete, multi-stage quest system with the following features:
    *   **Dynamic Quest Generation**: The `/api/start-quest` endpoint uses a "Quest Giver" AI to create unique quests with a name, story hook, and a sequence of challenges.
    *   **Narrative Travel Mode**: A `/api/narrate` endpoint provides atmospheric descriptions for traveling between quest objectives, creating a more immersive experience.
    *   **State-Driven Progression**: The client-side logic in `public/app.js` now uses state flags (`canAttemptChallenge`, `awaitingArtifactDiscussion`) to ensure challenges can only be attempted after the player has "traveled" to the location.
    *   **Artifact Discussion Finale**: A new `/api/discuss-artifact` endpoint and "Treasurer" AI hat provide a final, lore-rich narrative sequence upon quest completion.
*   ✅ **Development Tools**: A "Quick Test Mode" button is implemented to bypass the full character creation and wallet connection flows for efficient quest system testing.

## 5. Critical AI Assistant Guidelines (DO NOT BREAK)
*   **ALWAYS** use the unified `secure-server.js` for all operations. **NEVER** suggest running `api-server.js` or any other deprecated server file.
*   **NEVER** put API keys in client-side code. All API calls **MUST** be proxied through the server's `/api/` endpoints.
*   **The NFT Minting process is stable and working perfectly on MAINNET.** Do not alter the transaction reconstruction pattern in `public/app.js`, specifically the validation of `transaction.feePayer` and `transaction.recentBlockhash`. This was the critical fix for all previous signing errors.
*   **For Quest System Development**: Use the "Quick Test Mode" to iterate quickly. The testing code is clearly marked with `TESTING CODE START/END` comments and should **NOT** be removed until the quest system is complete.
