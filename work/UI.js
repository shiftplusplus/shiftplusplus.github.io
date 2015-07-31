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
            }
            if(this.change != null){
               this.change(this);
            }
         }else{ //get
            
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
   this.rotation.x=0;
   this.rotation.y=0;
   this.rotation.z=0;
   this.radius=1;
   this.height=1;
   this.color = {};
   this.color.r = 1;
   this.color.g =1;
   this.color.b = 1;
   this.color.a = 1;
   
   if(options){
      if(options.type) this.type = options.type;
      if(options.location) this.location = options.location;
      if(options.rotation) this.rotation = options.rotation;
      if(options.radius) this.radius = options.radius;
      if(options.height) this.height = options.height;
   }
   
   //each object must supply its own GL buffers
   this.program = initShaders(gl,"vertex-shader","fragment-shader");
   gl.useProgram(this.program);
   this.cBuffer = gl.createBuffer();
   this.vBuffer = gl.createBuffer();
   this.sendColor = function(){
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.cBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,flatten([this.color.r,this.color.g,this.color.b,this.color.a]),gl.STATIC_DRAW);
      this.vColor = gl.getAttribLocation(program,"vColor");
      gl.vertexAttribPointer(vColor,4,gl.FLOAT,false,0,0);
      gl.enableVertexAttribArray(vColor);
   }
   this.sendVertices = function(points){
      gl.useProgram(this.program);
      gl.bindBuffer(gl.ARRAY_BUFFER,this.vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
   }
   
   this.toString = function(){
      return this.type+"@("+this.location.x+","+this.location.y+","+this.location.z+"); orientation("+this.rotation.x+","+this.rotation.y+","+this.rotation.z+"); color("+this.color.r+","+this.color.g+","+this.color.b+","+this.color.a+")";
   }
   return this;
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

//Init
window.onload = function init(){
   canvas = document.getElementById("gl-canvas");
   window.onresize = scaleCanvas;
   scaleCanvas();
   gl = WebGLUtils.setupWebGL( canvas );
   if ( !gl ) { alert( "WebGL isn't available" ); }
   
   gl.viewport( 0, 0, canvas.width, canvas.height );
   gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
   gl.enable(gl.DEPTH_TEST);
   
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
   
   document.getElementById("newObject").onclick= newObject;
   document.getElementById("delObject").onclick= deleteObject;
   
   newObject();
   
}
//Core functions
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