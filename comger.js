/**
    comger.js
    author      : comger@gmail.com
    createdate  : 2012-02-10
    
    this's js tool to help you use html5 canvas faster.
**/

var Comger = { Version:'dev' };

/**
    simple function to create a LIKE CLASS 
    init is default function
**/
window.Class = Comger.Class = function(a,b){
    var cls = ((function(){//创建一个类型
        var _obj = function(){  this.init.apply(this,arguments);}
        if(b){
            $.extend(_obj.prototype,a.prototype);
            _obj.prototype.__parentClass = a;
            $.extend(_obj.prototype,b);
        }else{
            $.extend(_obj.prototype,a);
        }
        
        return _obj;
    })());
    
    return cls;
};

//事件委托
Comger.Delegate = Class({
    fns: [],
    init: function() {
        this.fns = [];},
    add: function(fn, self) {
        for (var i = 0; i < this.fns.length; i++) {
            if (this.fns[i][0] === fn) {
                return;}
        }
        this.fns.push([fn, self]);
    },
    one: function(fn, self) {
        this.add((function() {
            fn.apply(self, arguments);
            this.remove(fn);
        }).bind(this));
    },
    remove:function(fn) {
        if(fn){
            for (var i = 0; i < this.fns.length; i++) {
                if (this.fns[i][0] === fn) {
                    this.fns.remove(i);
                    return;}
            }
        }else{
            this.fns = [];
        }
    },
    call: function() { //执行委托方法
        var result;
        for (var i = 0; i < this.fns.length; i++) {
            var ret = this.fns[i][0].apply(this.fns[i][1], arguments);
            result = ret == undefined ? result : ret;
        }
        return result;
    }
});

//图形相关辅助方法
Comger.Utility = {
    getPointsDis:function(point1,point2){ //获取 point1 和 point2 的 距离
        var dx = point1.x - point2.x
        var dy = point1.y - point2.y;
        return Math.pow((dx * dx +dy * dy), 0.5)
    },
    crossMul:function(v1,v2){ // 计算向量叉乘
        return v1.x*v2.y-v1.y*v2.x;
    },
    checkCross:function(p1,p2,p3,p4){ //判断两条线段是否相交
        var v1={x:p1.x-p3.x,y:p1.y-p3.y},
        v2={x:p2.x-p3.x,y:p2.y-p3.y},
        v3={x:p4.x-p3.x,y:p4.y-p3.y},
        v=this.crossMul(v1,v3)*this.crossMul(v2,v3);
        v1={x:p3.x-p1.x,y:p3.y-p1.y}
        v2={x:p4.x-p1.x,y:p4.y-p1.y}
        v3={x:p2.x-p1.x,y:p2.y-p1.y}
        return v<=0&&this.crossMul(v1,v3)*this.crossMul(v2,v3)<=0;
    },
    inFences:function(curPoint,points){//判断一个点是否在多边图形中,算法需要测试
        var p1,p2,p3,p4;
        p1=curPoint;
        p2={x:-100,y:curPoint.y}
        var count=0;
        //对每条边都和射线作对比
        for(var i=0;i<points.length;i++){
            p3=points[i];
            p4= (i+1==points.length)?points[0]:points[i+1];
            if(p4.y == curPoint.y)
                continue;
            if(p1.y < Math.min(p3.y, p4.y))
                continue;
            if(p1.y > Math.max(p3.y,p4.y))
                continue;
            if(p3.y == curPoint.y && p1.x>p3.x){
                next= (i+1==points.length)?points[0]:points[i+1];
                last= (i == 0)?points[points.length - 1]:points[i-1];
                if((next.y - curPoint.y)*(last.y - curPoint.y)<0)
                    count++;
                continue;
            }
            if(this.checkCross(p1,p2,p3,p4))
                count++;
        }
        return count%2!=0;
    },
    newPoint:function(x,y){ //快速创建一个坐标点
        return {x:x,y:y}
    },
    addEvn:function(self,evn,startwith){//添加事件; evn 为事件名称
        self[evn] = new Comger.Delegate();
        (function(evn){
            self[startwith+evn] = function(fn){ self[evn].add(fn,self);};
        })(evn);
    }
};

window.Uti = Comger.Utility;

