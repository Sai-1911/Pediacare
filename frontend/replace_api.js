const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Replace "https://pediacare.onrender.com" and 'https://pediacare.onrender.com' with `${process.env.REACT_APP_API_URL}/...`
            content = content.replace(/(["'])http:\/\/pediacare.onrender.com([^"']*)(["'])/g, '`${process.env.REACT_APP_API_URL}$2`');
            
            // Replace `https://pediacare.onrender.com` with `${process.env.REACT_APP_API_URL}/...`
            content = content.replace(/`http:\/\/pediacare.onrender.com([^`]*)`/g, '`${process.env.REACT_APP_API_URL}$1`');

            if (content !== originalContent) {
                console.log('Updated', fullPath);
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

walkDir(srcDir);
