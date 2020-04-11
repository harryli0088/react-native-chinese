const dictionary = require("../chineseOutput.json")
const fs = require('fs');

function readModuleFile(path, callback) {
    try {
        var filename = require.resolve(path);
        fs.readFile(filename, 'utf8', callback);
    } catch (e) {
        callback(e);
    }
}



[
  "./hsk1-vocab.txt",
  "./hsk2-vocab.txt",
  "./hsk3-vocab.txt",
  "./hsk4-vocab.txt",
  "./hsk5-vocab.txt",
  "./hsk6-vocab.txt",
].forEach(fileName => {
  readModuleFile(fileName, function (err, hsk) {
    countInDictionary(hsk, fileName)
  });
})


[
  "./hsk1-characters.txt",
  "./hsk2-characters.txt",
  "./hsk3-characters.txt",
  "./hsk4-characters.txt",
  "./hsk5-characters.txt",
  "./hsk6-characters.txt",
].forEach(fileName => {
  readModuleFile(fileName, function (err, hsk) {
    countInDictionary(hsk, fileName)
  });
})


function countInDictionary(hsk, fileName) {
  let count = 0
  const hskSplit = hsk.split("\n")
  hskSplit.forEach(line => {
    if(typeof dictionary.map[ line.trim() ] === "number") {
      count++
    }
  })

  const total = hskSplit.length

  console.log(fileName, "count", count, total, count/total)
}
