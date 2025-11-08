varying vec3 vColor;
varying float positionY;

uniform vec3 uLightDirection;

void main() {
  vec3 tipColor = vec3(0.05, 0.2, 0.01);
  vec3 baseColor = vec3(0.5, 0.5, 0.1);
 
  vec3 mixedColor = mix(tipColor, baseColor, positionY*positionY);
  gl_FragColor = vec4(mixedColor, 1.0);
}
