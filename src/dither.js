import * as THREE from 'three';

const bayer = new Uint8Array([ 0, 128, 32, 160, 192, 64, 224, 96, 48, 176, 16, 144, 240, 112, 208, 80 ]);
const bayerTexture = new THREE.DataTexture(bayer, 4, 4, THREE.LuminanceFormat, THREE.UnsignedByteType);
bayerTexture.magFilter = THREE.NearestFilter;
bayerTexture.minFilter = THREE.NearestFilter;
bayerTexture.wrapS = THREE.RepeatWrapping;
bayerTexture.wrapT = THREE.RepeatWrapping;
bayerTexture.needsUpdate = true;

function createNoiseTexture(size) {
    const data = new Uint8Array(size * size);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 255;
    const texture = new THREE.DataTexture(data, size, size, THREE.LuminanceFormat, THREE.UnsignedByteType);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
}
const whiteNoiseTexture = createNoiseTexture(64);

export const ditherPatterns = {
    'Bayer 4x4':        { mode: 0, texture: bayerTexture, resolution: new THREE.Vector2(4, 4) },
    'White Noise 64x64':{ mode: 0, texture: whiteNoiseTexture, resolution: new THREE.Vector2(64, 64) },
    'Halftone':         { mode: 1, texture: null, resolution: null }
};
