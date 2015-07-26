function mix( u, v, s )
{
    if ( typeof s !== "number" ) {
        throw "mix: the last paramter " + s + " must be a number";
    }
    
    if ( u.length != v.length ) {
        throw "vector dimension mismatch";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] + (1.0 - s) * v[i] );
    }

    return result;
}


var fractal;
var data;
var points = Array();
self.addEventListener('message',onReceive);

function triangle(a,b,c){
    points.push(a,b,c);
}


function onReceive(e){
    data = e.data;
    fractal = data.fractal;
    tessellate(data.a,data.b,data.c,data.count);
    postMessage(points);
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