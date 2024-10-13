class DrawMap {
  constructor(container, centalPoint) {
    // 创建地图实例
    this.map = new BMapGL.Map(container, {
      enableRotate: false,
      enableTilt: false,
    });
    var point = new BMapGL.Point(centalPoint.longitude, centalPoint.latitude);
    this.map.centerAndZoom(point, 19);
    this.map.enableScrollWheelZoom(true);
    this.marketSet = new Set()
  }

  drawLine (points, color) {
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
  drawPath (points) {
    this.drawLine(points);
    points.forEach((p, i) => {
      if (p.reconnect) {
        this.drawLine([points[i - 1], p], "red");
        this.drawMarker(
          p,
          `离线时间:${p.dh
          }分钟;离线距离:${Math.round(p.ds)}米`,
          'red',
          [-20, -50]
        );
      }
    });
  }
  clear () {
    this.map.clearOverlays()
    this.marketSet.clear()
  }
  drawMarker (p, text, color, offset = [-20, -30], cache = true) {
    if (cache && this.marketSet.has(p)) {
      return
    } else {
      this.marketSet.add(p)
    }
    var marker = new BMapGL.Marker(new BMapGL.Point(p.longitude, p.latitude), {
      title: p.time || '',
    });
    // 创建文本标注
    var label = new BMapGL.Label(text, {
      position: new BMapGL.Point(p.longitude, p.latitude),
      offset: new BMapGL.Size(...offset),
    });
    label.setStyle({
      // 设置label的样式
      color: color || "#000",
      fontSize: "10px",
      border: "1px solid #1E90FF",
    });
    this.map.addOverlay(label);
    this.map.addOverlay(marker);
  }
}
