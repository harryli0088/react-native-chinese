export default function getRandomRestrictedSetIndex(restrictions, hskData, dictionaryMap) {
  if(restrictions.length > 0) { //if there are restrictions
    let count = 0 //tracks the number of sets we can pick from

    //count the number of sets we can choose from
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

    //randomly pick a set
    let randomRestrictedSetIndex = Math.floor(Math.random()*count) //randomly pick a set within the restrictions
    let restrictedIndex = 0
    let noInfiniteLoopCounter = 100 //this shouldn't get us an inifinite loop but we want to be safe
    let characters = ""
    while(noInfiniteLoopCounter > 0) {
      const level = restrictions[restrictedIndex%restrictions.length] //get the level to look at (with the modulo, we can loop back on the array if there is some bug)
      if(hskData[level]) { //if this level has been loaded
        if(hskData[level].vocab && hskData[level].vocab.length) { //if the vocab for this level has been loaded
          if(randomRestrictedSetIndex < hskData[level].vocab.length) { //if our restricted set index is now less than the length of this set
            characters = hskData[level].vocab[randomRestrictedSetIndex] //get the randomly chose characters
            break //break out of the loop
          }
          else { //else we need to move to the next set
            randomRestrictedSetIndex -= hskData[level].vocab.length //decrement by the number of sets we skipped over
          }
        }
        if(hskData[level].characters && hskData[level].characters.length) { //if the characters for this level has been loaded
          if(randomRestrictedSetIndex < hskData[level].characters.length) { //if our restricted set index is now less than the length of this set
            characters = hskData[level].characters[randomRestrictedSetIndex] //get the randomly chose characters
            break //break out of the loop
          }
          else { //else we need to move to the next set
            randomRestrictedSetIndex -= hskData[level].characters.length //decrement by the number of sets we skipped over
          }
        }
      }
      ++restrictedIndex //move to the next restriction
      --noInfiniteLoopCounter //decrement the no infinite loop counter
    }

    if(typeof characters==="string" && characters.length>0) { //if characters were chosen
      if(typeof dictionaryMap[characters] === "number") { //if the characters exist in our dictionary
        return dictionaryMap[characters] //set the new set index based on our restrictions
      }
    }
  }
  console.log("NULL")
  return null //we did not successfully find a restricted set index
}
