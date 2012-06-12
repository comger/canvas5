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

var UI = Class({
    opt:undefined,
    getOpt:function(){
        return opt;
    },
    init:function(_opt){
        opt = _opt;
    },
    draw:function(){
        //todo
    },
    drawing:function(){
        if(this.draw_move){
            this.draw_move();
        }
    },
    move:function(to){
        //todo
    }
})


var URect = Class(UI,{
    draw:function(){
        if(opt.isFill){
            opt.context.fillRect(opt.from.x,opt.from.y,opt.to.x-opt.from.x,opt.to.y-opt.from.y);
        }else{
            opt.context.strokeRect(opt.from.x,opt.from.y,opt.to.x-opt.from.x,opt.to.y-opt.from.y);
        }
    },
    draw_move:function(){
        opt.context.dashRect(opt.from,opt.to);
    }
})


var ULine = Class(UI,{
    draw:function(){
        opt.context.moveTo(opt.from.x,opt.from.y);
        opt.context.lineTo(opt.to.x,opt.to.y);
        opt.context.stroke();
    },
    draw_move:function(){
        opt.context.beginPath();
        opt.context.moveTo(opt.from.x,opt.from.y);
        opt.context.lineTo(opt.to.x,opt.to.y);
        opt.context.stroke();
        opt.context.closePath();
    }
})

