// --- CONFIGURATION ---
const IMAGE_GENERATION_TIMEOUT = 30000; // 30 seconds
const AI_RESPONSE_TIMEOUT = 15000; // 15 seconds
const DEBOUNCE_DELAY = 300; // 300ms for input debouncing
const API_BASE_URL = '/api'; // Secure proxy endpoints

// --- UTILITY FUNCTIONS ---
const Utils = {
    // Debounce function for performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Enhanced error handling with user-friendly messages
    showError(message, duration = 5000) {
        const errorNotification = document.getElementById('error-notification');
        const errorMessage = errorNotification.querySelector('.error-message');
        const errorClose = errorNotification.querySelector('.error-close');
        
        errorMessage.textContent = message;
        errorNotification.classList.remove('hidden');
        
        // Auto-hide after duration
        const hideTimeout = setTimeout(() => {
            errorNotification.classList.add('hidden');
        }, duration);
        
        // Manual close handler
        const closeHandler = () => {
            errorNotification.classList.add('hidden');
            clearTimeout(hideTimeout);
            errorClose.removeEventListener('click', closeHandler);
        };
        
        errorClose.addEventListener('click', closeHandler);
    },

    // Success notification
    showSuccess(message, duration = 5000) {
        // Create success notification if it doesn't exist
        let successNotification = document.getElementById('success-notification');
        if (!successNotification) {
            successNotification = document.createElement('div');
            successNotification.id = 'success-notification';
            successNotification.className = 'notification success-notification hidden';
            successNotification.innerHTML = `
                <div class="notification-content">
                    <span class="success-message"></span>
                    <button class="notification-close success-close" aria-label="Close success message">×</button>
                </div>
            `;
            document.body.appendChild(successNotification);
        }
        
        const successMessage = successNotification.querySelector('.success-message');
        const successClose = successNotification.querySelector('.success-close');
        
        successMessage.innerHTML = message;
        successNotification.classList.remove('hidden');
        
        // Auto-hide after duration
        const hideTimeout = setTimeout(() => {
            successNotification.classList.add('hidden');
        }, duration);
        
        // Manual close handler
        const closeHandler = () => {
            successNotification.classList.add('hidden');
            clearTimeout(hideTimeout);
            successClose.removeEventListener('click', closeHandler);
        };
        
        successClose.addEventListener('click', closeHandler);
    },

    // Image preloading for better performance
    preloadImages(imageUrls) {
        return Promise.all(
            imageUrls.map(url => {
                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(url);
                    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                    img.src = url;
                });
            })
        );
    },

    // Single image preloading
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
            img.src = url;
        });
    },

    // Timeout wrapper for promises
    withTimeout(promise, timeoutMs, errorMessage = 'Operation timed out') {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
            )
        ]);
    },

    // Accessibility: Announce to screen readers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'visually-hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
};

// --- CHARACTER CREATION DATA ---
const creationFlow = [
    { type: 'Warden', question: 'Choose your Warden\'s Gender', key: 'gender', options: [ { id: 'Male', text: 'Male', img: 'images/gender_male.png' }, { id: 'Female', text: 'Female', img: 'images/gender_female.png' } ] },
    { type: 'Warden', question: 'What is their personality?', key: 'question1', options: [ { id: 'A', text: 'A confident and outgoing leader.', img: 'images/warden_personality_A_confident.png' }, { id: 'B', text: 'A cautious and reserved guardian.', img: 'images/warden_personality_B_cautious.png' }, { id: 'C', text: 'A blunt and direct realist.', img: 'images/warden_personality_C_blunt.png' } ] },
    { type: 'Warden', question: 'What is their appearance?', key: 'question2', options: [ { id: 'A', text: 'Striking, with regal features and golden hair.', img: 'images/warden_appearance_A_regal.png' }, { id: 'B', text: 'Dark-haired and weathered, with battle scars.', img: 'images/warden_appearance_B_weathered.png' }, { id: 'C', text: 'Imposing and covered in intricate tattoos.', img: 'images/warden_appearance_C_imposing.png' } ] },
    { type: 'Warden', question: 'What is their backstory?', key: 'question3', options: [ { id: 'A', text: 'From a proud and noble warrior family.', img: 'images/warden_backstory_A_noble.png' }, { id: 'B', text: 'A scarred survivor who has known great loss.', img: 'images/warden_backstory_B_survivor.png' }, { id: 'C', text: 'A bitter mercenary, loyal only to their coin and crew.', img: 'images/warden_backstory_C_mercenary.png' } ] },
    { type: 'Scholar', question: 'Choose your Scholar\'s Gender', key: 'gender', options: [ { id: 'Male', text: 'Male', img: 'images/gender_male.png' }, { id: 'Female', text: 'Female', img: 'images/gender_female.png' } ] },
    { type: 'Scholar', question: 'What is their personality?', key: 'question1', options: [ { id: 'A', text: 'Patient, empathetic, and speaks thoughtfully.', img: 'images/scholar_personality_A_patient.png' }, { id: 'B', text: 'A socially awkward but brilliant genius.', img: 'images/scholar_personality_B_genius.png' }, { id: 'C', text: 'Condescending, with an air of superiority.', img: 'images/scholar_personality_C_superior.png' } ] },
    { type: 'Scholar', question: 'What is their appearance?', key: 'question2', options: [ { id: 'A', text: 'A wise elder with kind eyes and simple robes.', img: 'images/scholar_appearance_A_elder.png' }, { id: 'B', text: 'A messy-haired prodigy with ink-stained fingers.', img: 'images/scholar_appearance_B_prodigy.png' }, { id: 'C', text: 'Sharp, angular features and immaculate clothing.', img: 'images/scholar_appearance_C_immaculate.png' } ] },
    { type: 'Scholar', question: 'What is their backstory?', key: 'question3', options: [ { id: 'A', text: 'A former mentor to a once-great leader.', img: 'images/scholar_backstory_A_mentor.png' }, { id: 'B', text: 'A prodigy, ostracized for their forbidden knowledge.', img: 'images/scholar_backstory_B_ostracized.png' }, { id: 'C', text: 'From a renowned family of theorists, sees their lineage as a mark of superiority.', img: 'images/scholar_backstory_C_lineage.png' } ] },
];

