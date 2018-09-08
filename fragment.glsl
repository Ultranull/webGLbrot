//#version 330 core

precision mediump float;

uniform vec2 iResolution;
uniform float time;

uniform vec2 pos;
uniform float zoom;
uniform int maxIter;

float box(in vec2 st, in vec2 size){
    size = vec2(0.5) - size*0.5;
    vec2 uv = smoothstep(size,
                        size+vec2(0.001),
                        st);
    uv *= smoothstep(size,
                    size+vec2(0.001),
                    vec2(1.0)-st);
    return uv.x*uv.y;
}

float aimer(in vec2 st, float size){
    return  box(st, vec2(size,size/16.)) +
            box(st, vec2(size/16.,size));
}

void main(){
    vec2 st = (gl_FragCoord.xy/iResolution.xy);
	vec2 z;//=vec2(cos(time/10.),sin(time/10.));
    vec2 c=pos+((st*4.)-2.)*zoom;
    int ind;
    //const int mx=maxIter;
    for(int i=0;i<1000;i++){
        ind=i;
        if(i>=maxIter)break;
        if(z.x*z.x+z.y*z.y>=400.)break;
        float t=z.x*z.x-z.y*z.y+c.x;
        z.y=2.*z.x*z.y+c.y;z.x=t;
    }
    float zmag=sqrt(z.x*z.x+z.y*z.y);
    float lvl=( float(ind) + 1. - log(log(abs(zmag)) / log(30.)));
	float grad=log(float(ind))/log(zmag);
    vec3 color = ind>=maxIter?
			mix(mix(vec3(1.,0.,0.), vec3(0.,1.,0.), fract(grad)),vec3(0.,0.,1.),fract((grad/2.))):
    		abs(vec3(sin(.02*lvl),
					 sin(.03*lvl),
					 sin(.04*lvl)));
    gl_FragColor = vec4(color*(1.-aimer(st,.05)),1.0);
}