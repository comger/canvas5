/**
   canvas 基础图库
   author   comger@gmail.com
**/

/**
    立方体 Cube
    opts = {
        x,
        y,
        width,
        height,
        v, //立方向量
        color,
        styles:{
        }
    }
**/
Comger.Cube = Class(Comger.Item,{
    init:function(opts,canvasLayer){
        this.__init__(opts,canvasLayer);
    },
    inrange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
        return Uti.inFences(m,this.points);
    },
    render:function(){
        var o = this;
        var startcolor = o.color;
        var c = new Comger.Color(startcolor);
        c.changeS(0.2);
        c.changeV(-50);

        var endcolor = c.toString();
        var grd=this.context.createLinearGradient(o.x, o.y, o.x, o.y + o.height);
        grd.addColorStop(0,startcolor);
        grd.addColorStop(1,endcolor);
        this.context.fillStyle=grd;
        this.context.fillRect(o.x,o.y,o.width,o.height);

        //上面
        var top1 = {x:o.x + o.v.x,y:o.y - o.v.y}
        var top2 = {x:top1.x + o.width,y:top1.y}
        
        var ps = [{x:o.x,y:o.y},{x:top1.x,y:top1.y},{x:top2.x,y:top2.y},{x:o.x+o.width,y:o.y}]
        var _tri = new Comger.Fences({points:ps,isFill:true});
        grd=this.context.createLinearGradient(o.x,o.y,top2.x,top2.y);
        grd.addColorStop(0,endcolor);
        grd.addColorStop(1,startcolor);
        this.context.fillStyle=grd;
        _tri.render(this.context)

        c.changeS(0.2);
        c.changeV(-50);
        var endcolor2 = c.toString();
        var ps2 = [{x:o.x+o.width,y:o.y},{x:top2.x,y:top2.y},{x:top2.x,y:top2.y+o.height},{x:o.x+o.width,y:o.y+o.height}]
        var _tri2 = new Comger.Fences({points:ps2,isFill:true});
        grd=this.context.createLinearGradient(o.x + o.width,o.y,o.x + o.width ,o.y + o.height);
        grd.addColorStop(0,endcolor);
        grd.addColorStop(1,endcolor2);
        this.context.fillStyle=grd;
        _tri2.render(this.context)

        this.points = [{x:o.x,y:o.y},{x:top1.x,y:top1.y},{x:top2.x,y:top2.y},{x:top2.x,y:top2.y+o.height},{x:o.x+o.width,y:o.y+o.height},{x:o.x,y:o.y+o.height}];

    }
})

