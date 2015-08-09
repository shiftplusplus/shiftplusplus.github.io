//Library
function InputVar(id, change){
   this.id=id;
   if(id){
      this.element = document.getElementById(id);
      
      if(this.element==null){ //radio button?
         this.radio = true;
         this.radioElements = document.getElementsByName(id);
         this.radios=[];
         for(var i=0; i<this.radioElements.length; i++){
            this.radios.push(this.radioElements[i].value);
            if(this.radioElements[i].checked){
               this.v = this.radios[i];
            }
         }
      }else if(this.element.type=="select-one"){ //select with options
         this.select = true;
         this.options = this.element.options;
         if(this.element.selectedIndex ==-1){
            this.element.selectedIndex == 0;
         }
         //         if(this.element.selectedIndex !=-1){
         try{this.v=this.options[this.element.selectedIndex].value;}
         catch(e){
            //            console.warn(e,this);
            this.v = null;
         }
      }
      this.val = function(x,callChange){
         if(x!==undefined){ //set
            if(this.element && this.element.type == "checkbox"){
               this.element.checked = x;
            }else if(this.radio){
               for(var i=0;i<this.radios.length; i++){
                  if(this.radios[i]==x){
                     this.v=x;
                     this.radioElements[i].checked=true;
                     var found = true;
                     break;
                  }
               }
               if(!found){
                  //                  console.warn("No Radio Button in group "+this.id+" has the value "+x+"; creating new radio button in parent of and before the first.");
                  var newRad = document.createElement('input');
                  newRad.type = "radio";
                  newRad.name = this.id;
                  newRad.value = x;
                  newRad.checked = true;
                  newRad.onchange = onupdate;
                  this.radioElements[0].parentNode.insertBefore(newRad,this.radioElements[0]);
                  this.radioElements = document.getElementsByName(this.id);
                  this.radios.unshift(x);
                  this.v=x;
               }
            }else if(this.select){
               for(var i=0;i<this.options.length; i++){
                  if(this.options[i].value == x){
                     this.v = this.options[i].value;
                     this.element.selectedIndex=i;
                     var found = true;
                  }
               }
               if(!found){
                  //                  console.warn("No option in select "+this.id+" has the value "+x+"; creating option at the end.")
                  var newOption = document.createElement('option');
                  newOption.value=x;
                  newOption.text=x.toString();
                  this.element.add(newOption);
                  this.options = this.element.options;
                  
               }
            }else{
               this.element.value=x;
            }
            this.v = x;
            
            if(this.change != null&&callChange!=false){
               this.change(this);
            }
            return this.v;
         }else{ //get
            if(this.v== undefined){
               this.v = this.element.value;
            }
            return this.v;
         }
      }
      var x=this;
      this.onupdate =function(){
         if(this.type == "checkbox"){
            x.val(this.checked);
         }else{
            x.val(this.value);
         }
         
      };
      if(this.radio){
         for(var i=0;i<this.radioElements.length;i++){
            this.radioElements[i].onchange = this.onupdate;
         }
      }else{
         
         //         console.log(this);
         
         this.element.onchange = this.onupdate;
         this.element.onpaste = this.onupdate;
         this.element.onkeyup = this.onupdate;
      }
      
      
   }else{
      this.val = function(x){
         if(x || this.v==undefined){ //set
            if(x){
               this.v = x;
            }else{
               this.v = this.element.value;
               if(this.element.type==checkbox){
                  this.v = this.element.checked;
               }
            }
            if(this.change != null){
               this.change(this);
            }
         }else{ //get
            if(this.element.type==checkbox){
               this.v = this.element.checked;
            }
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
   this.string = "InputVar";
   this.toString = function(){
      this.string.value = this;
      return this.string;
   }
   return this;
}
function LinkedVar(id1,id2,change){
   
   this.change= change;
   var linker = this;
   this.link = function(e){
      if(e==linker.first){
         linker.second.val(linker.first.val(),false);
      }else{
         linker.first.val(linker.second.val(),false);
      }
      if(linker.change!=undefined){
         linker.change(e);
      }
   };
   this.first =new InputVar(id1,this.link);
   this.second = new InputVar(id2,this.link);
   this.val = function(x,y){
      y=y||true;
      if(x){
         return this.first.val(x,y);
      }else{
         return this.first.val();
      }
   }
   
}

function DrawObject(options){
   this.type="cube";
   this.location ={};
   this.location.x=0;
   this.location.y=0;
   this.location.z=0;
   this.rotation ={};
   this.rotation.x=45;
   this.rotation.y=45;
   this.rotation.z=45;
   this.radius=1;
   this.height=0.1;
   this.color = {};
   this.color.r = 0.5;
   this.color.g =0.5;
   this.color.b = 0.5;
   this.color.a = 0.5;
   
   if(options){
      if(options.type) this.type = options.type;
      if(options.location) this.location = options.location;
      if(options.rotation) this.rotation = options.rotation;
      if(options.radius) this.radius = options.radius;
      if(options.height) this.height = options.height;
   }
   
   //each object must supply its own GL buffers
   this.program = initShaders( gl, "vertex-shader", "fragment-shader" );
   this.colorLoc = gl.getUniformLocation(this.program,"fColor");
   this.sendColor = function(){
      gl.useProgram( this.program );
      gl.uniform4fv(this.colorLoc,vec4(this.color.r,this.color.g,this.color.b,this.color.a));
   }
   this.vBuffer = gl.createBuffer();
   this.vPosition = gl.getAttribLocation( this.program, "vPosition" );
   this.sendVertices = function(points){
      gl.useProgram( this.program );
      gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
      gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
      gl.vertexAttribPointer(this.vPosition, 4, gl.FLOAT, false, 0, 0 );
      gl.enableVertexAttribArray(this.vPosition );
   }
   this.sendOptions = function(){
      this.thetaLoc = gl.getUniformLocation(this.program, "theta");
      gl.uniform3fv(this.thetaLoc, vec3(this.rotation.x,this.rotation.y,this.rotation.z));
      this.translateLoc = gl.getUniformLocation(this.program, "translate");
      gl.uniform3fv(this.translateLoc, vec3(this.location.x,this.location.y,this.location.z));
   }
   
   this.toString = function(){
      return this.type+"@("+this.location.x+","+this.location.y+","+this.location.z+"); orientation("+this.rotation.x+","+this.rotation.y+","+this.rotation.z+"); color("+this.color.r+","+this.color.g+","+this.color.b+","+this.color.a+")";
   }
   return this;
}


Array.prototype.extend = function (other_array) {
   /* you should include a test to check whether other_array really is an array */
   other_array.forEach(function(v) {this.push(v)}, this);
}


//Globals
var canvas;
var gl;
var objects=[];
var currentObject=0;
var locX;
var locY;
var locZ;
var rotX;
var rotY;
var rotZ;
var type;
var radius;
var height;
var colR;
var colG;
var colB;
var colA;
var objectList;
var perspectiveToggle;
var tessellations = 2;


var near;// = 0.3;
var far;//= 10.0;
var rad;// = 3.0;
var theta;// = 0.0;
var phi;// = 60.0;
var dr = 5.0*Math.PI/180.0;
var fovy;// = 120;
var aspect;// = 1;
var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//Init
window.onload = function init(){
   canvas = document.getElementById("gl-canvas");
   window.onresize = scaleCanvas;
   scaleCanvas();
   gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true, alpha:false});
   if ( !gl ) { alert( "WebGL isn't available" ); }
   
   gl.viewport( 0, 0, canvas.width, canvas.height );
   gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
   gl.enable(gl.DEPTH_TEST);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   gl.enable(gl.BLEND);
   
   locX = new LinkedVar("locX","locX2",updateObject);
   locY = new LinkedVar("locY","locY2",updateObject);
   locZ = new LinkedVar("locZ","locZ2",updateObject);
   rotX = new LinkedVar("rotX","rotX2",updateObject);
   rotY = new LinkedVar("rotY","rotY2",updateObject);
   rotZ = new LinkedVar("rotZ","rotZ2",updateObject);
   type = new InputVar("objectType", updateType);
   radius = new InputVar("radius", updateObject);
   height = new InputVar("height",updateObject);
   colR = new LinkedVar("colR","colR2",updateObject);
   colG = new LinkedVar("colG","colG2",updateObject);
   colB = new LinkedVar("colB","colB2",updateObject);
   colA = new LinkedVar("colA","colA2",updateObject);
   objectList = new InputVar("objects",switchObject);
   perspectiveToggle = new InputVar("perspective",render);
   perspectiveToggle.val(false);
   tessellation = new InputVar("res",render);
   near = new InputVar("near",render);
   far = new InputVar("far",render);
   rad = new InputVar("rad",render);
   theta = new InputVar("theta",render);
   phi = new InputVar("phi",render);
   fovy = new InputVar("fovy",render);
   aspect = new InputVar("aspect",render);
   
   document.getElementById("newObject").onclick= newObject;
   document.getElementById("delObject").onclick= deleteObject;
   
   
   newObject();
   render();
   
}
//Core functions
var points = []
function render(){
   
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   for(var i=0;i<objects.length;i++){
      tessellations = tessellation.val();
      //Generate geometry
      points = [];
      switch(objects[i].type){
         case "cube":
            colorCube(objects[i].height);
            break;
         case "cone":
            //make a circle and a dot.
            r = Number(objects[i].radius);
            h = Number(objects[i].height);
            vertices = [
                        vec4(-r,0,0,1),
                        vec4(0,0,r,1),
                        vec4(r,0,0,1),
                        vec4(0,0,-r,1),
                        ]
            for(j=0;j<vertices.length;j++){
               endpointIndex = j+1;
               if(endpointIndex == vertices.length){
                  endpointIndex = 0;
               }
               tessellate(vec4(0,h,0,1),vertices[j],vertices[endpointIndex],tessellations);
            }
            for(var k=0;k<points.length;k++){
               if(points[k][1]!=h){
//                  console.log(k,points[k]);
                  points[k][1]=0;
                  points[k] = norm(points[k],r);
               }
            }
            break;
         case "sphere":
            //tessellate and normalize some a solid.
            r = objects[i].radius;
            console.log(r);
            vertices1 = [
                         vec4( 0,  r,  0, 1),
                         vec4( 0,  -r,  0, 1)
                         ];
            vertices2 = [
                         vec4( -r,  0,  0, 1),
                         vec4( 0,  0,  r, 1),
                         vec4( r,  0,  0, 1),
                         vec4( 0,  0, -r, 1),
                         ];
            for(var j=0;j<vertices1.length;j++){
               for(var k=0;k<vertices2.length;k++){
                  endpointIndex = k+1;
                  if(endpointIndex == vertices2.length){
                     endpointIndex = 0;
                  }
                  tessellate (vertices1[j],vertices2[k],vertices2[endpointIndex], tessellations);
               }
            }
            var npoints=[];
            for(var j=0;j<points.length;j++){
               npoints.push(norm(points[j],r));
            }
            points=npoints;
            break;
         case "cylinder":
            //two circles, drum lacing.
            h=objects[i].height/2;
            r = Number(objects[i].radius);
            vertices = [
                        vec4(-r,h,0,1),
                        vec4(0,h,r,1),
                        vec4(0,-h,r,1),
                        vec4(r,h,0,1),
                        vec4(r,-h,0,1),
                        vec4(0,h,-r,1),
                        vec4(0,-h,-r,1),
                        vec4(-r,-h,0,1),
                        ]
            for(var j=0;j<vertices.length;j++){
               midpointIndex = j+1;
               if(midpointIndex == vertices.length){
                  midpointIndex = 0;
               }
               endpointIndex=midpointIndex+1;
               if(endpointIndex==vertices.length){
                  endpointIndex=0;
               }
               tessellate (vertices[j],vertices[midpointIndex],vertices[endpointIndex], tessellations);
               if(endpointIndex == 1){
                  endpointIndex=5;
                  tessellate (vertices[j],vertices[midpointIndex],vertices[endpointIndex], tessellations);
                  tessellate (vertices[0],vertices[7],vertices[2], tessellations);
               }
               //                  points=vertices;
            }
            var npoints=[];
            for(var j=0;j<points.length;j++){
               p=norm([points[j][0],points[j][2]],r);
               p[2]=p[1];
               p[1]=points[j][1]; //reset y
               npoints.push(p);
            }
            //            points=npoints;
            vertices2=[];
            points=[];
            for(var k=0;k<vertices.length;k++){
               vertices2.push(vec2(vertices[k][0],vertices[k][2]));
            }
            for(var j=0;j<vertices2.length;j++){
               midpointIndex = j+1;
               if(midpointIndex == vertices2.length){
                  midpointIndex = 0;
               }
               tessellate (vec2(0,0),vertices2[j],vertices2[midpointIndex], tessellations);
            }
            for(var m=0;m<points.length;m++){
               points[m] = norm(points[m],r);
            }
            for(var n=-1;n<2;n=n+2){
               for(var m=0;m<points.length;m++){
                  //                  console.log(" "+points[m]);
                  npoints.push(vec4(points[m][0],n*h,points[m][1],1));
                  //                  console.log(points[m])
               }
            }
            //            points.extend(npoints);
            points=npoints;
            break;
      }
      
      
      
      gl.useProgram( objects[i].program );
      objects[i].sendColor();
      objects[i].sendVertices(points);
      objects[i].sendOptions();
      
      modelViewMatrixLoc = gl.getUniformLocation( objects[i].program, "modelViewMatrix" );
      projectionMatrixLoc = gl.getUniformLocation( objects[i].program, "projectionMatrix" );
      eye = vec3(rad.val()*Math.sin(radians(theta.val()))*Math.cos(radians(phi.val())),
                 rad.val()*Math.sin(radians(theta.val()))*Math.sin(radians(phi.val())), rad.val()*Math.cos(radians(theta.val())));
      modelViewMatrix = lookAt(eye, at , up);
      
      

      if(perspectiveToggle.val()){
         projectionMatrix = perspective(fovy.val(), aspect.val(), near.val(), far.val());
      }else{
         projectionMatrix = ortho(-5,5,-5,5,5,-5);
      }
      
      gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(modelViewMatrix) );
      gl.uniformMatrix4fv( projectionMatrixLoc, false, flatten(projectionMatrix) );
      //            console.log(points,points.length);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,(points).length);
      gl.uniform4fv(objects[i].colorLoc,vec4(0.0,0.0,0.0,1.0));
      gl.drawArrays(gl.LINE_LOOP,0,(points).length);
   }
}

