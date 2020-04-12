/**
 * Given 2 arrays, returns a single array with only unique elements (duplicate elements are spliced out)
 * @param  {Array} arr1 first array
 * @param  {Array} arr2 second array
 * @return {Array}      unique concat-ed array
 */
export default function uniqueMergeArrays(arr1=[], arr2=[]) {
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

  return concat
}
