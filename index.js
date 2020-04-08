
const fs = require('fs');
const Regex = require('regex');
const core = require('@actions/core');

console.log("Hello from action");

if( ! fs.existsSync(fileName)) {
	throw new Error('The file '+fileName+ ' does not exists')
}

try {
  var version = fs.readFileSync(fileName, 'utf8');
  version = version.trim();
  if(!version.match(/^\d+\.\d+$/)) throw new Error("The "+version+" is not of the format MAJOR.MINOR");
  if (version == '0.0') throw new Error('0.0 is not a valid version. Either major version or minor version has to be non zero');
  if (version.match(/^0\d+\./)) throw new Error("Major version can not be prefixed with 0");
  if (version.match(/\.0\d+$/)) throw new Error("Minor version can not be prefixed with 0");
  core.setOutput("version",version);	
} catch (err) {
  console.error(err)
}
