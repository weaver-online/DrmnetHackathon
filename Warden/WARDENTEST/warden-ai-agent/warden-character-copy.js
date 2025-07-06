// Name generator function
function generateAIName() {
  const firstNames = [
    "Marcus", "Thane", "Gareth", "Roderick", "Vance",
    "Kael", "Darius", "Brennan", "Aldric", "Tormund",
    "Bjorn", "Cassius", "Drake", "Erik", "Finn"
  ];
  
  const lastNames = [
    "Ironshield", "Stormborn", "Blackstone", "Steelheart", 
    "Grimward", "Battleborn", "Ironforge", "Darkbane",
    "Shadowmend", "Oathkeeper", "Ravencrest", "Wolfsbane"
  ];
  
  const randomFirst = firstNames[Math.floor(Math.random() * firstNames.length)];
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
    "A": "handsome_achilles_golden_hair_strong_jawline",
    "B": "dark_skin_black_hair_battle_scars_weathered",
    "C": "bald_thick_beard_tattoos_intimidating"
  };
  
  const backstoryMap = {
    "A": "noble_warrior_family_tradition_proud_heritage",
    "B": "scarred_survivor_knows_loss_protective_experience",
    "C": "bitter_mercenary_learned_hard_way_cynical_loyal"
  };
  
  const wardenCharacter = {
    name: generateAIName(),
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
  question1: "B", // Cautious & Reserved
  question2: "B", // The Veteran look  
  question3: "B"  // Scarred Survivor backstory
};

const myWarden = createWarden(playerChoices);
console.log("Your Warden:", myWarden);
*/
