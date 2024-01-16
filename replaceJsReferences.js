const fs = require('fs');
const path = require('path');

const prodBuildDir = './prod_build'; // Adjust the path to your production build directory
const indexPath = path.join(prodBuildDir, 'index.html');

fs.readFile(indexPath, 'utf8', function (err, data) {
    if (err) {
        return console.error(err);
    }

    const result = data.replace(/src="([^"]+).js"/g, 'src="$1.min.js"');

    fs.writeFile(indexPath, result, 'utf8', function (writeErr) {
        if (writeErr) return console.error(writeErr);
        console.log('Updated index.html with .min.js references');
    });
});
