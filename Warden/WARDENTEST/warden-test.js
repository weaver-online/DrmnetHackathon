// Warden Test Script
// This script allows testing of different answer combinations for Warden character creation
// It interacts with the createWarden() function from warden-character.js without modifying the original file

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Import the createWarden function from the copied file in the same folder
const { createWarden } = require('./warden-character-copy.js');

// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for answers
function promptForAnswers() {
  const answers = {};
  console.log('\nAnswer the following questions to customize your Warden (Choose A, B, or C):');
  
  rl.question('Question 1 - Personality Style (A: Confident & Outgoing, B: Cautious & Reserved, C: Blunt & Direct): ', (answer1) => {
    answers.question1 = answer1.toUpperCase();
    if (!['A', 'B', 'C'].includes(answers.question1)) {
      console.log('Invalid input. Defaulting to B for Question 1.');
      answers.question1 = 'B';
    }
    
    rl.question('Question 2 - Appearance (A: Handsome Achilles, B: Weathered Veteran, C: Intimidating Tattooed): ', (answer2) => {
      answers.question2 = answer2.toUpperCase();
      if (!['A', 'B', 'C'].includes(answers.question2)) {
        console.log('Invalid input. Defaulting to B for Question 2.');
        answers.question2 = 'B';
      }
      
      rl.question('Question 3 - Backstory (A: Noble Warrior, B: Scarred Survivor, C: Bitter Mercenary): ', (answer3) => {
        answers.question3 = answer3.toUpperCase();
        if (!['A', 'B', 'C'].includes(answers.question3)) {
          console.log('Invalid input. Defaulting to B for Question 3.');
          answers.question3 = 'B';
        }
        
        // Generate the Warden based on user answers
        const myWarden = createWarden(answers);
        console.log('\nYour Warden:', JSON.stringify(myWarden, null, 2));
        
        // Ask if user wants to create another Warden
        rl.question('\nWould you like to create another Warden? (yes/no): ', (repeat) => {
          if (repeat.toLowerCase() === 'yes' || repeat.toLowerCase() === 'y') {
            promptForAnswers(); // Restart the process
          } else {
            console.log('Testing complete. Goodbye!');
            rl.close();
          }
        });
      });
    });
  });
}

// Start the testing process
console.log('Welcome to the Warden Character Creation Test Tool');
promptForAnswers();
