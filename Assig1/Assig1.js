    //TODO:automatic visualizer.

//personal library function
function deg2Rad(deg){
    return (Math.PI/180*deg);
}
//vars
var points = [];

var size = 1;
var sides = 3;
var tessellations = 4;
    /* initial triangle */
var twist = 10;
var fractal = false;
var centerX = 0;
var centerY = 0;

var colorR = 1.0;
var colorG = 0.0;
var colorB = 1.0;
var colorA = 1.0;

var amAnimating = false;
var animateTimer;
var animateDirection = new Object;
animateDirection.size = 1;
animateDirection.twist = 1;
var animateColor = "B";
var changeColors = false;
var program;

//init
window.onload = function init() {
    //Bind all controls
    $(".controls").change(update);
    $(".colors input").off("change").change(colorUpdate);
    $("#animate").click(toggleAnimation);
    
    var canvas = document.getElementById("gl-canvas");
    $("#gl-canvas").click(clickUpdate);
    
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) {alert("WebGL Isnt Available!");}
    //Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0,0.0,0.0,1.0);
    
    program = initShaders( gl,"vertex-shader","fragment-shader");
    gl.useProgram(program);
    colorUpdate();
}

function colorUpdate(){
    colorR = Number($("#colorR").val());
    colorG = Number($("#colorG").val());
    colorB = Number($("#colorB").val());
    colorA = Number($("#colorA").val());
    var glR = gl.getUniformLocation(program,"r");
    gl.uniform1f(glR, colorR);
    var glG = gl.getUniformLocation(program,"g");
    gl.uniform1f(glG, colorG);
    var glB = gl.getUniformLocation(program,"b");
    gl.uniform1f(glB, colorB);
    var glA = gl.getUniformLocation(program,"a");
    gl.uniform1f(glA, colorA);
    
    update();

}

function toggleAnimation(e){
    if(!amAnimating){
    console.log("start");
    amAnimating=true;
    animateTimer = setInterval(animate,1000/30);
   $("#gl-canvas").mousemove(clickUpdate); //When animating, this does not call update(), preventing double updating.
    size= 0.05;
    $("#size").val(size);
    twist = -1080;
    $("#twist").val(twist);
    

    }else {
    console.log("stop");
    amAnimating=false;
    clearInterval(animateTimer);
    $("#gl-canvas").off('mousemove');

    }
}

function changeColor(amount){
    console.log(animateColor);
    switch(animateColor){
        case "B": 
             colorB = colorB + amount;
             if(colorB >1.0){
                animateColor = "G";
                colorB=0.0;
             }
             $("#colorB").val(colorB);
            break;
        case "G":
            colorG = colorG + amount;
             if(colorG >1.0){
                animateColor = "R";
                colorG=0.0;
             }
             $("#colorG").val(colorG);
            break;
        case "R":
            colorR = colorR + amount;
             if(colorR >1.0){
                animateColor = "B";
                colorR=0.0;
             }
             $("#colorR").val(colorR);
            break;
        default: console.log("animateColor is invalid value.");break;
    }
    colorR = Number($("#colorR").val());
    colorG = Number($("#colorG").val());
    colorB = Number($("#colorB").val());
    
    var glR = gl.getUniformLocation(program,"r");
    gl.uniform1f(glR, colorR);
    var glG = gl.getUniformLocation(program,"g");
    gl.uniform1f(glG, colorG);
    var glB = gl.getUniformLocation(program,"b");
    gl.uniform1f(glB, colorB);

}

function animate(){
    //Someday, figure out how to DRY up this into a bounce() function
    if(size >= $("#size").attr("max")){
            animateDirection.size = -1;
        } else if(size <= $("#size").attr("min")) {
            animateDirection.size=1;
        }
        
    $("#size").val(Number(size)+animateDirection.size*0.01);
    if(twist >= Number($("#twist").attr("max"))){
            animateDirection.twist = -1;
        } else if (twist <= Number($("#twist").attr("min"))){
            animateDirection.twist = 1;
        }
    $("#twist").val(Number(twist)+animateDirection.twist*5);
    
    changeColors = $("#color").is(":checked");
    console.log(changeColors);
    if(changeColors){ changeColor(0.01);}
    
    update();
}

function clickUpdate(e){
    if(!e) var e = window.event;
    //e = event
    //this = HMTL element triggering it.

    var posX = e.pageX - $(this).position().left;
    var posY = e.pageY - $(this).position().top;
    var width = $(this).width();
    var height = $(this).height();
    var x = ((posX)/width)*2 -1;
    var y = ((posY)/width)*2 -1;
    $("#centerX").val(x);
    $("#centerY").val(y);
    if(!amAnimating){update();}
}

function update(e){
    if(!e) var e = window.event;
    //e = event
    //this = HMTL element triggering it.

    //Set all variables
    size = $("#size").val();
    sides = $("#sides").val();
    tessellations = $("#tessellations").val();
    twist = $("#twist").val();
    fractal = $("#fractal").is(":checked"); //checkboxes are weird
    centerX = $("#centerX").val(); 
    centerY = $("#centerY").val();
    points = null;
    points = [];

    angleOffset = deg2Rad(360/sides);
    vertices= new Array();
    for(i=0;i<sides;i++){
        vertices[i] = vec2(1*Math.cos(i*angleOffset),1*Math.sin(i*angleOffset));
    }
    for(i=0; i<vertices.length; i++){
        var endpointIndex = i+1;
        if(endpointIndex== vertices.length){endpointIndex=0;}
        tessellate (vec2(0,0),vertices[i],vertices[endpointIndex], tessellations);
    }    
    points = JSON.parse(JSON.stringify(twister(points,twist,centerX,centerY,size)));
    
    var bufferID = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferID);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points),gl.STATIC_DRAW);
    var vPosition = gl.getAttribLocation( program,"vPosition");
    
    gl.vertexAttribPointer( vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);

    render()
}


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
    if(!fractal){
    tessellate(ab,bc,ac,count-1);
    }
    tessellate(b,bc,ab,count-1);
    
    }
}

//twisterer
function twister(pts,twisterAmount,centerX,centerY,sizeAdjust) {
    p=[];
    for(var i=0;i<pts.length; i++){
        var vertex = JSON.parse(JSON.stringify(pts[i]));
        x=vertex[0];
        y=vertex[1];
        var d = Math.sqrt((x-centerX)*(x-centerX)+(y-centerY)*(y-centerY)); //1^2 = 3 for some reason
        newX = x*Math.cos(deg2Rad(d*twisterAmount))-y*Math.sin(deg2Rad(d*twisterAmount));
        newY = x*Math.sin(deg2Rad(d*twisterAmount))+y*Math.cos(deg2Rad(d*twisterAmount));

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
    gl.drawArrays(gl.TRIANGLES,0,points.length);
//     gl.drawArrays(gl.LINE_LOOP,0,points.length);
}