//vars
var points = [];
var numTimesToSubdivide = 6;
    /* initial triangle */
var vertices = [
    vec2(-1,-1),
    vec2(0,1),
    vec2(1,-1)
    ];
tessellate (vertices[0],vertices[1],vertices[2], numTimesToSubdivide);


//init
window.onload = function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) {alert("WebGL Isnt Available!");}
    //Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0,0.0,0.0,1.0);
    
    var program = initShaders( gl,"vertex-shader","fragment-shader");
    gl.useProgram(program);
    var bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points),gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program,"vPosition");
    gl.vertexAttribPointer( vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);

    render()
};

//Helper: display 1 triangle
function triangle(a,b,c){
    points.push(a,b,c);
    }
//tessellationater
function tessellate(a,b,c,count){
  //check for end of recursion
    if(count==0) {
    triangle(a,b,c);
    }
    else {
  //bisect sides
    var ab = mix(a,b,0.5);
    var ac = mix(a,c,0.5);
    var bc = mix(b,c,0.5);
    count--;
  //new triangles
    tessellate(a,ab,ac,count-1);
    tessellate(c,ac,bc,count-1);
    tessellate(b,bc,ab,count-1);
    tessellate(ab,bc,ac,count-1);
    }
}

//constant updater

//render
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES,0,points.length);
}
