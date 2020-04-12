import { Audio } from 'expo-av';
import soundMap from "./soundMap"

Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
})

/**
 * tries to play pinyin audio
 * @param  {String} pinyinNumbers space separated array of pinyin numbers, ex: "Zhong1 wen2"
 * @return {Void}
 */
export default async function playAudio(pinyinNumbers) {
  const split = pinyinNumbers.trim().toLowerCase().split(" ") //trim and split the string into an array of strings

  for(let i=0; i<split.length; ++i) {
    if(split[i].length > 0) { //if there is a pinyin to try to play
      await playOnePinyinNumber(split[i])
    }
  }
}

async function playOnePinyinNumber(pinyinNumber) {
  return new Promise(async function(resolve, reject) {
    console.log("trying to play", pinyinNumber)

    if(soundMap[pinyinNumber]) { //if this sound exists
      const playbackObject = new Audio.Sound();
      playbackObject.setOnPlaybackStatusUpdate(playbackStatus => { //https://docs.expo.io/versions/latest/sdk/av/#example-setonplaybackstatusupdate
        if(playbackStatus.isLoaded) { //if the file is loaded
          if(playbackStatus.didJustFinish && !playbackStatus.isLooping) { //if we just finished AND we are not looping
            resolve() //now resolve the promise
          }
        }
      })
      await playbackObject.loadAsync(soundMap[pinyinNumber]);
      await playbackObject.setRateAsync(1.5, true, Audio.PitchCorrectionQuality.Medium)
      await playbackObject.playAsync()
    }
    else {
      throw new Error("The sound for " + pinyinNumber + " does not exist")
    }
  }).catch(err => {
    console.log("error playing file", err)
    reject()
  })
}
