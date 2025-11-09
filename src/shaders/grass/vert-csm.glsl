uniform float uTime;

attribute vec3 color;

varying vec3 vColor;
varying float positionY;

float TAO = 2.0 * 3.14159265359;

//	Classic Perlin 2D Noise
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec2 fade(vec2 t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}
vec4 permute(vec4 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float cnoise(vec2 P) {
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, 289.0); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;
  vec4 i = permute(permute(ix) + iy);
  vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0; // 1/41 = 0.024...
  vec4 gy = abs(gx) - 0.5;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;
  vec2 g00 = vec2(gx.x, gy.x);
  vec2 g10 = vec2(gx.y, gy.y);
  vec2 g01 = vec2(gx.z, gy.z);
  vec2 g11 = vec2(gx.w, gy.w);
  vec4 norm = 1.79284291400159 - 0.85373472095314 *
        vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;
  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));
  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

float random(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

mat4 rotateY(float angle) {
  float c = cos(angle);
  float s = sin(angle);

  return mat4(
    c, 0.0, s, 0.0,
    0.0, 1.0, 0.0, 0.0,
    -s, 0.0, c, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

mat4 rotateX(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, c, s, 0.0,
    0.0, -s, c, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

vec3 deform(vec3 position, vec2 randomSeed) {
  vec3 modifiedPosition = position;
  modifiedPosition.y -= pow(abs(position.x * 15.0), 1.5);
  modifiedPosition.z += pow(1.0 + random(randomSeed) * 0.5, modifiedPosition.y * random(randomSeed));

  float curveIntensity = 0.3;
  modifiedPosition.z -= sqrt(1.0 - pow(position.x / 0.1, 2.0)) * curveIntensity;

  float scaleFactor = 0.4 + random(randomSeed) * 0.2;
  //scaling Matrix
  mat4 scaleMatrix = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, scaleFactor, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0
    );

  mat4 translationMatrix = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, -1.0, 0.0, 1.0
    );
  //rotation Matrix
  float randomRotation = random(randomSeed) * TAO;
  mat4 rotationTransformationMatrix = rotateY(randomRotation);
  mat4 combinedTransformationMatrix = translationMatrix * scaleMatrix * rotationTransformationMatrix;
  modifiedPosition = (combinedTransformationMatrix * vec4(modifiedPosition.xyz, 1.0)).xyz;

  return modifiedPosition;
}

void applyCurve(inout vec3 pos, vec3 nor) {
  float curveIntensity = 0.2;
  mat4 translationMatrix = mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, nor.y * curveIntensity, 0.0, 1.0
    );

  pos = (translationMatrix * vec4(pos, 1.0)).xyz;
}

void applyWind(inout vec3 pos, vec2 worldPosition) {
  // Sample perlin noise based on world position + time moving left to right
  float windSpeed = 0.9; // How fast the wind pattern moves
  float windScale = 0.2; // Size of wind waves (smaller = larger waves)

  vec2 noiseInput = vec2(
      worldPosition.x * windScale + uTime * windSpeed,
      worldPosition.y * windScale
    );

  float noiseValue = cnoise(noiseInput); // Returns -1 to 1

  float windIntensity = (noiseValue + 1.0) * 0.5; // Now 0 to 1

  float heightFactor = (pos.y + 1.2) / 2.0; // 0 at base, 1 at tip
  heightFactor = pow(heightFactor, 2.2); // Square it so tip bends much more

  vec2 windDirection = vec2(1.0, 0.2); // Mostly X direction, slight Z
  windDirection = normalize(windDirection);

  float bendStrength = windIntensity * 7.8 * heightFactor; // 0.8 is max bend

  pos.x -= windDirection.x * bendStrength;
  pos.z -= windDirection.y * bendStrength;
}
void applyDeformation(inout vec3 pos, inout vec3 nor, vec2 randomSeed) {
  vec3 defomedPosition = deform(pos, randomSeed);

  applyWind(defomedPosition, randomSeed);

  //ok cool now i have modified the positions;

  //ok now lets caluate the normals
  float delta = 0.001;
  vec3 dx = vec3(pos.x + delta, pos.y, pos.z);
  vec3 dz = vec3(pos.x, pos.y, pos.z + delta);

  vec3 deformDx = deform(dx, randomSeed);
  vec3 deformDz = deform(dz, randomSeed);

  vec3 newNormal = normalize(cross(deformDx, deformDz));

  pos = defomedPosition;
  nor = newNormal;
}
void main() {
  vColor = color;
  vec2 randomSeed = vec2(instanceMatrix[3].x, instanceMatrix[3].z);
  vec3 pos = position;
  vec3 nor = normal;

  applyDeformation(pos, nor, randomSeed);

  vec4 modelPosition = modelMatrix * instanceMatrix * vec4(pos, 1.0);
  positionY = modelPosition.y;

  // vec4 viewPosition = viewMatrix * modelPosition;
  // vec4 projectedPosition = projectionMatrix * viewPosition;

  //  gl_Position=projectedPosition;

  csm_Position = pos;
  csm_Normal = nor;
}
