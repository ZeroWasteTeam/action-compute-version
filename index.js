
const fs = require('fs');
const Regex = require('regex');

console.log("Hello from action");

var fileName = 'version.txt'

if( ! fs.existsSync(fileName)) {
	throw new Error('The file '+fileName+ ' does not exists')
}

try {
  var version = fs.readFileSync(fileName, 'utf8');
  version = version.trim();
  var versionRegex = /^\d+\.\d+$/
  if(!version.match(versionRegex)) throw new Error("The "+version+" is not of the format MAJOR.MINOR");
  console.log(">"+version+"<");	
} catch (err) {
  console.error(err)
}