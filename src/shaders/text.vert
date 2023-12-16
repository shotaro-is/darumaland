uniform float time;
varying vec2 vUv;
varying vec3 vPosition;
varying float vDebug;
uniform vec2 pixels;
uniform vec3 uMin;
uniform vec3 uMax;
float PI = 3.141592653589793238;
float radius = 1.;

float mapRange(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main() {

  float x = mapRange(position.x, uMin.x, uMax.x, -PI, PI);
  vUv = uv;
  vDebug = x;

  vec3 dir = vec3(sin(x+time*0.1), 0.0 , cos(x+time*0.1));
  vec3 pos = radius*dir + vec3(0., position.y-x*0.2, 0.0) + 3.0*dir*position.z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}