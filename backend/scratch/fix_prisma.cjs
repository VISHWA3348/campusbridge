const fs = require('fs');
const path = require('path');

const filesToFix = [
  'services/referralService.js',
  'services/placementService.js',
  'routes/student.js',
  'routes/jobs.js',
  'routes/global.js',
  'routes/auth.js',
  'routes/analytics.js',
  'routes/alumni.js',
  'routes/admin.js'
];

filesToFix.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace require syntax
    content = content.replace(/const\s+\{\s*PrismaClient\s*\}\s*=\s*require\(['"]@prisma\/client['"]\);?\n?/g, '');
    
    // Replace import syntax
    content = content.replace(/import\s+\{\s*PrismaClient\s*\}\s*from\s*['"]@prisma\/client['"];?\n?/g, '');
    
    // Replace new PrismaClient
    content = content.replace(/const\s+prisma\s*=\s*new\s+PrismaClient\(\);?/g, "import prisma from '../prisma/db.js';");
    
    fs.writeFileSync(filePath, content);
    console.log('Fixed ' + file);
  }
});
