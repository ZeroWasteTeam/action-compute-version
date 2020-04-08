
const fs = require('fs')

console.log("Hello from action");


try {
  const data = fs.readFileSync('version.txt', 'utf8')
  console.log(data)
} catch (err) {
  console.error(err)
}