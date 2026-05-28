import fs from 'fs';
import path from 'path';

const searchStr1 = `(process.env.NEXT_PUBLIC_API_URL || 'https://campusbridge-e4cv.onrender.com/api')`;
const replaceStr1 = `(process.env.NEXT_PUBLIC_API_URL ? (process.env.NEXT_PUBLIC_API_URL.endsWith('/api') ? process.env.NEXT_PUBLIC_API_URL : process.env.NEXT_PUBLIC_API_URL + '/api') : 'https://campusbridge-e4cv.onrender.com/api')`;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            if (content.includes(searchStr1)) {
                content = content.split(searchStr1).join(replaceStr1);
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDir(path.join(process.cwd(), 'src'));
console.log('Done.');
