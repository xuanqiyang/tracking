class DrawMap {
    constructor(container, centalPoint) {
        // 创建地图实例 
        this.map = new BMapGL.Map(container, {
            enableRotate: false,
            enableTilt: false
        });
        var point = new BMapGL.Point(centalPoint.longitude, centalPoint.latitude);
        this.map.centerAndZoom(point, 19);
        this.map.enableScrollWheelZoom(true);
    }
    drawLine (points) {
        var node = new BMapGL.Icon('//mapopen-pub-jsapigl.bj.bcebos.com/demoimg/zhongheyiyuan.png', new BMapGL.Size(11, 11), {
            offset: new BMapGL.Size(5, 5)
        });
        //创建折线
        var polyline = new BMapGL.Polyline(points.map(p => new BMapGL.Point(p.longitude, p.latitude)), {
            strokeStyle: 'dashed',
            strokeColor: 'blue',
            strokeTexture: {
                url: 'https://mapopen-pub-jsapigl.bj.bcebos.com/svgmodel/Icon_road_blue_arrow.png',
                width: 16,
                height: 64
            },
            strokeWeight: 8,
            strokeOpacity: 0.8,
            node: node
        });
        this.map.addOverlay(polyline);
    }
    drawMarker (p) {
        var marker = new BMapGL.Marker(new BMapGL.Point(p.longitude, p.latitude), {
            title: p.index
        });
        // 创建文本标注
        var label = new BMapGL.Label(p.ds, {
            position: new BMapGL.Point(p.longitude, p.latitude),
            offset: new BMapGL.Size(-20, -20)
        })
        label.setStyle({                              // 设置label的样式
            color: '#000',
            fontSize: '10px',
            border: '1px solid #1E90FF'
        })
        this.map.addOverlay(label);
        this.map.addOverlay(marker);
    }
}
