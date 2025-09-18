import * as THREE from 'three';
import vertexShader from './shaders/outline.vert.glsl';
import fragmentShader from './shaders/outline.frag.glsl';

export class OutlineMaterial extends THREE.ShaderMaterial {
    constructor(options) {
        super({
            uniforms: {
                uOutlineThickness: { value: options?.outlineThickness || 0.01 },
                uOutlineColor: { value: new THREE.Color(options?.outlineColor || '#000000') },
                uOutlineOpacity: { value: options?.outlineOpacity || 1.0 }
            },
            vertexShader,
            fragmentShader,
            side: THREE.BackSide,
        });
    }
}
