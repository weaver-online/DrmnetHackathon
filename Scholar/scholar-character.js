// Name generator function
function generateAIName(gender) {
  const maleFirstNames = [
    "Alaric", "Thaddeus", "Valerius", "Orion", "Lysander",
    "Cassian", "Silas", "Peregrine", "Evander", "Leander"
  ];

  const femaleFirstNames = [
    "Elara", "Seraphina", "Lyra", "Cassia", "Aurelia",
    "Thalia", "Rowan", "Isolde", "Genevieve", "Linnea"
  ];
  
  const lastNames = [
    "Loreweaver", "Starfall", "Shadowbrook", "Whisperwind", 
    "Greycastle", "Cinderfall", "Evenwood", "Blackwood",
    "Ironwood", "Sunstrider"
  ];
  
  const randomFirst = gender.toLowerCase() === "male" 
    ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
    : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    
  const randomLast = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${randomFirst} ${randomLast}`;
}

// Complete character creation
function createScholar(userAnswers) {
  const personalityMap = {
    "A": "patient_empathetic_thoughtful_prose",
    "B": "socially_awkward_technical_jargon_excitable", 
    "C": "condescending_superior_dismissive"
  };
  
  const appearanceMap = {
    "A": userAnswers.gender.toLowerCase() === "male" 
      ? "long_white_beard_kind_eyes_simple_robes" 
      : "long_silver_hair_in_intricate_braids_kind_eyes_simple_robes",
    "B": "messy_hair_glasses_ink_stained_fingers",
    "C": "sharp_angular_features_immaculate_clothing_disdainful"
  };
  
  const backstoryMap = {
    "A": "former_mentor_to_great_leader_seeks_to_preserve_knowledge",
    "B": "prodigy_ostracized_for_studying_forbidden_knowledge",
    "C": "from_renowned_family_of_theorists_sees_lineage_as_superiority"
  };
  
  const scholarCharacter = {
    name: generateAIName(userAnswers.gender),
    role: "Interpreter of the Arcane",
    personality: {
      conversationStyle: personalityMap[userAnswers.question1],
      appearance: appearanceMap[userAnswers.question2],
      backstory: backstoryMap[userAnswers.question3]
    }
  };
  
  return scholarCharacter;
}

// Export the createScholar function for use in other files
module.exports = { createScholar };

// Example of how to use it:
/*
const playerChoices = {
  gender: "Female",
  question1: "A", // Patient & Empathetic
  question2: "A", // The Wise Elder look
  question3: "A"  // Former Mentor backstory
};

const myScholar = createScholar(playerChoices);
console.log("Your Scholar:", myScholar);
*/