//Graphic 图形基础类型
Comger.Item = Class({
    x:0,
    y:0,
    z:0,
    width:0,
    height:0,
    opacity:0,
    scale:0,
    state:"ready",
    visible:true,
    enabled:false,
    hoverEnabled:false,
    dragActive:false,
    dragTarget:undefined,
    context:undefined,
    dragMaximumX:undefined,
    dragMaximumY:undefined,
    dragMinimumX:0,
    dragMinimumY:0,
    MouseEvn:["over","out","_click","down","up"],
    DrawEvn:["starting","drawing","stop"],
    acceptedButtons:function(btn){},
    __init__:function(opts,canvasLayer){
        $.extend(this,opts);
        this.canvasLayer = canvasLayer || Comger.canvasLayer;
        this.context = this.canvasLayer.context;
        this.canvasLayer.add(this);
        this.__initMouseEvn__();
        this.__initDrawEvn__();
        
    },
    __initMouseEvn__:function(){
        for(var i=0;i<this.MouseEvn.length;i++){
            Uti.addEvn(this,this.MouseEvn[i],"mouse");
        }
        this["click"] = this["mouse_click"];
    },
    __initDrawEvn__:function(){
        for(var i=0;i<this.DrawEvn.length;i++){
            Uti.addEvn(this,this.DrawEvn[i],"on");
        }
    },
    show:function(){
        this.visible = true;
    },
    hide:function(){
        
    },
    setEnabled:function(flag){
        
    },
    setToolTips:function(text){
        var tips = $("#canvas_tips");
        self = this;
        self.tips = text;
        if($(tips).size()==0){
            tips = $("<div id='canvas_tips'>");
            tips.attr("style","position: absolute; z-index: 999999;");
            tips.hide()
            $("body").append(tips);
        }

        self.mouseover((function(e){
            $(tips).css("top",this.y-10+ this.offset.top + 'px');
            $(tips).css("left", this.x +10 + this.offset.left+ 'px');
            $(tips).html(this.tips);
            tips.show();
        }).bind(self));

        self.mouseout(function(e){
            tips.hide()
        })
        
    },
    inrange:function(point){
        return this.x<=point.x && point.x<=(this.x+this.width) && this.y <= point.y && point.y<= (this.y+this.height)
    },
    resize:function(){
        
    },
    setDragEnabled:function(flag){
        this.dragActive = flag || this.dragActive;
        if(this.dragActive){
            this.dragMaximumX = this.dragMaximumX || this.canvasLayer.canvas.width();
            this.dragMaximumY = this.dragMaximumY || this.canvasLayer.canvas.height();

            x = y = 0;
            var graphic = this;
            graphic.mousedown(function(e){
                x = e.clientX - graphic.x;
                y = e.clientY - graphic.y;
                $(document).bind('mousemove',mouseMove).bind('mouseup',mouseUp);
            })

            function mouseMove(e){
                graphic.y = e.clientY - y;
                graphic.x = e.clientX - x;
                
                if(graphic.y>(graphic.dragMaximumY-graphic.height)) graphic.y = graphic.dragMaximumY-graphic.height;
                if(graphic.x>(graphic.dragMaximumX-graphic.weidth)) graphic.x = graphic.dragMaximumX-graphic.weidth;
                
                if(graphic.y<graphic.dragMinimumY) graphic.y = 0;
                if(graphic.x<graphic.dragMinimumX) graphic.x = 0;
                
                graphic.canvasLayer.autoDraw();
            }
            
            function mouseUp(){
                $(document).unbind('mousemove',mouseMove).unbind('mouseup',mouseUp);
            }
        }
    }
});

