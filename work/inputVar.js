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
         this.v=this.options[this.element.selectedIndex].value;
      }
      this.val = function(x){
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
                  console.warn("No Radio Button in group "+this.id+" has the value "+x+"; creating new radio button in parent of and before the first.");
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
                  console.warn("No option in select "+this.id+" has the value "+x+"; creating option at the end.")
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
            if(this.change != null){
               this.change(this);
            }
            return this.v;
         }else{ //get
            return this.v;
         }
      }
      var x=this;
      var onupdate =function(){
         if(this.type == "checkbox"){
            x.val(this.checked);
         }else{
            x.val(this.value);
         }
         
      };
      if(this.radio){
         for(var i=0;i<this.radioElements.length;i++){
            this.radioElements[i].onchange = onupdate;
         }
      }else{
         console.log(this);
         this.element.onchange = onupdate;
         this.element.onpaste = onupdate;
         this.element.onkeyup = onupdate;
      }
      
      
   }else{
      this.val = function(x){
         if(x){ //set
            this.v = x;
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


//Globals
var testText;
var testNum;
var testCheck;
var testRange;
var testColor;
var testRad;
var objects;

//Init
window.onload = function init(){
   testText = new InputVar("testText",testChange);
   testNum = new InputVar("testNum",testChange);
   testCheck = new InputVar("testCheck",testChange);
   testRange = new InputVar("testRange",testChange);
   testColor = new InputVar("testColor",testChange);
   testRad = new InputVar("testRad",testChange);
   objects = new InputVar("objects",testChange);
   
}

//Core functions

//Interactivity

function testChange(e){;
   output = document.getElementById(e.id+"output");
   output.innerText = e.val();
   
}