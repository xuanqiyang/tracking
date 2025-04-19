class PointsCutter {
  static MaxZoom = 21;
  static MinZoom = 3;
  static NumLimitInZoom = {
    3: 10,
    4: 100,
    5: 200,
    6: 300,
    7: 400,
    8: 500,
    9: 600,
    10: 700,
    11: 800,
    12: 900,
    13: 1000,
    14: 2000,
    15: 3000,
    16: 4000,
    17: 5000,
    18: 6000,
    19: 7000,
    20: 8000,
    21: 10000,
  };
  constructor() {
    this.cachePoints = new Set();
  }
  getPoints(points, bound, zoom) {
    let cutPoints = [];
    // 筛选比zoom层级小的points
    const overZoomPoints = points.filter((v) => zoom <= v.zoomLevel);
    // 最大比例尺1:20米,直接返回按边界截取的所有overZoomPoints
    if (zoom === PointsCutter.MaxZoom) {
      cutPoints = filterByBound(overZoomPoints, bound);
    } else {
      // 最小比例尺 1:1000公里,直接返回所有overZoomPoints
      cutPoints =
        zoom === PointsCutter.MinZoom
          ? overZoomPoints
          : filterByBound(overZoomPoints, bound);
    }
    return cutPoints;
  }
  // 按照边界和缩放层级获取点, 并迭代执行方法
  iterBySteps(points, bound, zoom, method) {
    const cutPoints = this.getPoints(points, bound, zoom);
    const steps = getSteps(cutPoints.length, PointsCutter.NumLimitInZoom[zoom]);
    for (
      let i = 0;
      i < PointsCutter.NumLimitInZoom[zoom] && i * steps < cutPoints.length;
      i++
    ) {
      if (method) {
        method(cutPoints[Math.floor(i * steps)]);
      }
    }
  }
}

// 从s个中均匀取出n个所需的步长
function getSteps(s, n) {
  if (n <= 0 || s <= 0) {
    return 0;
  }
  if (n >= s) {
    return 1;
  }
  if (n === 1) {
    return Math.floor(s / 2);
  }
  return (s - 1) / (n - 1);
}
/*
 * @description 根据经纬度范围过滤坐标点
 * @param {Array} points 坐标点数组
 * @param {Array} bound 经纬度范围[东北角, 西南角]
 * @return {Array} 过滤后的坐标点数组
 */
function filterByBound(points, bound) {
  const sortedPoints = [...points].sort((a, b) => a.latitude - b.latitude);
  // 先对points完成纬度上的切割
  let startLatIndex = binarySearch(sortedPoints, bound[1].latitude, "latitude");
  let endLatIndex = binarySearch(
    sortedPoints,
    bound[0].latitude,
    "latitude",
    true
  );
  const latFilteredPoints = sortedPoints
    .slice(startLatIndex, endLatIndex + 1)
    .sort((a, b) => a.longitude - b.longitude);
  // 边界露出国际日期变更线180|-180度 ,或者0度线, 或者经纬度跨度超过180度的情况,需要分段截取
  // 这个时候地图左边界西南角的经度大于右边界东北角的经度
  const turnOverLongitude = bound[1].longitude > bound[0].longitude;
  if (turnOverLongitude) {
    // bound[1].longitude到东经180度(即180度)的,从西到东,向左二分找到小于边界经度的最大点
    let startLngIndex = binarySearch(
      latFilteredPoints,
      bound[1].longitude,
      "longitude"
    );
    // bound[0].longitude到西经180度(即-180度)的,从东到西,向右二分找到大于边界经度的最小点
    let endLngIndex = binarySearch(
      latFilteredPoints,
      bound[0].longitude,
      "longitude",
      true
    );
    return latFilteredPoints
      .slice(startLngIndex)
      .concat(latFilteredPoints.slice(0, endLngIndex + 1));
  } else {
    let startLngIndex = binarySearch(
      latFilteredPoints,
      bound[1].longitude,
      "longitude"
    );
    let endLngIndex = binarySearch(
      latFilteredPoints,
      bound[0].longitude,
      "longitude",
      true
    );
    return latFilteredPoints.slice(startLngIndex, endLngIndex + 1);
  }
}
function add(arg1, arg2) {
  if (
    arg1 === null ||
    arg2 === null ||
    arg1 === undefined ||
    arg2 === undefined
  ) {
    return null;
  }
  let r1, r2;
  try {
    r1 = arg1.toString().split(".")[1].length;
  } catch (e) {
    r1 = 0;
  }
  try {
    r2 = arg2.toString().split(".")[1].length;
  } catch (e) {
    r2 = 0;
  }
  const m = Math.pow(10, Math.max(r1, r2));
  const n = r1 >= r2 ? r1 : r2;
  return Number(((arg1 * m + arg2 * m) / m).toFixed(n));
}
function makeRange(arr) {
  const newArr = [];
  arr.reduce((s, v, i) => {
    newArr[i] = [];
    newArr[i].push(s);
    s = add(s, v);
    newArr[i].push(s);
    return s;
  }, 0);
  return newArr;
}

// 生成在边界bound中num数量的随机经纬度点
function getRandomPoints(bound, num) {
  const ZoomLevelRatio = [
    10 / 1000000,
    20 / 1000000,
    50 / 1000000,
    100 / 1000000,
    150 / 1000000,
    200 / 1000000,
    10000 / 1000000,
    20000 / 1000000,
    30000 / 1000000,
    40000 / 1000000,
    50000 / 1000000,
    60000 / 1000000,
    70000 / 1000000,
    80000 / 1000000,
    90000 / 1000000,
    100000 / 1000000,
    110000 / 1000000,
    120000 / 1000000,
    219470 / 1000000,
  ];
  let points = [];
  const range = makeRange(ZoomLevelRatio);
  for (let i = 0; i < num; i++) {
    let latitude = Number(
      (
        Math.random() * (bound[0].latitude - bound[1].latitude) +
        bound[1].latitude
      ).toFixed(6)
    );
    let longitude = Number(
      (
        Math.random() * (bound[1].longitude - bound[0].longitude) +
        bound[0].longitude
      ).toFixed(6)
    );

    let n = Math.random();
    let index = range.findIndex((v) => n >= v[0] && n < v[1]);
    points.push({ latitude, longitude, zoomLevel: index + 3 });
  }
  return points;
}
function binarySearch(arr, target, key, isRight) {
  let left = 0;
  let right = arr.length - 1;
  let index = -1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (isRight) {
      // 找小于等于它的最大值
      if (arr[mid][key] <= target) {
        index = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    } else {
      // 找大于等于它的最小值
      if (arr[mid][key] >= target) {
        index = mid;
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
  }
  return index;
}
