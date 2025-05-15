const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');

// Get all SVG files
const svgFiles = fs.readdirSync(imagesDir)
  .filter(file => file.endsWith('.svg'));

svgFiles.forEach(file => {
  const filePath = path.join(imagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Increase stroke-width
  content = content.replace(/stroke-width="([^"]+)"/g, (match, width) => {
    const newWidth = parseFloat(width) + 1;
    return `stroke-width="${newWidth}"`;
  });
  
  // For elements without stroke-width but with stroke
  content = content.replace(/<([^>]+)stroke="([^"]+)"([^>]*)>/g, (match, prefix, stroke, suffix) => {
    if (!suffix.includes('stroke-width')) {
      return `<${prefix}stroke="${stroke}"${suffix} stroke-width="1">`;
    }
    return match;
  });
  
  // Add stroke-width to paths without it
  content = content.replace(/<path([^>]*)>/g, (match, attrs) => {
    if (attrs.includes('stroke=') && !attrs.includes('stroke-width=')) {
      return `<path${attrs} stroke-width="1">`;
    }
    return match;
  });
  
  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});

console.log('All SVG files updated with increased stroke width.'); 