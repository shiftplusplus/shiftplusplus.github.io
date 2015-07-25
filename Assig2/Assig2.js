var keyCodes=new Object();
keyCodes.keys= Array('`','1','2','3','4','5','6','7','8','9','0','-','=','DEL','TAB','q','w','e','r','t','y','u','i','o','p','[',']','\\','CAPS','a','s','d','f','g','h','j','k','l',';','\'','RET','SHIFT','z','x','c','v','b','n','m',',','.','/','CTRL','OPT','lCMD',' ','rCMD','lARR','uARR','dARR','rARR');
keyCodes.codes= Array(192,49,50,51,52,53,54,55,56,57,48,189,187,8,9,81,87,69,82,84,89,85,73,79,80,219,221,220,20,65,83,68,70,71,72,74,75,76,186,222,13,16,90,88,67,86,66,78,77,188,190,191,17,18,91,32,93,37,38,40,39);
function codeToKey(code){
	var index=null;
	for(var i=0; i<keyCodes.codes.length; i++){
			if(keyCodes.codes[i]==code){
				index=i;
				}
		}
	return keyCodes.keys[index];
	}
keyCodes.codeToKey=codeToKey;
delete codeToKey;

function inputVar(id, change){
    if(id){
        this.element = document.getElementById(id);
        this.val = function(x){
            if(x){ //set
                this.element.value=x;
                this.v = x
                if(this.change != null){
                    this.change(this);
                }
            }else{ //get
                this.v = this.element.value;
                return this.v;
            }
        }
        var x=this;
//         console.log(this.element,this.element.onchange);
        this.element.onchange = function(){
            x.v=x.val(this.value);
//             console.log(this,x,this.value,x.v);
        };
//         console.log(this.element,this.element.onchange);
    }else{
    this.val = function(x){
        if(x){ //set
            this.v = x;
            this.element.value = x;
            if(this.change != null){
                this.change(this);
            }
        }else{ //get
//         this.v=this.element.value;
            return this.v;
        }
    }
    }
    if(!change){
        this.change= null;
    }else{
        this.change=change;
    }
    this.v = this.val();
    
    return this;
}

function findNewPoint(x, y, angle, distance) {
//     console.log(x,y,angle,distance);
    var point = {};
    point.x = Math.cos(angle)*distance+x;
    point.y = Math.sin(angle)*distance+y;

    return point;
}

var canvas;
var program;
var points = Array();
var colors = Array();
var brushing = false;
var colorR;
var colorG;
var colorB;
var colorA;
var thickness;
var cBuffer;
var bufferID;
var triangleColors;
var triangles;

window.onload = function init(){
    colorR = new inputVar("colorR",update);
    colorG = new inputVar("colorG",update);
    colorB = new inputVar("colorB",update);
    colorA = new inputVar("colorA",update);
    thickness = new inputVar("thickness",update);

    $("#gl-canvas").mousedown(brushDown).mouseup(brushUp)
    document.onmousemove=brushMove;
    canvas = document.getElementById("gl-canvas");
     gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true, alpha:false});
    if(!gl) {alert("WebGL Isnt Available!");}
    //Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0,0.0,0.0,1.0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
gl.enable(gl.BLEND);
    program = initShaders( gl,"vertex-shader","fragment-shader");
    gl.useProgram(program);
    cBuffer = gl.createBuffer();
    bufferID = gl.createBuffer();
    
//     changeColor();
    requestAnimFrame(render);
}

function colorCallback(c){
    console.log("Color Callback:", c);
}


function addPoint(e){
    if(!e) var e = window.event;
    //e = event
    //this = HMTL element triggering it.

    var posX = e.pageX - $(canvas).position().left;
    var posY = e.pageY - $(canvas).position().top;
    var width = $(canvas).width();
    var height = $(canvas).height();
    var x = ((posX)/width)*2 -1;
    var y = -1 *(((posY)/width)*2 -1);
    var t=vec2(x,y);
//     var t = vec2(-1 + (2*e.clientX)/canvas.width, -1-2*(e.clientY)/canvas.height);
    points.push(t);
    colors.push(colorR.val(), colorG.val(),colorB.val(),colorA.val() );
}

function brushDown(e){
    //console.log("brushDown");
//     $("#gl-canvas").mousemove(brushMove);
    brushing = true;
    
    addPoint(e);
    requestAnimFrame(render);
    
}


