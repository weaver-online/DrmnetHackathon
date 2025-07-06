// Name generator function
function generateAIName(gender) {
  const maleFirstNames = [
    "Marcus", "Thane", "Gareth", "Roderick", "Vance",
    "Kael", "Darius", "Brennan", "Aldric", "Tormund",
    "Bjorn", "Cassius", "Drake", "Erik", "Finn"
  ];

  const femaleFirstNames = [
    "Brynn", "Astrid", "Freya", "Kenna", "Sloane",
    "Runa", "Signy", "Torvi", "Ingrid", "Hilda"
  ];
  
  const lastNames = [
    "Ironshield", "Stormborn", "Blackstone", "Steelheart", 
    "Grimward", "Battleborn", "Ironforge", "Darkbane",
    "Shadowmend", "Oathkeeper", "Ravencrest", "Wolfsbane"
  ];
  
  const randomFirst = gender.toLowerCase() === "male"
    ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
    : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];

  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${randomFirst} ${randomLast}`;
}

// Complete character creation
function createWarden(userAnswers) {
  const personalityMap = {
    "A": "confident_outgoing",
    "B": "cautious_reserved", 
    "C": "blunt_direct"
  };
  
  const appearanceMap = {
    "A": "striking_regal_golden_hair_strong_jawline",
    "B": "dark_skin_black_hair_battle_scars_weathered",
    "C": userAnswers.gender.toLowerCase() === "male"
      ? "bald_thick_beard_tattoos_intimidating"
      : "shaved_head_intricate_facial_tattoos_intimidating"
  };
  
  const backstoryMap = {
    "A": "noble_warrior_family_tradition_proud_heritage",
    "B": "scarred_survivor_knows_loss_protective_experience",
    "C": "bitter_mercenary_learned_hard_way_cynical_loyal"
  };
  
  const wardenCharacter = {
    name: generateAIName(userAnswers.gender),
    role: "Protector of the Party",
    personality: {
      conversationStyle: personalityMap[userAnswers.question1],
      appearance: appearanceMap[userAnswers.question2],
      backstory: backstoryMap[userAnswers.question3]
    }
  };
  
  return wardenCharacter;
}

// Export the createWarden function for use in other files
module.exports = { createWarden };

// Test code commented out to prevent initial "all B" Warden output during interactive testing
/*
const playerChoices = {
  gender: "Male",
  question1: "C", // Blunt & Direct
  question2: "C", // The Intimidating look
  question3: "C"  // Bitter Mercenary backstory
};

const myWarden = createWarden(playerChoices);
console.log("Your Warden:", myWarden);
*/
