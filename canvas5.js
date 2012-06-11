/**
 * comger canvas engine for simple graphic,line and json data, mutil layout operate
 * 支持简单形状图画及线条、支持图形数据导出、支持多图层操作
 * 功能列表
 *  1. 结构图型绘制 (图形支持:矩形、圆形)
 *      a. 缩放、移动、颜色填充
 *      b. 矩形圆角
 *      c. 圆形变形
 *
 *  2. 线条绘制
 *      a. 线条大小
 *  3. 图形数据导入与导出
 *
 * @author comger@gmail.com
 * @addon 2012-05-29
**/

//图型状态值
var state = {
    init:0, //初始状态
    ready:1,//准备就绪
    drawing:2,//正在绘制
    completed:3//绘制完成
}

/**
 * 平面UI接口
 * 1. 以第一次点击画板的坐标做为此次图形的x,y。
 * 2. 支持缩放与移动、颜色
**/
var Ui_interface = Class({
   x:0,
   y:0,
   z:0,
   width:0,
   height:0,
   index:0,
   opacity:0,
   scale:0,
   state:"ready"
});

/**
 * 图层类,接受至少一个的图形、线条、或文字
 * 每一个图层为一个Canvas 实例
 * 图层记录着图形信息
 * 图层可以合并
**/
var Layout = Class({
    context:undefined,
    canvas:undefined,
    graphics:[],
    init:function(exp,ui){
        this.canvas = $(exp);
    }
})


