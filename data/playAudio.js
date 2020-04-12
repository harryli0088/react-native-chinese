import { Audio } from 'expo-av';
import soundMap from "./soundMap"

/**
 * tries to play pinyin audio
 * @param  {String} pinyinNumbers space separated array of pinyin numbers, ex: "Zhong1 wen2"
 * @return {Void}
 */
export default async function playAudio(pinyinNumbers) {
  const split = pinyinNumbers.trim().toLowerCase().split(" ") //trim and split the string into an array of strings

  for(let i=0; i<split.length; ++i) {
    await playOnePinyinNumber(split[i])
  }
}

async function playOnePinyinNumber(pinyinNumber) {
  return new Promise(async function(resolve, reject) {
    if(soundMap[pinyinNumber]) { //if this sound exists
      const soundObject = new Audio.Sound();
      soundObject.setOnPlaybackStatusUpdate(playbackStatus => { //https://docs.expo.io/versions/latest/sdk/av/#example-setonplaybackstatusupdate
        if(playbackStatus.isLoaded) { //if the file is loaded
          if(playbackStatus.didJustFinish && !playbackStatus.isLooping) { //if we just finished AND we are not looping
            resolve() //now resolve the promise
          }
        }
      })
      console.log("trying to play", pinyinNumber)

      await soundObject.loadAsync(soundMap[pinyinNumber]);
      await soundObject.playAsync()
    }
    else {
      throw new Error("The sound for " + pinyinNumber + " does not exist")
    }
  }).catch(err => {
    console.log("error playing file", err)
    reject()
  })
}