function brushMove(e){
    //console.log("brushMove; brushing = "+brushing);
    if(brushing){
        addPoint(e);
        addPoint(e);
        requestAnimFrame(render);
    }
}

function brushUp(e){
    //console.log("brushUp");
//     $("#gl-canvas").off("mousemove");
    brushing = false;
    addPoint(e);
    requestAnimFrame(render);
}


function render(){
    //turn points into triangles
    triangles = Array();
    for(var i=0;i<(points.length-1);i=i+2){
        start = points[i];
        end = points[i+1];
        if(i+2>=points.length){
            miter=end;
        }else{
            miter = points[i+2];
        }
        theta = Math.atan2((end[1]-start[1]),(end[0]-start[0]));
        theta1 = theta + (Math.PI/2);
        theta2 = theta - (Math.PI/2);
        thetaM = Math.atan2((miter[1]-end[1]),(miter[0]-end[0]));
        theta3 = thetaM + (Math.PI/2);
        theta4 = thetaM - (Math.PI/2);
        thick = thickness.val()/150;
        tri1 = findNewPoint(start[0],start[1],theta1,thick);
        tri2 = findNewPoint(start[0],start[1],theta2,thick);
        tri3 = findNewPoint(end[0],end[1],theta1,thick);
        tri4 = findNewPoint(end[0],end[1],theta2,thick);
//         console.log(tri1);
        triangles.push( vec2(tri1.x,tri1.y), vec2(tri2.x,tri2.y), vec2(tri4.x,tri4.y));
        triangles.push( vec2(tri1.x,tri1.y), vec2(tri3.x,tri3.y), vec2(tri4.x,tri4.y));        
    }
//     console.log(colors.length / points.length);
     triangleColors=Array();
    for(var i = 0; i<colors.length; i++){
//         for(var j=0; j<3; j++){
//         triangleColors.push(colors[j+i]);
//         }
    triangleColors.push(colorR.val());
    triangleColors.push(colorG.val());
    triangleColors.push(colorB.val());
    triangleColors.push(colorA.val());
    }
//     console.log(triangleColors.length,triangles.length, triangleColors.length/triangles.length);
     cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangleColors), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vColor);

     bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(triangles),gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program,"vPosition");
    
    gl.vertexAttribPointer( vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
    
//     gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,triangles.length);
//     points= Array(points.pop());

}


//Control functions
function fix(){
//     brushUp({pageX:300,pageY:300});
    brushing = false;
    var t=points.pop()
    points.push(t,t);
    colors.push(colorR.val(), colorG.val(),colorB.val(),colorA.val() );
    requestAnimFrame(render);
    
}
var redoPoints = Array();
var redoColors = Array();
function undo(){
    redoPoints.splice(0,0,points.splice(-2,2));
    redoColors.splice(0,0,colors.splice(-8,8));
    update();
    requestAnimFrame(render);
}
function redo(){
        if(redoPoints.length>0){
        points.splice(points.length,0,redoPoints.splice(0,2));
        //colors.splice(colors.length,0,redoColors.splice(0,3));
        for(var i=0;i<4;i++){
            colors.push(redoColors.shift());
        }
        }
    requestAnimFrame(render);
}

function save(e){
    document.getElementById("download").href = canvas.toDataURL();
    return true;
}

// var colorBuffers=Array();
// var pointBuffers=Array();
var oldColors = Array();
var oldPoints = Array();
function newPrimitive(){
//     colorBuffers.push(cBuffer);
//     pointBuffers.push(bufferID);
    oldColors.push(triangleColors);
    oldPoints.push(triangles);
    points=Array();
    colors = Array();
    cBuffer = gl.createBuffer();
    bufferID = gl.createBuffer();    
    update();
}

function update(){
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i=0;i<oldPoints.length; i++){
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(oldColors[i]), gl.STATIC_DRAW);
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer( vColor, 4, gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(vColor);

        var bufferID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
        gl.bufferData(gl.ARRAY_BUFFER,    flatten(oldPoints[i]),gl.STATIC_DRAW);
        var vPosition = gl.getAttribLocation( program,"vPosition");
    
        gl.vertexAttribPointer( vPosition,2,gl.FLOAT,false,0,0);
        gl.enableVertexAttribArray(vPosition);
    
    //     gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP,0,oldPoints[i].length);
    //     points= Array(points.pop());
    }
    requestAnimFrame(render);
}