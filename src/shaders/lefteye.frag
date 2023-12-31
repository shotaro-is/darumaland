uniform float time;
uniform vec2 pattern;
uniform float color;
uniform float cycle;

uniform float progress;
uniform sampler2D texture1;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;
float PI = 3.141592653589793238;

vec3 palette(float t, float c)
{
	vec3 x = vec3(0.0);
	vec3 y = vec3(0.0);
	vec3 z = vec3(0.0);
	vec3 w = vec3(0.0);

	if (c == 1.0) {
		x = vec3(0.5,0.5,0.5);
		y = vec3(0.5,0.5,0.5);
		z = vec3(1.0,1.0,1.0);
		w = vec3(0.0,0.33,0.67); 
	} else if (c == 2.0){
		x = vec3(0.5,0.5,0.5);
		y = vec3(0.5,0.5,0.5);
		z = vec3(1.0,1.0,1.0);
		w = vec3(0.0,0.10,0.20);
	} else if (c == 3.0){
		x = vec3(0.5,0.5,0.5);
		y = vec3(0.5,0.5,0.5);
		z = vec3(1.0,1.0,1.0);
		w = vec3(0.3,0.20,0.20); 
	} else if (c == 4.0){
		x = vec3(0.5,0.5,0.5);
		y = vec3(0.5,0.5,0.5);
		z = vec3(1.0,1.0,0.5);
		w = vec3(0.8,0.90,0.30); 
	} else if ( c == 5.0){
		x = vec3(0.5,0.5,0.5);
		y = vec3(0.5,0.5,0.5);
		z = vec3(1.0,0.7,0.4);
		w = vec3(0.0,0.15,0.20); 
	} else if (c == 6.0){
		x = vec3(0.5,0.5,0.5);
		y = vec3(0.5,0.5,0.5);
		z = vec3(2.0,1.0,0.0);
		w = vec3(0.5,0.20,0.25);
	} else if (c == 7.0) {
		x =  vec3(0.8,0.5,0.4);
		y = vec3(0.2,0.4,0.2);
		z = vec3(2.0,1.0,1.0);
		w = vec3(0.0,0.25,0.25);
	} else {
		x = vec3(0.5, 0.5, 0.5);
		y = vec3(0.5, 0.5, 0.5);
		z = vec3(1.0, 1.0, 1.0);
		w = vec3(0.0, 0.0, 0.0);
	}

    return x + y*cos( 6.28318*(z*t+w) );
}

float ripple(float dist, float shift, float cycle)
{
    //return 0.01/abs(sin(8.0*dist - shift)/4.0);
    return sin(cycle * dist - shift) / (1.0 + 1.0 * dist);
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


void main()	{

	int POLES = 21;
	float REFLECTIONS = 10.0;
	vec2 cursor = pattern;

	vec3 finalColor = vec3(0.0);

	float d = length(vUv - vec2(0.5, 0.5))*exp(-length(vUv - vec2(0.5, 0.5)));

	vec3 col = palette(length(vUv -vec2(.5)) - 0.1*time, color);

	float r = ripple(d, 0.5*time, cycle);

	float lum = r;    
    float twopi = 2.0 *PI;
    int count = POLES;
    float fcount = float(count);
    
    float angle = twopi*0.628;
    vec2 rot = vec2(cos(angle), sin(angle));
    vec2 tor = vec2(-sin(angle), cos(angle));

	for (int i = 0; i < count; ++i)
    {
        lum += .2 * ripple(length(cursor-(vUv-0.5)), 1.0*time, cycle);
        cursor = cursor.x *rot + cursor.y*tor;
    }

	finalColor += col * lum;

	float fresnel = dot(cameraPosition, vNormal);
  	fresnel = abs(0.7 * fresnel * fresnel *fresnel);
	
	gl_FragColor = vec4(mix(vec3(0.0), finalColor, fresnel), 1.0);




	

	//gl_FragColor = vec4(finalColor,1.0);
}