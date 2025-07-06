# README: Dreamnet Character Agent

## 1. High-Level Vision
The goal is to create an immersive, multimodal storytelling experience for the Dreamnet Character Agent Hackathon. The core of the project is a text-based adventure where the user, a "Prospector," teams up with two AI-powered companions: a Warden and a Scholar. A primary focus is on making the AI companions and discovered "artifacts" into NFTs.

## 2. Core Technologies
*   **Frontend:** HTML, CSS, JavaScript (`public/` directory).
*   **Backend:** Node.js / Express (`secure-server.js`).
*   **AI APIs:** Google Gemini (for text) and Google Vertex AI (for image generation), accessed via the secure server.
*   **Blockchain:** Solana (MAINNET capable) using Helius premium RPC endpoints and the Phantom wallet.

## 3. Hello! Welcome to my project for the Dreamnet Character Agent Hackathon

This was my first ever attempt at trying to create a project like this. As with anything in life, it didn't go exactly as planned. I am a brand new, novice level "developer", so I faced many technical challenges. I'm sure that will be evident to any experienced eyes that even look at my project. Or this folder. My grand plan was an immersive, AI driven story telling experience, with custom AI companions that you could mint as NFTs to live forever on the blockchain. Furthermore, the artifacts that are the main focus of the quests, were themselves meant to become NFTs with unique traits and properties. But, enough about hopes and dreams, lets look at what actually works.

- You are set in a fantasy world, living in a post magical apocolyptic event, the "Scouring", that has left the world drained and devoid of all magical essence.
- You are a "Prospector", an individual born with the unique innate ability to sense magical essence. This makes your role within the party vital as you and your party travel the lands in search of ancient magical artifacts, remnants of a bygone age.
- You are accompanied by two personalized, unique, AI controlled party members. You have a Warden, and a Scholar. You can customize their personality, appearance, and backstory, creating a brand new and flavorful companion every time.
- The Warden specializes in tasks that require brute strength, sheer force, and is in charge of keeping the party safe on your quest.
- The Scholar is your magical brainiac. They have devoted their life to the study of ancient magic and arcane mysteries. They are invaluable when dealing with a challenge of a magical nature.
- You embark on quests. Specifically tailored but AI generated, no two quests are the same. You will face challenges that require strength, and challenges that require a keen mind, as you search for artifacts.
- Every custom made Warden and Scholar is unique! They have different personalities, ways they treat you, and how they respond to your commands!
- In order to pass the challenges on a quest, you must direct the appropriate party member to handle the task at hand. You'll need to keep your companion's demeanor in mind, because an order that might work with one personality, might not work on another!
- At the end of a successful quest, you recieve an artifact! Discuss your monutmental discovery with your companions to complete the quest, unlocking your ability to embark on another, completely new adventure!

## 4. Final Judge/Tester notes

- Admittedly, the AI is still quite finnicky. This was my first time ever using GitHub, making a repository, uploading a project, and deploying it to Vercel. And I did it all at the last minute (I was late actually).
- Sometimes during character creation, the AI will randomly just fail to create an image for one of your companions. Or, one of your companions will be unable to speak. I found that refreshing the page and just trying again fixed the issue.
- It is intended by design for the characters to respond differently to your commands based on their personality type. You can try to mix and match personality and backstory with each companion, to get unique and flavorful interactions and ways to solve the challenges. However, specifically with the "wise and patient" scholar type, they can be a little too patient, and not mind standing around talking about the problem, rather than solving it. I've smoothed out this issue to the point where hopefully you won't encounter it, but if need be, be very direct and say the exact name of the objective in a way that is "ordering" them to complete the task.
- At the end of a quest, you must discuss your artifact discovery with your companions to enable the ability to Start a New Quest. I realize this is pretty open ended. As long as your message refers to the item by name, or simply has the word "artifact" in it, it should complete the event and allow you to start a new quest.
- Because I had to disable real NFT minting functionality, I replaced the system with a "demo mint" fallback. However, upon clicking the mint button in the final, publicly deployed version, it seems like sometimes the demo mode works, and sometimes the user will receive some kind of red JSON error notification.
- I did all my development and testing using a Phantom wallet. Hopefully no issues will arise from simply signing with a different wallet, but if for some reason you encounter issues, please try with a phantom wallet if possible.
- I realize that I may have created something completely irrelevant to the hackathon. I did not follow any of the tracks, and didn't encorporate the Dreamnet foundation in my project at all. I'm not sure if that was an asbolute requirement, or just a sturcture to use if we wished. I basically went nuts and ended up with a game. Whatever the case, it was a great learning experience and I had a lot of fun making it. Thank you for reading, and hopefully, trying out my creation.
