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
        }
    }
    }else{
    this.v = this.val()
    this.val = function(x){
        if(x){ //set
            this.v = x
            if(this.change != null){
                this.change(this);
            }
        }else{ //get
            this.v = this.element.value;
        }
    }
    }
    if(!change){
        this.change= null;
    }else{
        this.change=change;
    }
    
    return this;
}

var canvas;
var program;
var points = Array();
var colors;
var brushing = false;

window.onload = function init(){
    $("#gl-canvas").mousedown(brushDown).mouseup(brushUp)
    document.onmousemove=brushMove;
    canvas = document.getElementById("gl-canvas");
     gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) {alert("WebGL Isnt Available!");}
    //Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0,0.0,0.0,1.0);
    
    program = initShaders( gl,"vertex-shader","fragment-shader");
    gl.useProgram(program);
    requestAnimFrame(render);
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