# Three.js Pixel Art Shader

A collection of shaders, materials, and post-processing effects to achieve a pixel-art-style rendering in [three.js](https://threejs.org/).

This package includes a `PixelArtMaterial` for cel-shaded/quantized lighting, an `OutlineMaterial` for cartoon-style outlines, and a `PixelationPass` for CRT-like screen curvature, scanlines, and resolution scaling.

## Demo

[Link to live demo (GitHub Pages)](https://hwanhuh.github.io/three.js-pixel-art-shader/)

*(You will need to set up GitHub Pages for this link to work)*

## Installation

```bash
npm install three three-pixel-art-shader
```

## Usage

Here is a basic example of how to set up the materials and the post-processing pass.

```javascript
import * as THREE from 'three';
import { PixelArtMaterial, OutlineMaterial, PixelationPass } from 'three-pixel-art-shader';

// 1. Setup basic three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
document.body.appendChild(renderer.domElement);

// 2. Create the materials
const pixelArtMaterial = new PixelArtMaterial({
  map: yourTexture, // Diffuse texture
  brightness: 6.0,
  ditherStrength: 0.3,
});

const outlineMaterial = new OutlineMaterial({
  outlineThickness: 0.02,
  outlineColor: new THREE.Color('#111111'),
});

// 3. Create your main mesh and an outline mesh
const geometry = new THREE.BoxGeometry();
const mesh = new THREE.Mesh(geometry, pixelArtMaterial);
scene.add(mesh);

const outlineMesh = new THREE.Mesh(geometry, outlineMaterial);
outlineMesh.scale.multiplyScalar(1.02); // Scale outline slightly larger
scene.add(outlineMesh);

// 4. Setup the post-processing pass
const pass = new PixelationPass(renderer, {
    effectiveResolutionX: 320,
    effectiveResolutionY: 240,
    curvatureAmount: 0.3,
    scanlineIntensity: 0.1,
});

// 5. Render loop
function animate() {
  requestAnimationFrame(animate);
  
  // Instead of renderer.render(scene, camera)
  pass.render(scene, camera);
}

animate();
```

## Development

To set up the local development environment, clone the repository and install the dependencies.

```bash
git clone https://github.com/hwanhuh/three.js-pixel-art-shader.git
cd three.js-pixel-art-shader
npm install
```

### Running the Example

To run the local development server for the example application:

```bash
npm run dev
```

This will start a Vite development server and open the example page in your browser.

### Building the Library

To build the distributable library files from the `src` directory:

```bash
npm run build
```

This will generate `dist/three-pixel-art-shader.js` (ESM) and `dist/three-pixel-art-shader.umd.cjs` (UMD).

### Building the Example for Deployment

To build the example application for deployment (e.g., to GitHub Pages):

```bash
npm run build:example
```

This command bundles the example into the `dist` folder. You can then configure your GitHub repository to deploy the `dist` folder to GitHub Pages.

## License

[MIT](LICENSE)