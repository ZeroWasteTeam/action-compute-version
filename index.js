
const fs = require('fs')

console.log("Hello from action");

var fileName = 'version.txt'

if( ! fs.existsSync(fileName)) {
	throw new Error('The file '+fileName+ ' does not exists')
}

try {
  var version = fs.readFileSync(fileName, 'utf8');
  version = version.trim();
  console.log(">"+version+"<");	
} catch (err) {
  console.error(err)
}