/**
    图型管理类
**/
Comger.CanvasLayer = Class({
    context:undefined,
    canvas:undefined,
    graphics:[],
    curGraphic:undefined,
    init:function(exp, width, height){
        this.canvas = $(exp);
        this.__resize(width, height);
        this.context = $(exp)[0].getContext('2d');
        if(!this.context){ throw new Error('argument is required ! and typeof argument must be html5 Canvas');}
        
        var self = this;
		$(exp).mousemove(function(e){ // 移动事件支持
			var m = self.getCurrentPoint(e);
			
            if(self.curGraphic == null){ 
                //如果当前没有匹配图型，开始搜索，如果搜索到，设置当前图型，并执行当前图型的进入事件
                self.curGraphic = self.__find(m);
                if(self.curGraphic){
                    self.curGraphic.over.call(e);
                }
            }         
            
            //如果有当前图型，并且光标不在当前图片上，执行离开事件，并清空当前图型
            if(self.curGraphic && !self.curGraphic.inrange(m)){
                self.curGraphic.out.call(e);
                self.curGraphic = null;
            }

		});
		
		$(exp).mousedown(function(e){
            var m =self.getCurrentPoint(e);
            if(self.curGraphic){
                   self.curGraphic.down.call(e);
            }
		});
		
		$(exp).mouseup(function(e){
            var m =self.getCurrentPoint(e);
            if(self.curGraphic){
                   self.curGraphic.up.call(e);
            }
		});

        $(exp).click(function(e){ //点击事件
            var m =self.getCurrentPoint(e);
            if(self.curGraphic){
                   self.curGraphic._click.call(e);
             }
        });
        
        Comger.canvasLayer = this;
    },
    __resize:function(w,h){//如果不指定w,y 系统自动调节为全屏
        if(w && h){
            this.canvas[0].setAttribute('height', h);
            this.canvas[0].setAttribute('width', w);

        }else{
            this.canvas[0].setAttribute('height', screen.height);
            this.canvas[0].setAttribute('width', screen.width);
        }
   },
   getCurrentPoint:function(e){
        var _offset = this.canvas.offset();
    	return { x:(e.clientX + window.pageXOffset-_offset.left), y:(e.clientY + window.pageYOffset-_offset.top)};
   },
   add:function(graphic,index){
        this.oldGraphics = this.graphics;
        if(index){
        	graphic.index = index;
        	this.graphics.splice(index, 0, graphic);
        }else{
	        graphic.index = this.graphics.length;
			this.graphics.push(graphic);
        }
        
        graphic.offset = this.canvas.offset();
        
   },
   remove:function(graphic){
        this.graphics.splice(graphic.index, 1);	
   },
   draw:function(graphic){
        this.add(graphic);
        if(graphic.render && graphic.visible){
            this.context.save();
            this.__setStyle(graphic.styles || {});
            graphic.context = this.context;
            graphic.render();
            this.context.restore();
            if(graphic.stop)
                graphic.stop.call();
        }
   },
   autoDraw:function(){//自动重绘
	    this.clear();
	    var self = this;
	    
	    function _render(gra){
            if(gra.render && gra.visible){
                self.context.save();
                self.__setStyle(gra.styles || {})
                gra.render();
                self.context.restore();
                if(gra.stop)
                    gra.stop.call();
            }
	    }
	    
	    $(this.graphics).each(function(i){
            _render(this);
	    })
   },
   clear:function(){//清屏
    	this.context.setTransform(1, 0, 0, 1, 0, 0);//?? 关键
        this.context.clearRect(0, 0, this.canvas.width(), this.canvas.height());
   },
   __find:function(point){
        var gs = this.graphics;
        for(var i=gs.length-1;i>=0;i--){
            if(gs[i].inrange && gs[i].inrange(point)) return gs[i];
        }
        return null;
   },
   __setStyle:function(styles){
        this.context.fillStyle = styles.fillStyle ||  this.context.fillStyle;
        this.context.strokeStyle = styles.strokeStyle || this.context.strokeStyle;
        this.context.lineWidth = styles.lineWidth || this.context.lineWidth;
   }
});


/**
    矩形
**/
Comger.Rect = Class(Comger.Item,{
    borderColor:"#cccccc",
    borderWidth:1,
    color:"#cccccc",
    gradient:null,
    radius:0,
    smooth:true,
    init:function(opts,canvasLayer){ 
         this.__init__(opts,canvasLayer);
         
    },
    render:function(){
        this.context.beginPath();
        this.context.moveTo( this.x+this.radius,this.y );
        this.context.lineTo( this.width + this.x-this.radius,this.y );
        this.context.quadraticCurveTo( this.width + this.x, this.y, this.width + this.x, this.y + this.radius);
        this.context.lineTo( this.width + this.x,this.height + this.y-this.radius);
        this.context.quadraticCurveTo( this.width + this.x, this.height + this.y, this.width + this.x-this.radius, this.height + this.y);
        this.context.lineTo( this.x+this.radius,this.height + this.y );
        this.context.quadraticCurveTo( this.x, this.height + this.y, this.x, this.height + this.y-this.radius);
        this.context.lineTo( this.x,this.y+this.radius);
        this.context.quadraticCurveTo( this.x, this.y, this.x+this.radius, this.y);
        this.context.closePath();
        
        if(this.isFill){ //填充还是勾边
            this.context.fill();
        }else{
            this.context.stroke();
        }
    },
    line:function(p1,p2){
	    this.context.beginPath();
	    this.context.moveTo(p1.x,p1.y);
	    this.context.lineTo(p2.x,p2.y);
	    this.context.closePath();
	    this.context.stroke();
    }
})



/**
    多边形
**/
Comger.Fences = Class(Comger.Item,{
    init:function(opts,canvasLayer){ 
         this.__init__(opts,canvasLayer);
         
    },
    render:function(){
        var ctx = this.context
        ctx.beginPath();
        
        var beginPoint = this.points[0];
        ctx.moveTo(beginPoint.x,beginPoint.y); //第一个点作为起始点
        for(var i=1;i<this.points.length;i++){ // 
            var _tempPoint = this.points[i];
            ctx.lineTo(_tempPoint.x,_tempPoint.y);
            ctx.moveTo(_tempPoint.x,_tempPoint.y);
        }          
        if(this.isFill){ //填充还是勾边
            ctx.fill();
        }else{
            ctx.stroke();
            ctx.closePath();
       }
    },
    inrange:function(m){
        return Comger.Utility.inFences(m,this.points);
    }
})




