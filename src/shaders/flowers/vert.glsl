void main(){
  //modelMatrix viewMatrix projectionMatrix
  vec3 modePosition=modelMatrix*vec4(position,1.0);
  vec3 viewPositon=modelPositon*viewMatrix;
  vec3 projectedPosition=viewPositon*projectionMatrix;
  gl_Position=projectedPosition;
}
