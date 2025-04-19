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
      // 计算重连点
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
      let stayPointIndex = pointIndex + 1;
      let isStay = false;
      // 统计起始点到下一运动点的距离是否在50米内
      for (
        ;
        stayPointIndex < points.length &&
        haversineDistance(v, this.points[stayPointIndex]) <= 50;
        stayPointIndex++
      ) {
        const dt =
          Math.abs(
            new Date(this.points[stayPointIndex].time) - new Date(v.time)
          ) /
          (60 * 1000);
        // 超过五分钟了
        if (dt > 5) {
          isStay = true;
        }
      }
      if (isStay) {
        // aroundPoints: 本次活动范围内的点, 不包含stayPointIndex这个点
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
          const nearestPointFromCentre = aroundPoints.reduce(
            (nearest, point) => {
              return haversineDistance(point, centrePoint) <
                haversineDistance(nearest, centrePoint)
                ? point
                : nearest;
            }
          );
          /** 
            * 为了解决活动范围重合部分的停留时间stayTime被累计计算,
            * 每次都记录上一次活动范围的终点,最后只计算上一次活动路线终点->本次活动路线终点的所用时间.
            * 这个算法带来的问题就是如果有多次连续的停留活动,
            * 除了第一次,后续的每次只会统计与上一次运动终点到本次运动终点的时间,即在计算上有的停留点停留时间统计的是超5分钟后的继续停留时间,
            * 可能在数值上不足五分钟
           **/
          nearestPointFromCentre.stayTime =
            (nearestPointFromCentre.stayTime || 0) +
            (new Date(this.points[stayPointIndex - 1].time) -
              new Date(this.points[endStayPointIndex].time)) /
              (1000 * 60);
          nearestPointFromCentre.distance = haversineDistance(
            v,
            this.points[stayPointIndex - 1]
          );
        }
        // 本次计算活动路线的终点
        return stayPointIndex - 1;
      } else {
        // 本轮活动范围在5分钟内超过了50m,直接返回下一个活动范围的起点作为本次活动的终点
        return pointIndex + 1;
      }
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
  getReconnectPoints() {
    return this.points.filter((v) => v.reconnect);
  }
}
