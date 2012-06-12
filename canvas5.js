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
    init:function(_opt){
        $.extend(this,_opt);
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
        //TODO
    }
})

/**
 * 矩形
 * new URect({
      from:point,
      to:point,
      context:ctx,
      isFill:true|false
    })
**/
var URect = Class(UI,{
    width:undefined,
    height:undefined,
    isFill:true,
    context:undefined,
    draw:function(){
        if(this.width==undefined || this.height==undefined){
           this.width = this.to.x - this.from.x;
           this.height = this.to.y - this.from.y;
        }
        
        if(this.isFill){
            this.context.fillRect(this.from.x,this.from.y,this.width,this.height);
        }else{
            this.context.strokeRect(this.from.x,this.from.y,this.width,this.height);
        }
    },
    draw_move:function(){
        this.context.dashRect(this.from,this.to);
    },
    inrange:function(point){
        return this.from.x<=point.x && point.x<=(this.from.x+this.width) && this.from.y <= point.y && point.y<= (this.from.y+this.height);
    },
    move:function(to){
        this.from = to;
        this.draw();
    },
    clear:function(){
        context.clearRect(this.from.x-1, this.from.y-1, this.width+2, this.height+2);
    }
})

/**
 * 连接线
 * new ULine({
      from:point,
      to:point,
      context:ctx,
    })
**/
var ULine = Class(UI,{
    draw:function(){
        this.context.moveTo(this.from.x,this.from.y);
        this.context.lineTo(this.to.x,this.to.y);
        this.context.stroke();
    },
    draw_move:function(){
        this.context.beginPath();
        this.context.moveTo(this.from.x,this.from.y);
        this.context.lineTo(this.to.x,this.to.y);
        this.context.stroke();
        this.context.closePath();
    }
})

/**
 * 圆形
 * new UArc({
      from:point,
      to:point,
      context:ctx,
    })
**/
var UArc = Class(UI,{
    draw:function(){
        this.context.beginPath();
        this.context.moveTo(this.from.x,this.from.y);
        this.context.arc(this.from.x,this.from.y,Comger.Utility.getPointsDis(this.from,this.to),0,Math.PI*2,true);
        this.context.stroke();
        this.context.closePath();
    }
})

