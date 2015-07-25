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

window.onload = function init(){
    colorR = new inputVar("colorR");
    colorG = new inputVar("colorG");
    colorB = new inputVar("colorB");
    colorA = new inputVar("colorA");
    thickness = new inputVar("thickness");

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
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vColor);

    var bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points),gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program,"vPosition");
    
    gl.vertexAttribPointer( vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES,0,points.length);
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