// 接近 O(N^2)
class Tracking {
  constructor() {
    this.points = [];
  }
  initTracking(points) {
    this.points = points.sort((a, b) => new Date(a.time) - new Date(b.time));
    /**
     * @params endStayPointIndex 上一次计算活动路线的结束点
     */
    this.points.reduce((endStayPointIndex, v, pointIndex) => {
      if (pointIndex > 0) {
        v.dh =
          (new Date(v.time) - new Date(this.points[pointIndex - 1].time)) /
          (60 * 1000);
        v.ds = haversineDistance(this.points[pointIndex - 1], v);
        if (v.ds > 30 || v.dh > 2) {
          v.reconnect = true;
        }
      }

      v.index = pointIndex;
      let startStayPointIndex = 0;
      let stayPointIndex = pointIndex + 1;
      for (
        ;
        stayPointIndex < points.length &&
        haversineDistance(v, this.points[stayPointIndex]) <= 50;
        stayPointIndex++
      ) {
        const h = Math.abs(
          new Date(this.points[stayPointIndex].time) - new Date(v.time)
        );
        if (h > 5 * 60 * 1000) {
          if (startStayPointIndex !== stayPointIndex) {
            startStayPointIndex = stayPointIndex;
          }
        }
      }
      const aroundPoints = this.points.slice(pointIndex, stayPointIndex);
      if (aroundPoints.length) {
        let sumLongitude = 0;
        let sumLatitude = 0;
        aroundPoints.forEach((p) => {
          sumLongitude += p.longitude;
          sumLatitude += p.latitude;
        });
        const centrePoint = {
          longitude: sumLongitude / aroundPoints.length,
          latitude: sumLatitude / aroundPoints.length,
        };
        const nearestPointFromCentre = aroundPoints.reduce((nearest, point) => {
          return haversineDistance(point, centrePoint) <
            haversineDistance(nearest, centrePoint)
            ? point
            : nearest;
        });
        // 为了解决活动范围重合部分的停留时间stayTime被累计计算,每次都记录上一次活动范围的终点,最后只计算上一次活动路线终点->本次活动路线终点的所用时间
        nearestPointFromCentre.stayTime =
          (nearestPointFromCentre.stayTime || 0) +
          (new Date(this.points[stayPointIndex - 1].time) -
            new Date(this.points[endStayPointIndex].time)) /
            (1000 * 60);
      }
      // 本次计算活动路线的终点
      return stayPointIndex - 1;
    }, 0);
  }
  getStartPoint() {
    return this.points[0];
  }
  getPath() {
    return this.points;
  }
  getStartStayPoints() {
    return this.points.filter((v) => v.stayTime);
  }
  getStayPoints() {
    return this.points.filter((v) => v.stayPathNo !== undefined);
  }
  getReconnectPoints() {
    return this.points.filter((v) => v.reconnect);
  }
}
