export default function transformArrayToObjectFormat(points, scale=1) {
  return points.map(p => //convert the array of medians for the stroke from [x,y] array format into {x:x, y:y} key-value format
    ({
      x: scale*p[0], //scale the coordinates
      y: scale*p[1] //scale the coordinates
    })
  )
}

//TODO convert medians to x y by default
