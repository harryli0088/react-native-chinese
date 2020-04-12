const fs = require('fs')
const pathToSounds = "../assets/sounds/"
let fileContent = "export default soundMap = {\n"

fs.readdirSync(pathToSounds).forEach(function(file) {
  fileContent += "\t" + file.slice(0, file.indexOf(".")) +": require('"+pathToSounds+file+"'),\n"
})
fileContent += "}\n"
console.log(fileContent)

fs.writeFile(
  "./soundMap.js",
  fileContent,
  function(err) {
    if(err) {
      return console.log(err);
    }
    console.log("The file was saved!");
  }
);
