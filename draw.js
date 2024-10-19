class DrawMap {
  constructor(container, { center, zoom = 19 }) {
    // 创建地图实例
    this.map = new BMapGL.Map(container, {
      enableRotate: false,
      enableTilt: false,
    });
    var point = new BMapGL.Point(center.longitude, center.latitude);
    this.map.centerAndZoom(point, zoom);
    this.map.enableScrollWheelZoom(true);
    this.marketSet = new Set();
  }

  drawLine(points, color) {
    color = color ? color : "blue";
    var node = new BMapGL.Icon(
      "//mapopen-pub-jsapigl.bj.bcebos.com/demoimg/zhongheyiyuan.png",
      new BMapGL.Size(11, 11),
      {
        offset: new BMapGL.Size(5, 5),
      }
    );

    //创建折线
    var polyline = new BMapGL.Polyline(
      points.map((p) => new BMapGL.Point(p.longitude, p.latitude)),
      {
        strokeStyle: "dashed",
        strokeTexture: {
          url: `https://mapopen-pub-jsapigl.bj.bcebos.com/svgmodel/Icon_road_${color}_arrow.png`,
          width: 16,
          height: 64,
        },
        strokeWeight: 8,
        strokeOpacity: 0.8,
        node: node,
      }
    );
    this.map.addOverlay(polyline);
  }
  drawPath(points) {
    this.drawLine(points);
    points.forEach((p, i) => {
      if (p.reconnect) {
        this.drawLine([points[i - 1], p], "red");
      }
    });
  }
  clear() {
    this.map.clearOverlays();
    this.marketSet.clear();
  }
  drawMarker({ point, text, color, offset = [0, -20], cache = true }) {
    if (cache && this.marketSet.has(point)) {
      return;
    } else {
      this.marketSet.add(point);
    }
    var marker = new BMapGL.Marker(
      new BMapGL.Point(point.longitude, point.latitude),
      {
        title: point.time || "",
      }
    );
    if (text) {
      // 创建文本标注
      var label = new BMapGL.Label(text, {
        position: new BMapGL.Point(point.longitude, point.latitude),
        offset: new BMapGL.Size(...offset),
      });
      label.setStyle({
        // 设置label的样式
        color: color || "#000",
        fontSize: "10px",
        border: "1px solid #1E90FF",
      });
      this.map.addOverlay(label);
    }
    this.map.addOverlay(marker);
  }
}
