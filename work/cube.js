//Library

//Variables

var vertices = [
                vec3( -0.5,-0.5, 0.5),
                vec3( -0.5, 0.5, 0.5),
                vec3(  0.5, 0.5, 0.5),
                vec3(  0.5,-0.5, 0.5),
                vec3( -0.5,-0.5,-0.5),
                vec3( -0.5, 0.5,-0.5),
                vec3(  0.5, 0.5,-0.5),
                vec3(  0.5,-0.5,-0.5),
                ]
var vertexColors = [
              [0.0,0.0,0.0,1.0], //black
              [1.0,0.0,0.0,1.0], //red
              [1.0,1.0,0.0,1.0], //yellow
              [0.0,1.0,0.0,1.0], //green
              [0.0,0.0,1.0,1.0], //blue
              [1.0,0.0,1.0,1.0], //magenta
              [0.0,1.0,1.0,1.0], //cyan
              [1.0,1.0,1.0,1.0], //white
              ]
var gl;
var canvas;
var numVertices = 36;
var points = [];
var colors = [];

//Init
window.onload = function init(){
   canvas=document.getElementById("gl-canvas");
   gl = WebGLUtils.setupWebGL(canvas);
   
   colorCube();
   
   gl.viewport(0,0,canvas.width,canvas.height);
   gl.clearColor(1.0,1.0,1.0,1.0);
   gl.enable(gl.DEPTH_TEST);
   
   var program = initShaders( gl, "vertex-shader", "fragment-shader" );
   gl.useProgram( program );
   
   // Load the data into the GPU
   
   bufferId = gl.createBuffer();
   gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
   gl.bufferData( gl.ARRAY_BUFFER, 8*Math.pow(3, 6), gl.STATIC_DRAW );
   
   
   
   // Associate out shader variables with our data buffer
   
   var vPosition = gl.getAttribLocation( program, "vPosition" );
   gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
   gl.enableVertexAttribArray( vPosition );
   render();
   };

//Core functionality

function render()
{
   
   gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.drawArrays( gl.TRIANGLES, 0, numVertices );
//   points = [];
//   requestAnimFrame(render);
}


function colorCube(){
   //Define each quad counter-clockwise
   //so normals face outward (right-hand rule)
   quad(0,3,2,1);
   quad(2,3,7,6);
   quad(0,4,7,3);
   quad(1,2,6,5);
   quad(4,5,6,7);
   quad(0,1,5,4);
}

function quad(a,b,c,d){
   var indices = [a,b,c,a,c,d];
   for(var i=0; i<indices.length; ++i){
      points.push(vertices[indices[i]]);
      colors.push(vertexColors[indices[i]]);
      //for solid color faces:
//      colors.push(vertexColors[a]);
   }
}

//Interaction responders