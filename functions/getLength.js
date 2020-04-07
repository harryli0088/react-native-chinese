export default function getLength(points) {
  let x = points[0].x
  let y = points[0].y
  return points.reduce((acc, p) => {
    const distance = Math.hypot(p.x-x, p.y-y)
    x = p.x
    y = p.y
    return acc + distance
  }, 0)
}
