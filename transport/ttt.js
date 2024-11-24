const fs = require('fs');
const path = require('path');

// Helper function to convert camelCase to UPPER_SNAKE_CASE
function toSnakeCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
}

// Replace in a single file
function replaceInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
        /config\.get\('([a-zA-Z0-9]+)'\)/g,
        (_, key) => `process.env.${toSnakeCase(key)}`
    );
    fs.writeFileSync(filePath, updatedContent, 'utf8');
}

// Traverse and process all `.js` files in a directory
function traverseDirectory(dirPath) {
    fs.readdirSync(dirPath).forEach((file) => {
        const filePath = path.join(dirPath, file);
        if (fs.statSync(filePath).isDirectory()) {
            traverseDirectory(filePath);
        } else if (filePath.endsWith('.js')) {
            replaceInFile(filePath);
        }
    });
}

// Set your project directory
const directoryPath = './services'; // Change to your project's source directory
traverseDirectory(directoryPath);
