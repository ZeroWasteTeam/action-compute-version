
const fs = require('fs')

console.log("Hello from action");

var fileName = 'version.txt'

if( ! fs.existsSync(fileName)) {
	throw new Error('The file '+fileName+ ' does not exists')
}

try {
  const data = fs.readFileSync(fileName, 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}