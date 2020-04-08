
const fs = require('file-system')

console.log("Hello from action");


try {
  const data = fs.readFileSync('version.txt', 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}