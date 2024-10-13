

const ZoomLevel = {
    4: {
        minNum: 5,
        maxNum: 100,
    },
    5: {
        minNum: 30,
        maxNum: 200,
    },
    6: {
        minNum: 30,
        maxNum: 300,
    },
    7: {
        minNum: 30,
        maxNum: 400,
    },
    8: {
        minNum: 30,
        maxNum: 500,
    },
    9: {
        minNum: 30,
        maxNum: 600,
    },
    10: {
        minNum: 30,
        maxNum: 700,
    },
    11: {
        minNum: 30,
        maxNum: 800,
    },
    12: {
        minNum: 30,
        maxNum: 900,
    },
    13: {
        minNum: 30,
        maxNum: 1000,
    },
    14: {
        minNum: 30,
        maxNum: 2000,
    },
    15: {
        minNum: 30,
        maxNum: 3000,
    },
    16: {
        minNum: 30,
        maxNum: 4000,
    },
    17: {
        minNum: 30,
        maxNum: 5000,
    },
    18: {
        minNum: 30,
        maxNum: 6000
    },
    19: {
        minNum: 30,
        maxNum: 7000,
    },
    20: {
        minNum: 30,
        maxNum: 8000,
    },
    21: {
        minNum: 30,
        maxNum: 10000,
    },
};
class PointsCutter {
    constructor() {
        this.cachePoints = new Set()
    }
    filterByZoom (points, bound, zoom) {
        console.log(zoom)
        let cutPoints = [];
        // 最大比例尺,直接返回按边界截取的所有points
        if (zoom === 21) {
            cutPoints = this.filterByBound(points, bound);
        } else {
            cutPoints = (zoom === 4 ? points : this.filterByBound(points, bound));
        }
        console.log('cutPoints', cutPoints, bound)
        return getLimitPoints(cutPoints, ZoomLevel[zoom].maxNum)
    }
    /*
     * @description 根据经纬度范围过滤轨迹点
     * @param {Array} points 轨迹点数组
     * @param {Array} bound 经纬度范围[东北角, 西南角]
     * @return {Array} 过滤后的轨迹点数组
     */
    filterByBound (points, bound) {
        const sortedPoints = [...points].sort((a, b) => a.latitude - b.latitude);
        let startIndex = binarySearch(sortedPoints, bound[1].latitude, "latitude");
        let endIndex = binarySearch(sortedPoints, bound[0].latitude, "latitude", true);
        const latFilteredPoints = sortedPoints
            .slice(startIndex, endIndex + 1)
            .sort((a, b) => a.longitude - b.longitude);
        const maxLongitude = Math.max(bound[0].longitude, bound[1].longitude)
        const minLongitude = Math.min(bound[0].longitude, bound[1].longitude)
        startIndex = binarySearch(latFilteredPoints, minLongitude, "longitude");
        endIndex = binarySearch(
            latFilteredPoints,
            maxLongitude,
            "longitude",
            true
        );
        return latFilteredPoints.slice(startIndex, endIndex + 1);
    }
}

// 生成在边界bound中num数量的随机经纬度点
function getRandomPoints (bound, num) {
    let points = [];
    for (let i = 0; i < num; i++) {
        let latitude = Number((Math.random() * (bound[0].latitude - bound[1].latitude) + bound[1].latitude).toFixed(6));
        let longitude = Number((Math.random() * (bound[1].longitude - bound[0].longitude) + bound[0].longitude).toFixed(6));
        points.push({ latitude, longitude });
    }
    return points;
}
function getLimitPoints (points, n) {
    if (n <= 0) {
        return []
    }
    if (n >= points.length) {
        return points;
    }
    const s = points.length;
    if (n === 1) {
        return [points[Math.floor(s / 2)]];
    }
    const selectedPoints = []
    // 计算间隔
    const interval = (s - 1) / (n - 1);
    for (let i = 0; i < n; i++) {
        const index = Math.floor(i * interval);
        selectedPoints.push(points[index]);
    }
    return selectedPoints;
}
function binarySearch (arr, target, key, isRight) {
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
