const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../client/assets/images');
const oldName = 'Fevicon.jpg';
const newName = 'icon.png';

const oldPath = path.join(imagesDir, oldName);
const newPath = path.join(imagesDir, newName);

if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log(`Renamed ${oldName} to ${newName}`);
} else {
  console.log(`${oldName} does not exist.`);
}
