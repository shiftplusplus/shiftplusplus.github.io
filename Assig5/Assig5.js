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
            if(!isNaN(Number(x))){
               this.v=Number(x);
            }else{
               this.v = x;
            }
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
function deg2Rad(deg){
   return (Math.PI/180*deg);
}

var points = [];//[[0.5,0,0,1],[0,0,0,1],[0.5,0.5,0,1]];
var texCoords=[];
var checkImage;
latitudes=[];
texCoordslats = [];

window.onload = function init(){
   canvas = document.getElementById("gl-canvas");
   window.onresize = scaleCanvas;
   scaleCanvas();
   gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer: true, alpha:false});
   if ( !gl ) { alert( "WebGL isn't available" ); }
   
   
   program = initShaders( gl,"vertex-shader","fragment-shader");
   gl.useProgram(program);
   
   gl.viewport( 0, 0, canvas.width, canvas.height );
   gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
   gl.enable(gl.DEPTH_TEST);
   gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   gl.enable(gl.BLEND);
   
   generateCheckerboardImage();
   
   render();
}

function generateCheckerboardImage(texSize,numChecks){
   texSize = texSize || 512; //Whatever
   numChecks = numChecks || 8; //Whatever
   
   var image1 = new Uint8Array(4*texSize*texSize);
   
   for ( var i = 0; i < texSize; i++ ) {
      for ( var j = 0; j <texSize; j++ ) {
         var patchx = Math.floor(i/(texSize/numChecks));
         var patchy = Math.floor(j/(texSize/numChecks));
         if(patchx%2 ^ patchy%2) c = 255;
         else c = 0;
         image1[4*i*texSize+4*j] = c;
         image1[4*i*texSize+4*j+1] = c;
         image1[4*i*texSize+4*j+2] = c;
         image1[4*i*texSize+4*j+3] = 255;
      }
   }
   checkImage = image1;
}


function render(){
   lightPosition = [
                    vec4(1,1,1,0),
                    ];
   
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
   r= 0.5;
   latitudes = [];
   texCoordslats=[];
   increment = 10;
   for(var lat=-90;lat<=90;lat+=increment){
      latc = Math.cos(deg2Rad(lat));
      lats = Math.sin(deg2Rad(lat));
      latitude=[];
      texCoordslat=[];
      for(var long =-180; long <=180; long+=increment){
         longc = Math.cos(deg2Rad(long));
         longs = Math.sin(deg2Rad(long));
         latitude.push(vec4(r*longs*latc,r*longc,r*longs*lats,1.0));
         texCoordslat.push(vec2((lat+90)/180,(long+180)/360));
//         latitude.push(" "+lat+" " +long);
         
      }
      latitudes.push(latitude);
      texCoordslats.push(texCoordslat);
   }
   for(var i = 0; i<latitudes.length-1; i++){
      for(var j = 0; j<latitude.length; j++){
         points.push(latitudes[i][j]);
         points.push(latitudes[i+1][j]);
         texCoords.push(texCoordslats[i][j]);
         texCoords.push(texCoordslats[i+1][j]);
      }
   }
   
//    console.log(latitudes);
   
   bufferID = gl.createBuffer();
   gl.bindBuffer(gl.ARRAY_BUFFER,bufferID);
   gl.bufferData(gl.ARRAY_BUFFER,flatten(points),gl.STATIC_DRAW);
   vPosition = gl.getAttribLocation(program,"vPosition");
   gl.vertexAttribPointer( vPosition,4,gl.FLOAT,false,0,0);
   gl.enableVertexAttribArray(vPosition);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,points.length);
}

function scaleCanvas(){
   canvas.width = window.innerWidth;
   canvas.height = window.innerHeight;
}
