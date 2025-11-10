varying vec3 vColor;
varying float positionY;

uniform vec3 uLightDirection;
uniform vec3 uBladeTipColor;
uniform vec3 uBladeBaseColor;

void main() {
  vec3 tipColor = uBladeTipColor;
  vec3 baseColor = uBladeBaseColor;

  vec3 mixedColor = mix(baseColor, tipColor, positionY + 0.7);
  gl_FragColor = vec4(mixedColor, 1.0);
}