function tessellate(a,b,c,count){
   //check for end of recursion
   if(count==0) {
      
      points.push(a,b,c);
   }
   else {
      //bisect sides
      var ab = mix(a,b,0.5);
      var ac = mix(a,c,0.5);
      var bc = mix(b,c,0.5);
      // count--;
      //new triangles
      tessellate(c,ac,bc,count-1,radius);
      tessellate(a,ab,ac,count-1,radius);
      tessellate(ab,bc,ac,count-1,radius);
      tessellate(b,bc,ab,count-1,radius);
      
   }
}

function norm(a,radius){
   if(radius == undefined || radius <=0){
      radius = 0.001;
   }
   if(a[2]==undefined){
      a[2]=0;
   }
   al = Math.sqrt(Math.pow(a[0],2)+Math.pow(a[1],2)+Math.pow(a[2],2));
   if(al!=0){
      a2 = vec4(a[0]/al*radius,a[1]/al*radius,a[2]/al*radius,1);
   }else{
      a2=a;
   }
   newl = Math.sqrt(Math.pow(a2[0],2)+Math.pow(a2[1],2)+Math.pow(a2[2],2));
   if(isNaN(newl)){
      console.log("uh-oh");
   }
   //   console.log(a,al,a2,newl);
   return a2;
   
}