/**
    Cylinder 圆柱体
    opts = {
        x,
        y,
        r,
        rate:0.3,
        height,
        color,
        styles:{
        }
    }
**/
Comger.Cylinder = Class(Comger.Item,{
    init:function(opts,canvasLayer){
        this.__init__(opts,canvasLayer);
    },
    inrange:function(m){ //需要支持Mouse、Click 等事件时，此方法必须实现
        var o = this;
        var rh = o.r*o.rate;

        var v = {x:m.x-o.x,y:m.y-o.y}
        if((v.x*v.x/(o.r*o.r)+v.y*v.y/(rh*rh))<1)
            return true;

        var points = [Uti.newPoint(o.x-o.r,o.y),Uti.newPoint(o.x+o.r,o.y),Uti.newPoint(o.x+o.r,o.y+o.height),Uti.newPoint(o.x-o.r,o.y+o.height)];
        if(Uti.inFences(m,points))
            return true;

        v = {x:m.x-o.x,y:m.y-o.y-o.height}
        if((v.x*v.x/(o.r*o.r)+v.y*v.y/(rh*rh))<1)
            return true

        return false;
    },
    render:function(context){
        var ctx = context || this.context;
        var o = this;
        var startcolor = o.color;

        var c = new Comger.Color(startcolor);
        c.changeS(0.2);
        c.changeV(-100);

        var endcolor = c.toString();
        c.changeS(0.2);
        c.changeV(-50);
        var endcolor2 = c.toString();
        
        var grd=ctx.createLinearGradient(o.x-o.r,o.y,o.x+o.r,o.y);
        grd.addColorStop(0,startcolor);
        grd.addColorStop(1,endcolor);

        ctx.save();
        ctx.scale(1,o.rate); //开始变形

        ctx.beginPath();
        ctx.fillStyle=grd;
        ctx.fillRect(o.x-o.r,o.y/o.rate,o.r*2,o.height/o.rate); //画矩型，但要还原y轴与高度           
        ctx.arc(o.x,o.y/o.rate+o.height/o.rate, o.r, 0, Math.PI*2, false); //画下面的椭圆 但要还原y轴与高度 
        ctx.closePath();
        ctx.fill();

        //开始上面的椭圆的渐变色区域
        ctx.beginPath();
        grd=ctx.createLinearGradient(o.x-o.r,o.y/o.rate,o.x+o.r,o.y/o.rate);
        grd.addColorStop(0,endcolor);
        grd.addColorStop(1,startcolor);
        ctx.fillStyle=grd;
        ctx.arc(o.x,o.y/o.rate, o.r, 0, Math.PI*2, false);//画上面的椭圆，但要还原y轴
        ctx.closePath();
        ctx.fill();

        ctx.restore(); //还原变的比率
    }
})

/**
    PointLine
**/
Comger.PointLine = Class(Comger.Rect,{
    model:undefined,
    init:function(opts,model,canvasLayer){
        this.__init__(opts,canvasLayer);
        this.model = model;
        
        var vals = [];
        $(this.model).each(function(i){
            vals.push(parseInt(this.value));
        });
        
        this.vals = vals;
        
        this.maxVal = Math.max.apply(Math,vals);
        this.minVal = Math.min.apply(Math,vals);
        this.space = this.maxVal;
        this.sub = this.height/this.space;
        
    },
    render:function(){

        var model = this.model;
        var ctx = this.context;
        var self = this;
        ctx.save();
        this.__parentClass.prototype.render.bind(this)();
        ctx.restore();
        
        ctx.strokeStyle = "red";
        
        var offsetLeft = self.x;
        
        ctx.beginPath();
        
        var xstep = self.width / self.model.length;
        
        ctx.moveTo(offsetLeft,self.height);
        $(this.model).each(function(i){
            var offsetTop = self.height - parseInt(this.value)*self.sub + self.y;
            offsetLeft += xstep;
            ctx.lineTo(offsetLeft,offsetTop);
            ctx.stroke(); 
        })

        
        ctx.font = "10pt Calibri";  
        ctx.textBaseline = "middle";  
        ctx.fillStyle = "blue";  

        offsetLeft = self.x;
        $(this.model).each(function(i){
            var offsetTop = self.height - parseInt(this.value)*self.sub +self.y ;
            offsetLeft += xstep;
            ctx.moveTo(offsetLeft,offsetTop);
            ctx.arc(offsetLeft,offsetTop,2,0,Math.PI*2,true);
            ctx.stroke(); 
            ctx.fillText(this.value,offsetLeft+5,offsetTop+2)
            
            
            ctx.fillText(this.label,offsetLeft,self.y+self.height+10);
        })
        
        
        var offsetTop =  self.y + self.height;
        var ystep = offsetTop/self.model.length;
        var yval = 0;
        var vstep = this.maxVal/self.model.length;
        $(this.vals.sort()).each(function(i){
            offsetTop = offsetTop - ystep;
            yval = yval+vstep;
            if(i==0){
                offsetTop +=ystep;
                yval -=vstep;
            }
            ctx.fillText(Math.floor(yval),self.x-20,offsetTop);
        })

        
    },
    max:function(){
        var vals = [];
        $(this.model).each(function(i){
            vals.push(parseInt(this.value));
        });
        return vals.max();
        
    }
})
