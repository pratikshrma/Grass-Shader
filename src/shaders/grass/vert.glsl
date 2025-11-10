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

//	Classic Perlin 3D Noise 
//	by Stefan Gustavson (https://github.com/stegu/webgl-noise)
//
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
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
  float delta = 0.01;
  vec3 dx = vec3(pos.x + delta, pos.y, pos.z);
  vec3 dz = vec3(pos.x, pos.y + delta, pos.z);

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
  modelPosition.y -= 0.4;
  modelPosition.y+=cnoise(vec3(randomSeed.xy,0.0))*0.7;

  // positionY = modelPosition.y;
  positionY = pos.y;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
