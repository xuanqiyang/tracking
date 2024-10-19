class Tracking {
    constructor() {
        this.points = []
    }
    initTracking (points) {
        this.points = points.sort((a, b) => new Date(a.time) - new Date(b.time));
        this.points.forEach((v, pointIndex) => {
            if (pointIndex > 0) {
                v.dh = (new Date(v.time) - new Date(this.points[pointIndex - 1].time)) / (60 * 1000)
                v.ds = haversineDistance(this.points[pointIndex - 1], v)
                if (
                    v.ds > 30 ||
                    v.dh > 2
                ) {
                    v.reconnect = true;
                }
            }

            v.index = pointIndex
            let isStay = false
            let aroundPoints = []
            let stayPointIndex = pointIndex + 1
            for (; stayPointIndex < points.length && haversineDistance(v, this.points[stayPointIndex]) <= 50; stayPointIndex++) {
                const h = Math.abs(new Date(this.points[stayPointIndex].time) - new Date(v.time))
                // 超过5分钟了
                if (
                    h >
                    5 * 60 * 1000
                ) {
                    // 如果遇到超过了五分钟的第一个点,将其实点和到这个点的所有点加入到aroundPoints
                    if (!isStay) {
                        aroundPoints.push(...this.points.slice(pointIndex, stayPointIndex + 1))
                        isStay = true
                    } else {
                        // 加入后续停留的点
                        aroundPoints.push(this.points[stayPointIndex])
                    }
                }
            }
            if (aroundPoints.length) {
                let sumLongitude = 0
                let sumLatitude = 0
                aroundPoints.forEach((p) => {
                    sumLongitude += p.longitude
                    sumLatitude += p.latitude
                })
                // 求活动范围的中心点
                const centrePoint = {
                    longitude: sumLongitude / aroundPoints.length,
                    latitude: sumLatitude / aroundPoints.length
                }
                // 求活动范围中心点最近的点,将它作为停留点
                const nearestPointFromCentre = aroundPoints.reduce((nearest, point) => {
                    return haversineDistance(point, centrePoint) < haversineDistance(nearest, centrePoint) ? point : nearest
                })
                // 统计每次活动范围的活动时间,包含前五分钟的 如果活动范围的中心点相同,将会被累加,导致停留时间会超过实际运动时间
                nearestPointFromCentre.stayTime = (nearestPointFromCentre.stayTime || 0) + ((new Date(aroundPoints[aroundPoints.length - 1].time) - new Date(aroundPoints[0].time)) / (1000 * 60))
                // 本次活动的起点-终点的运动距离
                nearestPointFromCentre.distance = haversineDistance(v,this.points[stayPointIndex - 1]);
            }
        })
    }
    getStartPoint () {
        return this.points[0];
    }
    getPath () {
        return this.points;
    }
    getStartStayPoints () {
        return this.points.filter((v) => v.stayTime);
    }
    getStayPoints () {
        return this.points.filter((v) => v.stayPathNo !== undefined);
    }
    getReconnectPoints () {
        return this.points.filter((v) => v.reconnect);
    }
}