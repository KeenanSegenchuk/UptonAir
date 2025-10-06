export default class DataCompressor{
  constructor() {this.seen = new Map();}

  perpendicularDistance(point, lineStart, lineEnd) {
    const [x, y] = point;
    const [x1, y1] = lineStart;
    const [x2, y2] = lineEnd;

    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
      // lineStart and lineEnd are the same point
      return Math.hypot(x - x1, y - y1);
    }

    // area of parallelogram divided by base length = height
    return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / Math.hypot(dx, dy);
  }

  compress(pointList, epsilon) {
    //ramer-douglas-peucker series compression
    if (pointList.length < 3) {
      return pointList;
    }

    let dmax = 0;
    let index = 0;
    const end = pointList.length - 1;

    // Find the point with the maximum distance
    for (let i = 1; i < end; i++) {
      const d = this.perpendicularDistance(pointList[i], pointList[0], pointList[end]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }

    let resultList;

    // If max distance is greater than epsilon, recursively simplify
    if (dmax > epsilon) {
      const recResults1 = this.compress(pointList.slice(0, index + 1), epsilon);
      const recResults2 = this.compress(pointList.slice(index), epsilon);

      // Concat results, removing the duplicate point at the junction
      resultList = recResults1.slice(0, -1).concat(recResults2);
    } else {
      resultList = [pointList[0], pointList[end]];
    }

    return resultList;
  }
  
  get(series, epsilon) {
    //returns RDP-compressed series for given raw series and epsilon
    let res = this.seen.get(series)?.[epsilon];

    if(!res) {
      //compress series and save to seen 
      res = this.compress(series.data, epsilon);
      (this.seen.get(series) ?? this.seen.set(series, {}).get(series))[epsilon] = res;
    }

    return res;
  }
}
