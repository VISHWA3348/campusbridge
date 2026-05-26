const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, '..', 'frontend', 'src');
const target = 'http://localhost:5000/api';
const replacement = 'https://campusbridge-e4cv.onrender.com/api';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(directory);
console.log(`Found ${files.length} TypeScript files to scan.`);

let modifiedCount = 0;
files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(target)) {
    // Also handle replacing double process.env fallback logic cleanly if possible
    // like replacing 'http://localhost:5000/api' with 'https://campusbridge-e4cv.onrender.com/api'
    content = content.split(target).join(replacement);
    
    // Also safeguard/fix standard process.env check to filter out empty/invalid relative paths like '/api'
    // For example, if we have process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api'
    // but to keep it simple and safe, replacing the fallback string is perfect.
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    modifiedCount++;
  }
});

console.log(`Replacement completed. Modified ${modifiedCount} files.`);