// Enhanced Application Initialization
function initializeApp() {
    try {
        // Set up global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            Utils.showError('An unexpected error occurred. Please refresh the page if problems persist.');
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            Utils.showError('An unexpected error occurred. Please refresh the page if problems persist.');
        });
        
        // Application is now using secure proxy - no client-side API key needed
        
        // Set up accessibility announcements
        Utils.announceToScreenReader('Dreamnet Character Agent application loaded. Use tab to navigate between elements.');
        
        // Focus the first interactive element
        const firstInput = document.querySelector('input, button, select, textarea');
        if (firstInput && !firstInput.disabled) {
            firstInput.focus();
        }
        
    } catch (error) {
        console.error('Failed to initialize application:', error);
        Utils.showError('Failed to initialize application. Please refresh the page.');
    }
}

// Enhanced cleanup and utility functions
function cleanup() {
    // Clear any running timeouts
    if (window.currentTimeout) {
        clearTimeout(window.currentTimeout);
    }
    
    // Reset processing states
    const isProcessing = false;
    
    // Clear any error messages
    const errorContainer = document.getElementById('error-notification');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

// Export utilities for potential external use
window.DreamnetUtils = {
    showError: Utils.showError,
    announceToScreenReader: Utils.announceToScreenReader,
    cleanup: cleanup
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initializeApp();

    // Background Music Handler
    const backgroundMusic = document.getElementById('background-music');
    if (backgroundMusic) {
        backgroundMusic.volume = 0.1; // Set a soft volume
        const playPromise = backgroundMusic.play();

        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log('Autoplay was prevented. Waiting for user interaction.');
                // Show a play button or listen for a click
                document.body.addEventListener('click', () => {
                    backgroundMusic.play();
                }, { once: true });
            });
        }
    }
    
    // --- WALLET CONNECTION ELEMENTS ---
    const walletScreen = document.getElementById('wallet-screen');
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    const walletConnected = document.getElementById('wallet-connected');
    const walletAddress = document.getElementById('wallet-address');
    const beginCreationBtn = document.getElementById('begin-creation-btn');
    
    // --- ELEMENTS ---
    const creationScreen = document.getElementById('creation-screen');
    const chatScreen = document.getElementById('app-container');
    const creationTitle = document.getElementById('creation-title');
    const creationQuestion = document.getElementById('creation-question');
    const creationOptionsContainer = document.getElementById('creation-options');
    const creationImageContainer = document.getElementById('creation-image-container');
    const creationMainImage = document.getElementById('creation-main-image');
    const nextButton = document.getElementById('next-button');
    const backButton = document.getElementById('back-button');
    // Chat screen elements
    const wardenPortrait = document.getElementById('warden-portrait-container');
    const scholarPortrait = document.getElementById('scholar-portrait-container');
    const conversationView = document.getElementById('conversation-view');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');

    // --- STATE ---
    let currentCreationStep = 0;
    let userChoices = { Warden: {}, Scholar: {} };
    let selectedOption = null;
    let finalCharacters = {};
    let isWalletConnected = false;
    let userWallet = null;
    let currentQuest = null; // To hold the state of the active quest
    let currentChallengeIndex = 0; // To track progress within a quest
    let awaitingArtifactDiscussion = false; // New state for the final discussion
    let canAttemptChallenge = false; // Prevent solving challenges before travel
    
    // Make character data globally accessible for modal
    window.characterData = {
        userChoices: userChoices,
        finalCharacters: finalCharacters
    };

    // --- WALLET CONNECTION LOGIC ---
    async function connectWallet() {
        try {
            let wallet = null;
            let walletName = '';

            // Try Phantom first
            if (window.solana && window.solana.isPhantom) {
                wallet = window.solana;
                walletName = 'Phantom';
            }
            // Try Solflare
            else if (window.solflare && window.solflare.isSolflare) {
                wallet = window.solflare;
                walletName = 'Solflare';
            }
            // Try generic Solana wallet
            else if (window.solana) {
                wallet = window.solana;
                walletName = 'Solana Wallet';
            }
            else {
                Utils.showError('No Solana wallet detected. Please install Phantom, Solflare, or another compatible wallet to continue.');
                return false;
            }

            // Request connection
            const response = await wallet.connect();
            const publicKey = response.publicKey.toString();
            
            // Update state
            isWalletConnected = true;
            userWallet = {
                publicKey: publicKey,
                shortAddress: `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`,
                walletName: walletName
            };

            // Update UI
            walletAddress.textContent = `${userWallet.shortAddress} (${walletName})`;
            connectWalletBtn.style.display = 'none';
            walletConnected.style.display = 'flex';
            walletConnected.classList.remove('hidden');

            // Announce success
            Utils.announceToScreenReader(`${walletName} wallet connected successfully. Address: ${userWallet.shortAddress}`);
            
            return true;

        } catch (error) {
            console.error('Wallet connection failed:', error);
            
            let errorMessage = 'Failed to connect wallet. Please try again.';
            if (error.code === 4001) {
                errorMessage = 'Wallet connection was rejected. Please approve the connection to continue.';
            } else if (error.message && error.message.includes('User rejected')) {
                errorMessage = 'Wallet connection was rejected. Please approve the connection to continue.';
            }
            
            Utils.showError(errorMessage);
            return false;
        }
    }

    function proceedToCharacterCreation() {
        if (!isWalletConnected) {
            Utils.showError('Please connect your wallet first.');
            return;
        }

        // Hide wallet screen and show character creation
        walletScreen.classList.add('hidden');
        creationScreen.classList.remove('hidden');
        
        // Announce transition
        Utils.announceToScreenReader('Proceeding to character creation. Welcome to the wasteland, Prospector.');
    }

    // --- NFT MINTING LOGIC ---
    async function mintCharacterAsNFT(characterType) {
        if (!isWalletConnected) {
            Utils.showError('Please connect your wallet first.');
            return;
        }

        const character = finalCharacters[characterType.toLowerCase()];
        if (!character) {
            Utils.showError(`${characterType} character not found. Please complete character creation first.`);
            return;
        }

        const mintButton = document.getElementById('modal-mint-btn');

        try {
            // Show loading state
            if (mintButton) {
                mintButton.textContent = 'Minting...';
                mintButton.disabled = true;
                mintButton.classList.add('loading');
            }

            // Prepare NFT metadata
            const metadata = {
                name: `${character.name} - ${characterType}`,
                description: `A ${characterType} companion forged in the post-apocalyptic wasteland.`,
                image: character.portraitUrl,
                attributes: [
                    { trait_type: "Type", value: characterType },
                    { trait_type: "Name", value: character.name },
                    { trait_type: "Role", value: character.role }
                ],
                properties: {
                    category: "character",
                    creators: [{ address: userWallet.publicKey, share: 100 }]
                }
            };

            // Force demo minting
            console.log('🎭 Forcing demo mint mode as requested...');
            
            const mockResponse = await fetch('/api/mock-mint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userWallet: userWallet.publicKey,
                    metadata: metadata,
                    characterType: characterType
                })
            });
            
            const mintResult = await mockResponse.json();
            
            if (!mintResult.success) {
                throw new Error(mintResult.error || 'Failed to mint NFT');
            }

            console.log(`✅ NFT mock minted successfully:`, mintResult);

            // Mark the character as minted
            character.isMinted = true;

            // Update UI with success
            if (mintButton) {
                mintButton.textContent = 'Demo Minted! 🎭';
                mintButton.classList.remove('loading');
                mintButton.classList.add('demo');
                mintButton.disabled = true;
            }

            // Show success message
            const successMessage = `${characterType} minted in demo mode! ${mintResult.message || 'Your NFT concept is ready!'}`;
                
            Utils.showSuccess(successMessage);
            Utils.announceToScreenReader(`${characterType} successfully demo minted as NFT.`);
                
        } catch (error) {
            console.error('NFT minting failed:', error);
            
            // Reset button state properly
            if (mintButton) {
                mintButton.textContent = `Mint as NFT`;
                mintButton.disabled = false;
                mintButton.classList.remove('loading');
            }
            
            Utils.showError(`Failed to mint ${characterType} as NFT: ${error.message}`);
        }
    }


    // Wallet event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    beginCreationBtn.addEventListener('click', proceedToCharacterCreation);


    // --- PROGRESS INDICATOR ---
    function initializeProgressIndicator() {
        const progressContainer = document.getElementById('progress-container');
        progressContainer.innerHTML = '';
        
        for (let i = 0; i < creationFlow.length; i++) {
            const orb = document.createElement('div');
            orb.classList.add('progress-orb');
            
            // Add character type class for color coding
            const characterType = creationFlow[i].type.toLowerCase();
            orb.classList.add(`${characterType}-orb`);
            
            if (i < currentCreationStep) orb.classList.add('completed');
            if (i === currentCreationStep) orb.classList.add('active');
            progressContainer.appendChild(orb);
        }
    }

    function updateProgressIndicator() {
        const orbs = document.querySelectorAll('.progress-orb');
        orbs.forEach((orb, index) => {
            orb.classList.remove('active', 'completed');
            if (index < currentCreationStep) orb.classList.add('completed');
            if (index === currentCreationStep) orb.classList.add('active');
        });
    }

    function updateBackButtonVisibility() {
        const buttonsContainer = document.getElementById('creation-buttons');
        if (currentCreationStep === 0) {
            backButton.classList.add('hidden');
            buttonsContainer.classList.remove('has-back-button');
        } else {
            backButton.classList.remove('hidden');
            buttonsContainer.classList.add('has-back-button');
        }
    }

    // --- RENDER CREATION STEP ---
    function renderCreationStep() {
        const step = creationFlow[currentCreationStep];
        const stepNumber = currentCreationStep + 1;
        const totalSteps = creationFlow.length;
        
        // Update titles and accessibility
        creationTitle.textContent = `Create Your ${step.type}`;
        creationQuestion.textContent = step.question;
        
        // Update progress for screen readers
        const progressContainer = document.getElementById('progress-container');
        progressContainer.setAttribute('aria-valuenow', stepNumber);
        progressContainer.setAttribute('aria-valuemax', totalSteps);
        progressContainer.setAttribute('aria-valuetext', `Step ${stepNumber} of ${totalSteps}: ${step.question}`);
        
        // Clear options and reset selection
        creationOptionsContainer.innerHTML = '';
        selectedOption = null;
        
        // Handle image display
        if (!creationMainImage.src || creationMainImage.src.includes('undefined')) {
            creationImageContainer.classList.add('image-hidden');
            creationMainImage.src = '';
            creationMainImage.alt = '';
        }

        // Update character preview
        updateCharacterPreview();

        // Update back button visibility
        updateBackButtonVisibility();

        // Handle layout flip for Scholar creation
        const creationMain = document.getElementById('creation-main');
        if (step.type === 'Scholar') {
            creationMain.classList.add('scholar-layout');
        } else {
            creationMain.classList.remove('scholar-layout');
        }

        // Create accessible options
        step.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('creation-option');
            optionElement.dataset.id = option.id;
            optionElement.innerHTML = `<p>${option.text}</p>`;
            
            // Check if this option was previously selected
            const currentChoices = userChoices[step.type];
            const isSelected = currentChoices[step.key] === option.id;
            
            // Accessibility attributes
            optionElement.setAttribute('role', 'radio');
            optionElement.setAttribute('aria-checked', isSelected ? 'true' : 'false');
            optionElement.setAttribute('tabindex', (isSelected || (!currentChoices[step.key] && index === 0)) ? '0' : '-1');
            optionElement.setAttribute('aria-describedby', 'creation-question');
            
            // If this option was previously selected, mark it as selected
            if (isSelected) {
                optionElement.classList.add('selected');
                selectedOption = option.id;
                
                // Update image
                creationMainImage.src = option.img;
                creationMainImage.alt = `Selected option: ${option.text}`;
                creationImageContainer.classList.remove('image-hidden');
            }
            
            // Click handler
            const selectOption = () => {
                // Update all options
                document.querySelectorAll('.creation-option').forEach(el => {
                    el.classList.remove('selected');
                    el.setAttribute('aria-checked', 'false');
                    el.setAttribute('tabindex', '-1');
                });
                
                // Select current option
                optionElement.classList.add('selected');
                optionElement.setAttribute('aria-checked', 'true');
                optionElement.setAttribute('tabindex', '0');
                selectedOption = option.id;
                
                // Update image
                creationMainImage.src = option.img;
                creationMainImage.alt = `Selected option: ${option.text}`;
                creationImageContainer.classList.remove('image-hidden');
                
                // Announce selection to screen readers
                Utils.announceToScreenReader(`Selected: ${option.text}`);
            };
            
            // Event listeners
            optionElement.addEventListener('click', selectOption);
            optionElement.addEventListener('keydown', (event) => {
                switch (event.key) {
                    case 'Enter':
                    case ' ':
                        event.preventDefault();
                        selectOption();
                        break;
                    case 'ArrowDown':
                    case 'ArrowRight':
                        event.preventDefault();
                        focusNextOption(optionElement);
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        event.preventDefault();
                        focusPreviousOption(optionElement);
                        break;
                }
            });
            
            creationOptionsContainer.appendChild(optionElement);
        });
        
        // Announce step change to screen readers
        Utils.announceToScreenReader(`${step.question}. ${step.options.length} options available.`);
    }

    // --- KEYBOARD NAVIGATION HELPERS ---
    function focusNextOption(currentOption) {
        const options = Array.from(document.querySelectorAll('.creation-option'));
        const currentIndex = options.indexOf(currentOption);
        const nextIndex = (currentIndex + 1) % options.length;
        
        currentOption.setAttribute('tabindex', '-1');
        options[nextIndex].setAttribute('tabindex', '0');
        options[nextIndex].focus();
    }

    function focusPreviousOption(currentOption) {
        const options = Array.from(document.querySelectorAll('.creation-option'));
        const currentIndex = options.indexOf(currentOption);
        const prevIndex = currentIndex === 0 ? options.length - 1 : currentIndex - 1;
        
        currentOption.setAttribute('tabindex', '-1');
        options[prevIndex].setAttribute('tabindex', '0');
        options[prevIndex].focus();
    }

    // --- CHARACTER PREVIEW ---
    function updateCharacterPreview() {
        const previewContainer = document.getElementById('character-preview');
        const currentCharacterType = creationFlow[currentCreationStep].type;
        const currentChoices = userChoices[currentCharacterType];
        
        // Clear previous preview
        previewContainer.innerHTML = '';
        
        // If we have previous choices for this character, show them
        if (Object.keys(currentChoices).length > 0) {
            Object.entries(currentChoices).forEach(([key, choiceId]) => {
                // Find the step and option for this choice
                const stepIndex = creationFlow.findIndex(step => 
                    step.type === currentCharacterType && step.key === key
                );
                
                if (stepIndex !== -1) {
                    const step = creationFlow[stepIndex];
                    const option = step.options.find(opt => opt.id === choiceId);
                    
                    if (option) {
                        const previewImg = document.createElement('img');
                        previewImg.src = option.img;
                        previewImg.alt = option.text;
                        previewImg.classList.add('preview-choice');
                        previewImg.title = `${step.question}: ${option.text}`;
                        previewContainer.appendChild(previewImg);
                    }
                }
            });
            
            previewContainer.classList.remove('hidden');
        } else {
            previewContainer.classList.add('hidden');
        }
    }

    // --- CHARACTER CREATION LOGIC (from our node scripts) ---
    function createWarden(answers) {
        const male = ["Marcus","Thane","Gareth","Roderick","Vance","Kael","Darius","Brennan","Aldric","Tormund","Bjorn","Cassius","Drake","Erik","Finn"];
        const female = ["Brynn","Astrid","Freya","Kenna","Sloane","Runa","Signy","Torvi","Ingrid","Hilda"];
        const last = ["Ironshield","Stormborn","Blackstone","Steelheart","Grimward","Battleborn","Ironforge","Darkbane","Shadowmend","Oathkeeper"];
        const first = answers.gender.toLowerCase() === 'male' ? male[Math.floor(Math.random()*male.length)] : female[Math.floor(Math.random()*female.length)];
        
        const pMap = { "A": "confident_outgoing", "B": "cautious_reserved", "C": "blunt_direct" };
        const aMap = { "A": "striking_regal_golden_hair_strong_jawline", "B": "dark_skin_black_hair_battle_scars_weathered", "C": answers.gender.toLowerCase() === "male" ? "bald_thick_beard_tattoos_intimidating" : "shaved_head_intricate_facial_tattoos_intimidating" };
        const bMap = { "A": "noble_warrior_family_tradition_proud_heritage", "B": "scarred_survivor_knows_loss_protective_experience", "C": "bitter_mercenary_learned_hard_way_cynical_loyal" };

        return { name: `${first} ${last[Math.floor(Math.random()*last.length)]}`, role: 'Protector of the Party', personality: { conversationStyle: pMap[answers.question1], appearance: aMap[answers.question2], backstory: bMap[answers.question3] } };
    }
    function createScholar(answers) {
        const male = ["Alaric","Thaddeus","Valerius","Orion","Lysander","Cassian","Silas","Peregrine","Evander","Leander"];
        const female = ["Elara","Seraphina","Lyra","Cassia","Aurelia","Thalia","Rowan","Isolde","Genevieve","Linnea"];
        const last = ["Loreweaver","Starfall","Shadowbrook","Whisperwind","Greycastle","Cinderfall","Evenwood","Blackwood"];
        const first = answers.gender.toLowerCase() === 'male' ? male[Math.floor(Math.random()*male.length)] : female[Math.floor(Math.random()*female.length)];

        const pMap = { "A": "patient_empathetic_thoughtful_prose", "B": "socially_awkward_technical_jargon_excitable", "C": "condescending_superior_dismissive" };
        const aMap = { "A": answers.gender.toLowerCase() === "male" ? "long_white_beard_kind_eyes_simple_robes" : "long_silver_hair_in_intricate_braids_kind_eyes_simple_robes", "B": "messy_hair_glasses_ink_stained_fingers", "C": "sharp_angular_features_immaculate_clothing_disdainful" };
        const bMap = { "A": "former_mentor_to_great_leader_seeks_to_preserve_knowledge", "B": "prodigy_ostracized_for_studying_forbidden_knowledge", "C": "from_renowned_family_of_theorists_sees_lineage_as_superiority" };

        return { name: `${first} ${last[Math.floor(Math.random()*last.length)]}`, role: 'Interpreter of the Arcane', personality: { conversationStyle: pMap[answers.question1], appearance: aMap[answers.question2], backstory: bMap[answers.question3] } };
    }

    // --- NEXT BUTTON LOGIC ---
    nextButton.addEventListener('click', async () => {
        if (!selectedOption) {
            Utils.showError('Please make a selection before continuing.');
            // Focus the first option for accessibility
            const firstOption = document.querySelector('.creation-option');
            if (firstOption) firstOption.focus();
            return;
        }
        
        const step = creationFlow[currentCreationStep];
        userChoices[step.type][step.key] = selectedOption;
        
        // Update global reference
        window.characterData.userChoices = userChoices;

        currentCreationStep++;
        updateProgressIndicator();
        
        if (currentCreationStep < creationFlow.length) {
            renderCreationStep();
        } else {
            // --- CREATION COMPLETE ---
            try {
                finalCharacters.warden = createWarden(userChoices.Warden);
                finalCharacters.scholar = createScholar(userChoices.Scholar);
                
                // Update global reference
                window.characterData.finalCharacters = finalCharacters;
                
                // Update UI for image generation
                creationTitle.textContent = 'Weaving Arcane Portraits...';
                document.getElementById('creation-main').innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 2rem; width: 100%; text-align: center;">
                        <div class="loading-spinner" style="width: 60px; height: 60px; border-width: 4px; margin: 0 auto;"></div>
                        <p style="font-size: 1.2rem; color: var(--text-secondary); text-align: center; max-width: 400px; margin: 0 auto;">
                            The ancient magics are at work, crafting unique portraits of your companions. This mystical process may take up to 30 seconds...
                        </p>
                    </div>
                `;
                
                // Announce to screen readers
                Utils.announceToScreenReader('Character creation complete. Generating portraits...');
                
                // Generate images with timeout and error handling
                const imagePromises = [
                    Utils.withTimeout(
                        generateCharacterImage(finalCharacters.warden),
                        IMAGE_GENERATION_TIMEOUT,
                        'Warden portrait generation timed out'
                    ),
                    Utils.withTimeout(
                        generateCharacterImage(finalCharacters.scholar),
                        IMAGE_GENERATION_TIMEOUT,
                        'Scholar portrait generation timed out'
                    )
                ];
                
                const [wardenImg, scholarImg] = await Promise.all(imagePromises);
                
                finalCharacters.warden.portraitUrl = wardenImg;
                finalCharacters.scholar.portraitUrl = scholarImg;
                
                // Update global reference with portrait URLs
                window.characterData.finalCharacters = finalCharacters;

                // Transition to the new adventure log
                creationScreen.classList.add('hidden');
                document.getElementById('app-container').classList.remove('hidden');
                initializeAdventureLog();
                
            } catch (error) {
                console.error('Character creation failed:', error);
                Utils.showError('Failed to complete character creation. Please try again.');
                
                // Reset to allow retry
                currentCreationStep--;
                updateProgressIndicator();
                renderCreationStep();
            }
        }
    });

    // --- BACK BUTTON LOGIC ---
    backButton.addEventListener('click', () => {
        if (currentCreationStep > 0) {
            // Remove the current step's choice from userChoices
            const currentStep = creationFlow[currentCreationStep];
            delete userChoices[currentStep.type][currentStep.key];
            
            // Go back one step
            currentCreationStep--;
            updateProgressIndicator();
            
            // Re-render the previous step
            renderCreationStep();
            
            // Announce to screen readers
            const previousStep = creationFlow[currentCreationStep];
            Utils.announceToScreenReader(`Went back to: ${previousStep.question}`);
        }
    });

    // --- ENHANCED AI IMAGE GENERATION using secure proxy ---
    async function generateCharacterImage(character) {
        const prompt = `A fantasy character portrait of ${character.name}, a ${character.role}. Their appearance is: ${character.personality.appearance}. Digital painting, head and shoulders, detailed face.`;
        
        try {
            const response = await fetch(`${API_BASE_URL}/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.imageUrl) {
                throw new Error('No image URL returned from server');
            }
            
            // Preload the generated image
            await Utils.preloadImage(data.imageUrl);
            
            return data.imageUrl;
            
        } catch (error) {
            console.error(`Image generation failed for ${character.name}:`, error);
            
            let errorMessage = 'Failed to generate character image.';
            if (error.message.includes('timeout')) {
                errorMessage = 'Image generation timed out. Using placeholder.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage = 'Image generation quota exceeded. Using placeholder.';
            }
            
            Utils.showError(errorMessage);
            
            // Return a character-specific placeholder or default
            const placeholderMap = {
                'Protector of the Party': 'images/test_warden.png',
                'Interpreter of the Arcane': 'images/test_scholar.png'
            };

            return placeholderMap[character.role] || 'images/test_warden.png';
        }
    }
    
    // --- Message Handling ---
    function addMessage(sender, text, type = 'chat', characterType) {
        const messageLog = document.getElementById('adventure-log-messages');
        const messageElement = document.createElement('div');
        
        // Add the base 'message' class
        messageElement.classList.add('message');

        // Add specific class based on the sender
        if (sender === 'You') {
            messageElement.classList.add('You-message');
        } else if (type === 'system') {
            messageElement.classList.add('system-message');
        } else if (sender === 'warden') {
            messageElement.classList.add('warden-message');
        } else if (sender === 'scholar') {
            messageElement.classList.add('scholar-message');
        }

        let senderDisplay = sender;
        if (sender === 'warden' && finalCharacters.warden) senderDisplay = finalCharacters.warden.name;
        if (sender === 'scholar' && finalCharacters.scholar) senderDisplay = finalCharacters.scholar.name;

        if (type === 'system') {
            messageElement.innerHTML = `<p><strong>${senderDisplay}:</strong> ${text}</p>`;
        } else {
             messageElement.innerHTML = `<strong>${senderDisplay.toUpperCase()}:</strong> ${text}`;
        }
        
        if(messageLog) {
            messageLog.prepend(messageElement);
        }
    }

    // --- ADVENTURE LOG LOGIC ---
    function initializeAdventureLog() {
        const adventureLogContainer = document.getElementById('app-container'); // The main container is now the adventure log
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const startQuestBtn = document.getElementById('start-quest-btn');

        // Header elements
        const headerWardenImg = document.querySelector('#header-warden-portrait img');
        const headerWardenName = document.getElementById('header-warden-name');
        const headerScholarImg = document.querySelector('#header-scholar-portrait img');
        const headerScholarName = document.getElementById('header-scholar-name');
        const questTitleEl = document.getElementById('quest-title');
        const questObjectiveEl = document.getElementById('quest-objective');

        // Target selection buttons
        const targetWardenBtn = document.getElementById('target-warden');
        const targetScholarBtn = document.getElementById('target-scholar');

        // State
        let activeTarget = 'warden'; // 'warden' or 'scholar'
        let isProcessing = false;

        // --- UI Setup ---
        function setupUI() {
            // Populate header with dynamic character data
            headerWardenImg.src = finalCharacters.warden.portraitUrl;
            headerWardenName.textContent = finalCharacters.warden.name;
            headerScholarImg.src = finalCharacters.scholar.portraitUrl;
            headerScholarName.textContent = finalCharacters.scholar.name;

            // Populate target buttons
            targetWardenBtn.querySelector('img').src = finalCharacters.warden.portraitUrl;
            targetScholarBtn.querySelector('img').src = finalCharacters.scholar.portraitUrl;

            // Add welcome message
            addMessage('Dungeon Master', `Welcome, Prospector. Your companions, ${finalCharacters.warden.name} and ${finalCharacters.scholar.name}, await your direction.`, 'system');
        }

        // --- Target Selection Logic ---
        function setActiveTarget(target) {
            activeTarget = target;
            targetWardenBtn.classList.toggle('active', target === 'warden');
            targetScholarBtn.classList.toggle('active', target === 'scholar');
            targetWardenBtn.setAttribute('aria-pressed', target === 'warden');
            targetScholarBtn.setAttribute('aria-pressed', target === 'scholar');
            messageInput.focus();
        }

        targetWardenBtn.addEventListener('click', () => setActiveTarget('warden'));
        targetScholarBtn.addEventListener('click', () => setActiveTarget('scholar'));

        // --- Quest System Logic ---
        const questScrollModal = initializeQuestScrollModal();
        
        // This is the new centralized handler for the main quest progression button.
        async function handleQuestProgression() {
            if (isProcessing) return;

            const currentState = startQuestBtn.dataset.state || 'start';
            console.log(`🚀 Quest progression button clicked. State: ${currentState}`);

            isProcessing = true;
            startQuestBtn.disabled = true;
            startQuestBtn.classList.add('loading');

            try {
                if (currentState === 'start') {
                    // State 1: No active quest. Start a new one.
                    startQuestBtn.textContent = 'Generating...';
                    const response = await fetch('/api/start-quest', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ completedChallenges: [] })
                    });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    const data = await response.json();
                    currentQuest = data;
                    questScrollModal.open(currentQuest);
                    // The modal's accept button will now handle the next state transition.
                } else if (currentState === 'travel') {
                    // States 2 & 3: Travel to the next objective.
                    startQuestBtn.textContent = 'Traveling...';
                    await triggerNarration();
                    // After narration, the objective is updated, and the button is hidden
                    // until the next challenge is complete.
                    startQuestBtn.classList.add('hidden');
                }
            } catch (error) {
                console.error(`❌ Error in quest state '${currentState}':`, error);
                Utils.showError("An issue occurred with the quest. Please try again.");
                // Reset to a safe state
                startQuestBtn.dataset.state = 'start';
                startQuestBtn.textContent = 'Start New Quest';
                startQuestBtn.disabled = false;
            } finally {
                isProcessing = false;
                // Don't remove loading class here, as state changes will handle it.
            }
        }

        async function triggerNarration() {
            if (!currentQuest) return;

            const isFinalNarration = currentChallengeIndex >= currentQuest.questOrder.length;
            const previousChallenge = currentChallengeIndex > 0 ? currentQuest.questOrder[currentChallengeIndex - 1].objectiveText : null;
            const nextObjective = isFinalNarration ? `Find the ${currentQuest.artifactName}` : currentQuest.questOrder[currentChallengeIndex].objectiveText;

            const response = await fetch('/api/narrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questName: currentQuest.questName,
                    objective: nextObjective,
                    previousChallenge: previousChallenge,
                    isFinal: isFinalNarration,
                    artifactName: currentQuest.artifactName
                })
            });

            if (!response.ok) throw new Error('Failed to get narration from AI.');
            
            const data = await response.json();
            addMessage('Dungeon Master', data.narration, 'system');
            
            if (isFinalNarration) {
                // The final narration has been delivered. Now, await the discussion.
                awaitingArtifactDiscussion = true;
                questTitleEl.textContent = currentQuest.questName;
                questObjectiveEl.textContent = "Objective: Discuss the artifact with your companions.";
                Utils.showSuccess("You've found the artifact! Now, discuss it with your companions.");
            } else {
                // Update the main objective display and allow the challenge to be attempted.
                questObjectiveEl.textContent = `Objective: ${nextObjective}`;
                canAttemptChallenge = true;
            }
        }

        startQuestBtn.addEventListener('click', handleQuestProgression);

        // --- Send Message Logic ---
        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message || isProcessing) return;

            isProcessing = true;
            sendButton.classList.add('loading');
            messageInput.disabled = true;

            addMessage('You', message, 'chat', activeTarget);
            messageInput.value = '';

            try {
                const character = finalCharacters[activeTarget];
                
                if (awaitingArtifactDiscussion) {
                    // Handle the final artifact discussion
                    const response = await fetch('/api/discuss-artifact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            character: character,
                            message: message,
                            artifactName: currentQuest.artifactName
                        })
                    });
                    if (!response.ok) throw new Error('Artifact discussion API failed');
                    const data = await response.json();
                    addMessage(activeTarget, data.dialogue, 'chat', activeTarget);

                    if (data.solution) {
                        // The discussion is complete, finalize the quest.
                        questTitleEl.textContent = "Quest Complete!";
                        questObjectiveEl.textContent = `You have recovered the ${currentQuest.artifactName}! A new adventure awaits.`;
                        startQuestBtn.dataset.state = 'start';
                        startQuestBtn.textContent = 'Start New Quest';
                        startQuestBtn.disabled = false;
                        startQuestBtn.classList.remove('hidden', 'loading');
                        currentQuest = null;
                        awaitingArtifactDiscussion = false;
                        console.log("✅ QUEST COMPLETE!");
                    }
                    return; // End the function here
                }

                // Determine if we are in a quest or in "idle mode"
                const challenge = currentQuest ? currentQuest.questOrder[currentChallengeIndex] : null;

                const response = await fetch('/api/interact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        character: character,
                        message: message,
                        challenge: challenge, // This will be null if no quest is active
                        questName: currentQuest ? currentQuest.questName : null
                    })
                });

                if (!response.ok) {
                    throw new Error(`Interaction API failed with status: ${response.status}`);
                }

                const data = await response.json();
                addMessage(activeTarget, data.dialogue, 'chat', activeTarget);

                // Only check for a solution if a challenge was active and the player has "arrived"
                if (challenge && data.solution && canAttemptChallenge) {
                    Utils.showSuccess(`${character.name} has solved the challenge: ${challenge.objectiveText}`);
                    currentChallengeIndex++;
                    canAttemptChallenge = false; // Disallow next challenge until travel

                    if (currentChallengeIndex >= currentQuest.questOrder.length) {
                        // Last challenge is solved, prepare for the final narration.
                        questObjectiveEl.textContent = "Objective: Claim your reward.";
                        
                        // Configure the button for the final travel segment
                        startQuestBtn.dataset.state = 'travel';
                        startQuestBtn.textContent = 'Enter the Final Chamber';
                        startQuestBtn.disabled = false;
                        startQuestBtn.classList.remove('hidden', 'loading');
                        
                        Utils.showSuccess("All challenges complete! It's time to claim your reward.");
                    } else {
                        // A challenge is solved, prepare for the next travel segment.
                        questObjectiveEl.textContent = "Objective: Journey to the next location.";
                        
                        // Configure the button for travel
                        startQuestBtn.dataset.state = 'travel';
                        startQuestBtn.textContent = 'Continue Onward';
                        startQuestBtn.disabled = false;
                        startQuestBtn.classList.remove('hidden', 'loading');
                        
                        Utils.showSuccess("Challenge complete! Press 'Continue Onward' to proceed.");
                    }
                }

            } catch (error) {
                console.error("❌ Error during interaction:", error);
                Utils.showError("The AI is currently lost in thought... Please try again.");
            } finally {
                isProcessing = false;
                sendButton.classList.remove('loading');
                messageInput.disabled = false;
                messageInput.focus();
            }
        }

        sendButton.addEventListener('click', sendMessage);
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // --- Initial Setup ---
        setupUI();
        initializeCharacterSummaryModal(); // Re-initialize the modal for the new UI
    }

    // --- QUEST SCROLL MODAL ---
    function initializeQuestScrollModal() {
        const modal = document.getElementById('quest-scroll-modal');
        if (!modal) return { open: () => {}, close: () => {} };

        const titleEl = document.getElementById('quest-scroll-title');
        const bodyEl = document.getElementById('quest-scroll-body');
        const acceptBtn = document.getElementById('accept-quest-btn');

        function open(questData) {
            titleEl.textContent = questData.questName;
            bodyEl.textContent = questData.questHook; // Use questHook now
            modal.classList.remove('hidden');
            modal.classList.add('show');
        }

        function close() {
            modal.classList.remove('show');
            modal.classList.add('hidden');
        }

        acceptBtn.addEventListener('click', () => {
            close();
            const questTitleEl = document.getElementById('quest-title');
            const questObjectiveEl = document.getElementById('quest-objective');
            const startQuestBtn = document.getElementById('start-quest-btn');

            currentChallengeIndex = 0; // Reset challenge progress
            questTitleEl.textContent = currentQuest.questName;
            addMessage('Dungeon Master', currentQuest.questHook, 'system');
            questObjectiveEl.textContent = `Objective: Embark on the quest to find the ${currentQuest.artifactName}.`;
            
            // Configure the button for the first travel segment
            startQuestBtn.dataset.state = 'travel';
            startQuestBtn.textContent = 'Begin Your Journey';
            startQuestBtn.disabled = false;
            startQuestBtn.classList.remove('hidden', 'loading');
        });

        return { open, close };
    }
    
    // --- CHARACTER SUMMARY MODAL ---
    function initializeCharacterSummaryModal() {
        const modal = document.getElementById('character-summary-modal');
        if (!modal) return;

        const modalBackdrop = modal;
        const modalClose = modal.querySelector('.modal-close');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        const mintButton = document.getElementById('modal-mint-btn');

        const choiceDescriptions = {
            Warden: {
                gender: { Male: 'Male', Female: 'Female' },
                question1: { A: 'Confident and outgoing leader', B: 'Cautious and reserved guardian', C: 'Blunt and direct realist' },
                question2: { A: 'Striking, with regal features and golden hair', B: 'Dark-haired and weathered, with battle scars', C: 'Imposing and covered in intricate tattoos' },
                question3: { A: 'From a proud and noble warrior family', B: 'A scarred survivor who has known great loss', C: 'A bitter mercenary, loyal only to their coin and crew' }
            },
            Scholar: {
                gender: { Male: 'Male', Female: 'Female' },
                question1: { A: 'Patient, empathetic, and speaks thoughtfully', B: 'A socially awkward but brilliant genius', C: 'Condescending, with an air of superiority' },
                question2: { A: 'A wise elder with kind eyes and simple robes', B: 'A messy-haired prodigy with ink-stained fingers', C: 'Sharp, angular features and immaculate clothing' },
                question3: { A: 'A former mentor to a once-great leader', B: 'A prodigy, ostracized for their forbidden knowledge', C: 'From a renowned family of theorists, sees their lineage as a mark of superiority' }
            }
        };
        
        const questionLabels = { gender: 'Gender', question1: 'Personality', question2: 'Appearance', question3: 'Backstory' };

        function openModal(characterType) {
            // Use the globally accessible characterData object
            const character = window.characterData.finalCharacters[characterType.toLowerCase()];
            const choices = window.characterData.userChoices[characterType];

            if (!character || !choices || Object.keys(choices).length === 0) {
                Utils.showError('Character data is not fully available yet. Please complete character creation.');
                return;
            }

            modalTitle.textContent = `${character.name} - Character Summary`;
            modalBody.innerHTML = '';

            // Add Role
            const roleDetail = document.createElement('div');
            roleDetail.className = 'character-detail';
            roleDetail.innerHTML = `<div class="detail-label">Role</div><p class="detail-value">${character.role}</p>`;
            modalBody.appendChild(roleDetail);

            // Add all other choices from the creation flow
            Object.entries(choices).forEach(([key, choiceId]) => {
                const label = questionLabels[key];
                const description = choiceDescriptions[characterType]?.[key]?.[choiceId];
                
                if (label && description) {
                    const detail = document.createElement('div');
                    detail.className = 'character-detail';
                    detail.innerHTML = `<div class="detail-label">${label}</div><p class="detail-value">${description}</p>`;
                    modalBody.appendChild(detail);
                }
            });

            // Handle mint button logic
            const mintButton = modal.querySelector('#modal-mint-btn');
            const newMintButton = mintButton.cloneNode(true); // Create a fresh button to remove old listeners
            mintButton.parentNode.replaceChild(newMintButton, mintButton);

            if (isWalletConnected) {
                if (character.isMinted) {
                    newMintButton.textContent = 'Demo Minted! 🎭';
                    newMintButton.classList.add('demo');
                    newMintButton.disabled = true;
                } else {
                    newMintButton.textContent = 'Mint as NFT';
                    newMintButton.classList.remove('demo', 'success');
                    newMintButton.disabled = false;
                    newMintButton.addEventListener('click', () => {
                        closeModal();
                        mintCharacterAsNFT(characterType);
                    });
                }
                newMintButton.style.display = 'block';
            } else {
                newMintButton.style.display = 'none';
            }


            modalBackdrop.classList.add('show');
            modalBackdrop.setAttribute('aria-hidden', 'false');
            modalClose.focus();
        }

        function closeModal() {
            modalBackdrop.classList.remove('show');
            modalBackdrop.setAttribute('aria-hidden', 'true');
        }

        modalClose.addEventListener('click', closeModal);
        modalBackdrop.addEventListener('click', (event) => {
            if (event.target === modalBackdrop) closeModal();
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && modalBackdrop.classList.contains('show')) {
                closeModal();
            }
        });

        const wardenDetailsBtn = document.getElementById('warden-details-btn');
        if (wardenDetailsBtn) {
            wardenDetailsBtn.addEventListener('click', () => openModal('Warden'));
        }

        const scholarDetailsBtn = document.getElementById('scholar-details-btn');
        if (scholarDetailsBtn) {
            scholarDetailsBtn.addEventListener('click', () => openModal('Scholar'));
        }
    }

    // --- INITIAL RENDER ---
    initializeProgressIndicator();
    renderCreationStep();
});
