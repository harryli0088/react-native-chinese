export default function uniqueMergeArrays(arr1, arr2) {
  console.log("arr1, arr2",arr1, arr2)
  const concat = arr1.concat(arr2)
  //use a double for loop to remove duplicate elements
  for(let i=0; i<concat.length; ++i) {
    for(let j=i+1; j<concat.length; ++j) {
      if(concat[i] === concat[j]) {
        concat.splice(j, 1) //remove the element
        --j //decrement the j counter sicne we just deleted the item
      }
    }
  }
  console.log("concat",concat)
  return concat
}
