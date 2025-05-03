const fs = require('fs');
const path = require('path');

/**
 * Ensures that necessary upload directories exist when server starts
 */
function setupDirectories() {
  const requiredDirs = [
    './uploads',
    './uploads/vehicles',
    './uploads/documents',
    './uploads/profiles',
    './uploads/safaris'  // Added safaris directory
  ];
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`Creating directory: ${dir}`);
      fs.mkdirSync(dir, { recursive: true });
    } else {
      console.log(`Directory exists: ${dir}`);
      
      // Check if directory is writable
      try {
        fs.accessSync(dir, fs.constants.W_OK);
        console.log(`Directory ${dir} is writable`);
      } catch (error) {
        console.error(`WARNING: Directory ${dir} is not writable!`, error);
      }
    }
  });
  
  console.log('Directory setup complete');
}

module.exports = setupDirectories;
