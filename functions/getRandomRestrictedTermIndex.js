/**
 * Given an array of HSK level restrictions, try to randomly pick a term
 * @param  {Array} restrictions  array of HSK levels as strings, ex ["1","2", ...]
 * @param  {Object} hskData       HSK data object
 * @param  {Object} dictionaryMap the dictionary.map object
 * @return {Object}               an object with format {index:Number,title:String} if a term within the restrictions was found, else empty object {}
 */
export default function getRandomRestrictedTermIndex(restrictions, hskData, dictionaryMap) {
  if(restrictions.length > 0) { //if there are restrictions
    let count = 0 //tracks the number of terms we can pick from

    //count the number of terms we can choose from
    restrictions.forEach(level => {
      if(hskData[level]) { //if this level has been loaded
        if(hskData[level].vocab && hskData[level].vocab.length) { //if the vocab for this level has been loaded
          count += hskData[level].vocab.length //increment by the total number of vocab
        }
        if(hskData[level].characters && hskData[level].characters.length) { //if the characters for this level has been loaded
          count += hskData[level].characters.length //increment by the total number of characters
        }
      }
    })

    //randomly pick a term
    let randomRestrictedTermIndex = Math.floor(Math.random()*count) //randomly pick a term within the restrictions
    let restrictedIndex = 0
    let noInfiniteLoopCounter = 100 //this shouldn't get us an inifinite loop but we want to be safe
    let chosenCharacters = ""
    let chosenLevel = ""
    while(noInfiniteLoopCounter > 0) {
      const level = restrictions[restrictedIndex%restrictions.length] //get the level to look at (with the modulo, we can loop back on the array if there is some bug)
      if(hskData[level]) { //if this level has been loaded
        if(hskData[level].vocab && hskData[level].vocab.length) { //if the vocab for this level has been loaded
          if(randomRestrictedTermIndex < hskData[level].vocab.length) { //if our restricted term index is now less than the length of this term
            chosenCharacters = hskData[level].vocab[randomRestrictedTermIndex] //get the randomly chose characters
            chosenLevel = level
            break //break out of the loop
          }
          else { //else we need to move to the next term
            randomRestrictedTermIndex -= hskData[level].vocab.length //decrement by the number of terms we skipped over
          }
        }
        if(hskData[level].characters && hskData[level].characters.length) { //if the characters for this level has been loaded
          if(randomRestrictedTermIndex < hskData[level].characters.length) { //if our restricted term index is now less than the length of this term
            chosenCharacters = hskData[level].characters[randomRestrictedTermIndex] //get the randomly chose characters
            chosenLevel = level
            break //break out of the loop
          }
          else { //else we need to move to the next term
            randomRestrictedTermIndex -= hskData[level].characters.length //decrement by the number of terms we skipped over
          }
        }
      }
      ++restrictedIndex //move to the next restriction
      --noInfiniteLoopCounter //decrement the no infinite loop counter
    }

    if(typeof chosenCharacters==="string" && chosenCharacters.length>0) { //if characters were chosen
      if(Array.isArray(dictionaryMap[chosenCharacters])) { //if the characters exist in our dictionary
        return {
          index: dictionaryMap[chosenCharacters][0], //return the first new term index based on our restrictions
          title: "HSK " + chosenLevel
        }
      }
    }
  }
  return {} //we did not successfully find a restricted term index
}
