class Tracking {
  /**
   *  @description 轨迹点对象
   *   latitude: 28.23569,  纬度
   *   longitude: 112.884173,  经度
   *   time: '2024-10-6 17:38:38',  采集时间
   *   ds: 6.8574605994736855,  离上一点距离
   *   dh: 1,  离上一点采集时间距时
   *   s: 27.960638057493288,  离最近被计算为开始停留的点的距离
   *   h: 15.083333333333334,  离最近被计算为开始停留的点的采集时间差
   *   stayPathNo: 6,  一组point中被计算为开始停留的点的序号， 序号相同代表一组连续的停留点
   *   startStayIndex: 8   一组point中第一个超过5分钟的停留点的序号
   *
   **/
  constructor(points) {
    this.points = points.sort((a, b) => new Date(a.time) - new Date(b.time));
    let index = 0;
    let startStayIndex = 0;
    this.points.reduce((leftIndex, v, rightIndex) => {
      v.index = rightIndex;
      if (rightIndex > 0) {
        if (
          haversineDistance(this.points[rightIndex - 1], v) > 30 ||
          new Date(v.time) - new Date(this.points[rightIndex - 1].time) >
            2 * 60 * 1000
        ) {
          v.reconnect = true;
        }
        v.ds = haversineDistance(v, this.points[rightIndex - 1]);
        v.dh =
          Math.abs(
            new Date(this.points[rightIndex - 1].time) - new Date(v.time)
          ) /
          (60 * 1000);
      } else {
        v.ds = 0;
        v.dh = 0;
      }
      v.s = haversineDistance(v, this.points[leftIndex]);
      v.h =
        Math.abs(new Date(this.points[leftIndex].time) - new Date(v.time)) /
        (60 * 1000);
      const ds = haversineDistance(v, this.points[leftIndex]);
      if (ds <= 50) {
        if (
          Math.abs(new Date(this.points[leftIndex].time) - new Date(v.time)) >
          5 * 60 * 1000
        ) {
          // 标记第一个超过5分钟的point
          if (leftIndex === index) {
            v.startStayIndex = rightIndex;
            v.stayTime = v.h;
            startStayIndex = v.startStayIndex;
          }

          // 标记一组在停留时间超过5分钟，且运动距离不超过50m的连续point
          while (index <= rightIndex) {
            this.points[index].stayPathNo = leftIndex;
            this.points[startStayIndex].stayTime += this.points[index].dh;
            index++;
          }
        }
        return leftIndex;
      } else {
        index = rightIndex;
        return rightIndex;
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
  getStayPoints() {
    return this.points.filter((v) => v.stayPathNo !== undefined);
  }
  getReconnectPoints() {
    return this.points.filter((v) => v.reconnect);
  }
}
