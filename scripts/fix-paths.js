const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace absolute paths with relative paths
  content = content.replace(/href="\/_next/g, 'href="./_next');
  content = content.replace(/src="\/_next/g, 'src="./_next');
  content = content.replace(/href="\/launcher\.png/g, 'href="./launcher.png');
  content = content.replace(/src="\/launcher\.png/g, 'src="./launcher.png');

  // Fix webpack module system paths
  content = content.replace(/"\/(_next[^"]+)"/g, '"./$1"');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed paths in: ${filePath}`);
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.html') || file.endsWith('.js')) {
      replaceInFile(filePath);
    }
  });
}

console.log('Fixing paths in output directory...');
walkDir(outDir);
console.log('Done!');
