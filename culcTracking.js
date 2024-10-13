// 接近 O(N^2)
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
            let startStayPointIndex = 0
            let aroundPoints = []
            let stayPointIndex = pointIndex + 1
            for (; stayPointIndex < points.length && haversineDistance(v, this.points[stayPointIndex]) <= 50; stayPointIndex++) {
                const h = Math.abs(new Date(this.points[stayPointIndex].time) - new Date(v.time))
                if (
                    h >
                    5 * 60 * 1000
                ) {
                    if (startStayPointIndex !== stayPointIndex) {
                        aroundPoints.push(...this.points.slice(pointIndex, stayPointIndex + 1))
                        startStayPointIndex = stayPointIndex
                    } else {
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
                const centrePoint = {
                    longitude: sumLongitude / aroundPoints.length,
                    latitude: sumLatitude / aroundPoints.length
                }
                const nearestPointFromCentre = aroundPoints.reduce((nearest, point) => {
                    return haversineDistance(point, centrePoint) < haversineDistance(nearest, centrePoint) ? point : nearest
                })
                nearestPointFromCentre.stayTime = (nearestPointFromCentre.stayTime || 0) + ((new Date(aroundPoints[aroundPoints.length - 1].time) - new Date(aroundPoints[0].time)) / (1000 * 60))
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