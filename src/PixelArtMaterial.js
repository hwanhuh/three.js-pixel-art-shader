import * as THREE from 'three';
import vertexShader from './shaders/pixelArt.vert.glsl';
import fragmentShader from './shaders/pixelArt.frag.glsl';
import { ditherPatterns } from './dither.js';

export class PixelArtMaterial extends THREE.ShaderMaterial {
    constructor(options) {
        super({
            uniforms: {
                uLight1Direction: { value: new THREE.Vector3(0.5, 0.5, 0.5).normalize() },
                uLight1Color: { value: new THREE.Color(options?.light1Color || '#ff0000') },
                uLight2Direction: { value: new THREE.Vector3(0.5, 0.5, 0.5).normalize() },
                uLight2Color: { value: new THREE.Color(options?.light2Color || '#00ff00') },
                uLight3Direction: { value: new THREE.Vector3(0.5, 0.5, 0.5).normalize() },
                uLight3Color: { value: new THREE.Color(options?.light3Color || '#0000ff') },

                uAmbientLight: { value: new THREE.Color(0xeeeeee) },
                uBrightness: { value: options?.brightness || 5.0 },

                uDiffuseMap: { value: options?.map || null },
                uDitherMode: { value: 0 },
                uDitherTexture: { value: ditherPatterns['Bayer 4x4'].texture },
                uDitherTextureResolution: { value: ditherPatterns['Bayer 4x4'].resolution },
                uDitherStrength: { value: options?.ditherStrength || 0.2 },
                uHalftoneSpacing: { value: 8.0 },
                uThresholds: { value: [0.01, 0.075, 0.225, 0.450, 0.800] }, 

                uColorPaletteR: { value: [
                    new THREE.Color(0x000000), new THREE.Color(0x300810),
                    new THREE.Color(0x56100b), new THREE.Color(0x9a230c),
                    new THREE.Color(0xc74614), new THREE.Color(0xf37917)
                ] },
                uColorPaletteG: { value: [
                    new THREE.Color(0x000000), new THREE.Color(0x021912),
                    new THREE.Color(0x021912), new THREE.Color(0x047f2b),
                    new THREE.Color(0x47b224), new THREE.Color(0x9abb26)
                ] },
                uColorPaletteB: { value: [
                    new THREE.Color(0x000000), new THREE.Color(0x090916),
                    new THREE.Color(0x11122e), new THREE.Color(0x132173),
                    new THREE.Color(0x1352c7), new THREE.Color(0x45a4ff)
                ] },
                
                uPixelationMix: { value: 1.0 },
            },
            vertexShader,
            fragmentShader,
        });
    }
}
