import { AsyncStorage } from 'react-native';

export const getAsyncStorage = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch (err) {
    console.log("AsyncStorage get error", key, err)
    return null
  }
};


export const setAsyncStorage = async (key, value) => {
  try {
    return await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.log("AsyncStorage set error", key, value, err)
    return null
  }
};
