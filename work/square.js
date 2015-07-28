var gl; //Context
var points; //Data

window.onload=function init(){
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) {alert("WebGL Isnt Available!");}
    
    //four vertices:
    var vertices = [
    -0.5,-0.5,
    -0.5,0.5,
    0.5,0.5,
    0.5,-0.5
    ];
    
    //Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0,0.0,0.0,1.0);
    
    //Load shaders and init attribute buffers
    var program = initShaders(gl, "vertex-shader","fragment-shader"); //remember these IDs in the html file?
    gl.useProgram(program);
    
    //Load data onto GPU
    var bufferID = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferID);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    //Associate shader vars with vars in JS file
    var vPosition = gl.getAttribLocation( program,"vPosition");
    gl.vertexAttribPointer (vPosition, 2, gl.FLOAT, false, 0,0 );
    gl.enableVertexAttribArray(vPosition);
    
    render();
};

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN,0,4);
}