function colorCube(height){
   quad( 1, 0, 3, 2,height );
   quad( 2, 3, 7, 6,height );
   quad( 3, 0, 4, 7,height );
   quad( 6, 5, 1, 2,height );
   quad( 4, 5, 6, 7,height );
   quad( 5, 4, 0, 1,height );
}
function quad(a, b, c, d,height) {
   var vertices = [
                   vec4( -0.5*height, -0.5*height,  0.5*height, 1.0 ),
                   vec4( -0.5*height,  0.5*height,  0.5*height, 1.0 ),
                   vec4(  0.5*height,  0.5*height,  0.5*height, 1.0 ),
                   vec4(  0.5*height, -0.5*height,  0.5*height, 1.0 ),
                   vec4( -0.5*height, -0.5*height, -0.5*height, 1.0 ),
                   vec4( -0.5*height,  0.5*height, -0.5*height, 1.0 ),
                   vec4(  0.5*height,  0.5*height, -0.5*height, 1.0 ),
                   vec4(  0.5*height, -0.5*height, -0.5*height, 1.0 )
                   ];
   //partition into triangles
   
   var indices = [ a, b, c, a, c, d ];
   
   for ( var i = 0; i < indices.length; ++i ) {
      points.push( vertices[indices[i]] );
   }
}


