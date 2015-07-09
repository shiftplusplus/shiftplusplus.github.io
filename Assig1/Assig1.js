//personal library function
function deg2Rad(deg){
    return (Math.PI/180*deg);
}
//vars
var points = [];
var numTimesToSubdivide = 4;
    /* initial triangle */
    //Change to be regular n-gon (n=SIDES) centered at 0,0 of radius SIZE
var vertices = [
    vec2(-1,-1),
    vec2(0,1),
    vec2(1,-1)
    ];
tessellate (vertices[0],vertices[1],vertices[2], numTimesToSubdivide);


//init

//Move most of this to a "update" function, and attach that to all controls
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
    
        console.log(""+points[0]);
    points = twist(points,10,0,0,-.75);
       console.log(""+points[0]);    
    
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
   // count--;
  //new triangles
    tessellate(c,ac,bc,count-1);
    tessellate(a,ab,ac,count-1);
    tessellate(ab,bc,ac,count-1);
    tessellate(b,bc,ab,count-1);
    
    }
}

//twister
function twist(pts,twistAmount,centerX,centerY,sizeAdjust) {
    p=[];
    console.log(pts)
    for(var i=0;i<pts.length; i++){
        var vertex = JSON.parse(JSON.stringify(pts[i]));
//     console.log(vertex);
        x=vertex[0];
        y=vertex[1];
        var d = Math.sqrt((x-centerX)*(x-centerX)+(y-centerY)*(y-centerY)); //1^2 = 3 for some reason
//     console.log(d);
        newX = x*Math.cos(deg2Rad(d*twistAmount))-y*Math.sin(deg2Rad(d*twistAmount));
        newY = x*Math.sin(deg2Rad(d*twistAmount))+y*Math.cos(deg2Rad(d*twistAmount));
//     console.log(newX+","+newY);

        vertex[0]=newX*sizeAdjust;
        vertex[1]=newY*sizeAdjust;

        p.push(vertex);
    }
    return p
}

//constant updater

//render
function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP,0,points.length);
}