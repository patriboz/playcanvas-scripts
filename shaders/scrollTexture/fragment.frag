varying vec2 vUv0;

uniform sampler2D uEmissiveMap;
uniform sampler2D uOpacityMap;
uniform float uProgress;

void main(void)
{
  // Scrolling the emissive texture based on uProgress on x-axis
  vec4 color = texture2D(uEmissiveMap, vec2(vUv0.x + uProgress, vUv0.y));

  // Discarding pixels with alpha < 0.3 based on opacity texture
  vec4 opacity = texture2D(uOpacityMap, vUv0);
  
  if(opacity.a < 0.3) {
    discard;
  }
  
  
  gl_FragColor = color;
}