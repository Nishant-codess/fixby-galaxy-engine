// js/gl/post.js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

export function setupPostProcessing(state, tierSettings) {
  if (!tierSettings.bloom) return;
  
  state.composer = new EffectComposer(state.renderer);
  
  const renderPass = new RenderPass(state.scene, state.camera);
  state.composer.addPass(renderPass);
  
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // intensity
    0.4, // radius
    0.85 // threshold
  );
  
  state.composer.addPass(bloomPass);
  
  // Custom Vignette & Noise Shader
  const VignetteNoiseShader = {
    uniforms: {
      "tDiffuse": { value: null },
      "vignetteDarkness": { value: 0.45 },
      "noiseOpacity": { value: 0.022 },
      "time": { value: 0.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float vignetteDarkness;
      uniform float noiseOpacity;
      uniform float time;
      varying vec2 vUv;
      
      // Basic pseudo-random function
      float rand(vec2 co){
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        
        // Vignette
        vec2 uv = (vUv - vec2(0.5)) * vec2(1.0);
        float len = length(uv);
        float vignette = smoothstep(0.8, 0.2, len * vignetteDarkness + 0.4);
        texel.rgb *= vignette;
        
        // Noise
        float noise = rand(vUv * time) * noiseOpacity;
        texel.rgb += noise;
        
        gl_FragColor = texel;
      }
    `
  };
  
  const vignetteNoisePass = new ShaderPass(VignetteNoiseShader);
  vignetteNoisePass.renderToScreen = true;
  state.composer.addPass(vignetteNoisePass);
  
  state.postUniforms = vignetteNoisePass.uniforms;
}