//Interactivity
function updateType(e){
   updateObject(e);
}

function switchObject(e){
   currentObject = objectList.val();
   var options = JSON.parse(JSON.stringify(objects[currentObject]));
   type.val(options.type,false);
   locX.val(options.location.x,false);
   locY.val(options.location.y,false);
   locZ.val(options.location.z,false);
   rotX.val(options.rotation.x,false);
   rotY.val(options.rotation.y,false);
   rotZ.val(options.rotation.z,false);
   height.val(options.height,false);
   radius.val(options.radius,false);
   colR.val(options.color.r,false);
   colG.val(options.color.g,false);
   colB.val(options.color.b,false);
   colA.val(options.color.a,false);
   
   
}
function newObject(){
   options ={};
   options.type=type.val();
   options.location={};
   options.location.x=locX.val();
   options.location.y=locY.val();
   options.location.z=locZ.val();
   options.rotation={};
   options.rotation.x=rotX.val();
   options.rotation.y=rotY.val();
   options.rotation.z=rotZ.val();
   options.radius = radius.val();
   options.height = height.val();
   options.color = {};
   options.color.r = colR.val();
   options.color.g = colG.val();
   options.color.b = colB.val();
   options.color.a = colA.val();
   console.log(options);
   var x = new DrawObject(options);
   currentObject=objects.length;//old length = new index
   objects.push(x);
   objectList.val(currentObject);
   objectList.options[currentObject].text=x.toString();
   objectList.element.selectedIndex=currentObject;
   updateObject();
   
}
function updateObject(){
   objects[currentObject].type=type.val();
   objects[currentObject].location.x=locX.val();
   objects[currentObject].location.y=locY.val();
   objects[currentObject].location.z=locZ.val();
   objects[currentObject].rotation.x=rotX.val();
   objects[currentObject].rotation.y=rotY.val();
   objects[currentObject].rotation.z=rotZ.val();
   objects[currentObject].radius=radius.val();
   objects[currentObject].height=height.val();
   objects[currentObject].color.r = colR.val();
   objects[currentObject].color.g = colG.val();
   objects[currentObject].color.b = colB.val();
   objects[currentObject].color.a = colA.val();
   
   //objectList.options[currentObject].text = currentObject;
   objectList.options[currentObject].text = objects[currentObject].toString();
   render();
}
function deleteObject(){
   console.log(objectList.val(),currentObject,objects);
   objects.splice(currentObject,1);
   objectList.element.remove(currentObject);
   //   if(currentObject==objects.length){
   //      currentObject--;
   //   }
   //   objectList.val(currentObject);
   if(objects[currentObject]==undefined){
      currentObject--;
   }
   console.log(objectList.val()==currentObject,objects);
   render();
}
function scaleCanvas(){
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
}
function updateOutput(e){;
   output = document.getElementById(e.id+"output");
   output.innerText = e.val();
   updateObject(e);
   
}