import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import GUI from 'lil-gui';
import { PixelArtMaterial, OutlineMaterial, PixelationPass, ditherPatterns } from '../src/index.js';

const scene = new THREE.Scene();
const backgroundColor = new THREE.Color(0xcccccc);
scene.background = backgroundColor;

// GUI
const gui = new GUI();
const params = {
    effectiveResolutionX: 480,
    effectiveResolutionY: 320,
    outlineThickness: 0.01,
    outlineColor: '#030303',
    ditherStrength: 0.2,
    light1Color: '#ff0000',
    light2Color: '#00ff00',
    light3Color: '#0000ff',
    brightness: 5.0,
    animateModel: false,
    backgroundColor: '#' + backgroundColor.getHexString(),
    fadeOpacity: 0.6, 
    showOutline: true,
    ditherPattern: 'Bayer 4x4', // Dithering pattern selector
    halftoneSpacing: 8.0, 
    targetCurvature: 0.25
};

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer();
renderer.setClearColor(backgroundColor);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const pixelationPass = new PixelationPass(renderer, {
    effectiveResolutionX: params.effectiveResolutionX,
    effectiveResolutionY: params.effectiveResolutionY,
    fadeOpacity: params.fadeOpacity,
    curvatureAmount: params.targetCurvature,
});

const pixelMaterial = new PixelArtMaterial({
    ditherStrength: params.ditherStrength,
    brightness: params.brightness,
    light1Color: params.light1Color,
    light2Color: params.light2Color,
    light3Color: params.light3Color,
});

const outlineMaterial = new OutlineMaterial({
    outlineThickness: params.outlineThickness,
    outlineColor: params.outlineColor,
});

// --- GUI Setup ---
const renderFolder = gui.addFolder('Render Settings');
renderFolder.add(params, 'effectiveResolutionX', 64, 1280, 1).name('Effective Res X').onChange(updateEffectiveRes);
renderFolder.add(params, 'effectiveResolutionY', 48, 720, 1).name('Effective Res Y').onChange(updateEffectiveRes);
renderFolder.add(pixelMaterial.uniforms.uDitherStrength, 'value', 0, 1, 0.01).name('Dither Strength');
renderFolder.add(pixelMaterial.uniforms.uBrightness, 'value', 0, 15, 0.1).name('Brightness');

renderFolder.add(pixelationPass.material.uniforms.uFadeOpacity, 'value', 0, 1, 0.01).name('Fade Opacity');
renderFolder.addColor(params, 'backgroundColor').name('Background Color').onChange(value => {
    const newColor = new THREE.Color(value);
    scene.background = newColor;
    renderer.setClearColor(newColor);
});

const ditherFolder = gui.addFolder('Dithering');
const halftoneSpacingController = ditherFolder.add(pixelMaterial.uniforms.uHalftoneSpacing, 'value', 2, 32, 0.5).name('Halftone Spacing');
halftoneSpacingController.disable();
ditherFolder.add(params, 'ditherPattern', Object.keys(ditherPatterns)).name('Pattern').onChange(value => {
    const selected = ditherPatterns[value];
    pixelMaterial.uniforms.uDitherMode.value = selected.mode;
    if (selected.mode === 0) {
        pixelMaterial.uniforms.uDitherTexture.value = selected.texture;
        pixelMaterial.uniforms.uDitherTextureResolution.value = selected.resolution;
        halftoneSpacingController.disable();
    } else {
        halftoneSpacingController.enable();
    }
});

const postFXFolder = gui.addFolder('Post-Processing');
postFXFolder.add(pixelationPass.material.uniforms.uAberrationAmount, 'value', 0, 0.02, 0.001).name('Aberration');
postFXFolder.add(pixelationPass.material.uniforms.uScanlineIntensity, 'value', 0, 0.5, 0.01).name('Scanlines');
postFXFolder.add(pixelationPass.material.uniforms.uCurvatureAmount, 'value', 0, 1.0, 0.01).name('CRT Curvature');

const outlineFolder = gui.addFolder('Outline Settings');
outlineFolder.add(params, 'showOutline').name('Show Outline').onChange(toggleOutlineVisibility);
outlineFolder.add(outlineMaterial.uniforms.uOutlineThickness, 'value', 0, 0.1, 0.001).name('Thickness');
outlineFolder.addColor(params, 'outlineColor').name('Color').onChange(value => {
    outlineMaterial.uniforms.uOutlineColor.value.set(value);
});
const light1Folder = gui.addFolder('Light 1');
light1Folder.add(pixelMaterial.uniforms.uLight1Direction.value, 'x', -1, 1, 0.01).name('Direction X');
light1Folder.add(pixelMaterial.uniforms.uLight1Direction.value, 'y', -1, 1, 0.01).name('Direction Y');
light1Folder.add(pixelMaterial.uniforms.uLight1Direction.value, 'z', -1, 1, 0.01).name('Direction Z');
light1Folder.addColor(params, 'light1Color').name('Color').onChange(value => {
    pixelMaterial.uniforms.uLight1Color.value.set(value);
});
const light2Folder = gui.addFolder('Light 2');
light2Folder.add(pixelMaterial.uniforms.uLight2Direction.value, 'x', -1, 1, 0.01).name('Direction X');
light2Folder.add(pixelMaterial.uniforms.uLight2Direction.value, 'y', -1, 1, 0.01).name('Direction Y');
light2Folder.add(pixelMaterial.uniforms.uLight2Direction.value, 'z', -1, 1, 0.01).name('Direction Z');
light2Folder.addColor(params, 'light2Color').name('Color').onChange(value => {
    pixelMaterial.uniforms.uLight2Color.value.set(value);
});
const light3Folder = gui.addFolder('Light 3');
light3Folder.add(pixelMaterial.uniforms.uLight3Direction.value, 'x', -1, 1, 0.01).name('Direction X');
light3Folder.add(pixelMaterial.uniforms.uLight3Direction.value, 'y', -1, 1, 0.01).name('Direction Y');
light3Folder.add(pixelMaterial.uniforms.uLight3Direction.value, 'z', -1, 1, 0.01).name('Direction Z');
light3Folder.addColor(params, 'light3Color').name('Color').onChange(value => {
    pixelMaterial.uniforms.uLight3Color.value.set(value);
});
const animationFolder = gui.addFolder('Animation');
const animateModelController = animationFolder.add(params, 'animateModel').name('Animate Model');

function updateEffectiveRes() {
    pixelationPass.material.uniforms.uEffectiveRes.value.set(params.effectiveResolutionX, params.effectiveResolutionY);
}

// --- Loader ---
let model;
const outlineMeshes = [];
const originalMaterials = new Map();
const loader = new GLTFLoader();

function loadModel(url) {
    // Clean up previous model
    if (model) {
        scene.remove(model);
        outlineMeshes.forEach(mesh => {
            if (mesh.parent) {
                mesh.parent.remove(mesh);
            }
        });
        outlineMeshes.length = 0;
        originalMaterials.clear();
    }

    loader.load(
        url,
        function (gltf) {
            model = gltf.scene;
            const meshesToProcess = [];

            model.traverse(function (child) {
                if (child.isMesh) {
                    meshesToProcess.push(child);
                    const standardMaterial = new THREE.MeshBasicMaterial({
                        map: child.material.map,
                    });
                    if(child.material.map) standardMaterial.map.colorSpace = THREE.SRGBColorSpace;
                    originalMaterials.set(child, standardMaterial);
                    child.material = standardMaterial;
                }
            });

            meshesToProcess.forEach(child => {
                if (child.material && child.material.map) {
                    child.material.map.colorSpace = THREE.SRGBColorSpace;
                    pixelMaterial.uniforms.uDiffuseMap.value = child.material.map;
                }

                const outlineMesh = new THREE.Mesh(child.geometry, outlineMaterial);
                outlineMesh.position.copy(child.position);
                outlineMesh.rotation.copy(child.rotation);
                outlineMesh.scale.copy(child.scale);
                child.parent.add(outlineMesh);
                outlineMeshes.push(outlineMesh);
            });
            
            model.scale.set(5, 5, 5);
            model.position.x = 0;
            model.position.y = 0;
            model.position.z = 0;
            scene.add(model);

            startIntroAnimation();
        },
        undefined,
        function (error) {
            console.error('An error happened', error);
        }
    );
}

// Initial model load
loadModel('./assets/fox_quad.glb');

// Model selector UI
document.getElementById('fox-btn').addEventListener('click', () => {
    loadModel('./assets/fox_quad.glb');
});
document.getElementById('sample-btn').addEventListener('click', () => {
    loadModel('./assets/sample.glb');
});

// --- Intro Animation State ---
const introAnimation = {
    isActive: false,
    startTime: 0,
    duration: {
        stage1_highRes: 2000,  // Added pause for clean high-res
        stage2_crtAndPixel: 3000,  // Transition duration
    },
    totalDuration: 5000,
};

function startIntroAnimation() {
    introAnimation.startTime = performance.now();
    introAnimation.isActive = true;

    // Reset to starting state
    model.traverse(child => {
        if (originalMaterials.has(child)) {
            child.material = originalMaterials.get(child);
        }
    });
    pixelationPass.material.uniforms.uCurvatureAmount.value = 0;
    pixelMaterial.uniforms.uPixelationMix.value = 0.0;
    outlineMaterial.uniforms.uOutlineOpacity.value = 0.0;
    const { width, height } = renderer.getSize(new THREE.Vector2());
    pixelationPass.material.uniforms.uEffectiveRes.value.set(width, height);
    toggleOutlineVisibility(false);
}

const introControls = { replay: startIntroAnimation };
gui.add(introControls, 'replay').name('Replay Intro');

function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function toggleOutlineVisibility(isVisible) {
    outlineMeshes.forEach(mesh => {
        mesh.visible = isVisible;
    });
}

const clock = new THREE.Clock();
const baseSpeed = 0.5;
const speedAmplitude = 12.0; 

// --- Animate Loop ---
function animate() {
    requestAnimationFrame(animate);
    const deltaTime = clock.getDelta();
    controls.update();

    if (model && params.animateModel) {
        const variableSpeed = baseSpeed + Math.sin(clock.getElapsedTime() * 0.8) * speedAmplitude;
        model.rotation.z += variableSpeed * deltaTime;
    }

    // --- INTRO ANIMATION LOGIC (integrated with main loop) ---
    if (introAnimation.isActive) {
        const introTime = performance.now() - introAnimation.startTime;
        const d = introAnimation.duration;
        let progress = 0;
        const { width, height } = renderer.getSize(new THREE.Vector2());

        if (introTime < d.stage1_highRes) {
            // Stage 1: Clean high-res
            model.traverse(child => {
                if (originalMaterials.has(child) && child.material !== originalMaterials.get(child)) {
                    child.material = originalMaterials.get(child);
                }
            });
            toggleOutlineVisibility(false);
            pixelMaterial.uniforms.uPixelationMix.value = 0.0; // Just in case
            outlineMaterial.uniforms.uOutlineOpacity.value = 0.0;
            pixelationPass.material.uniforms.uCurvatureAmount.value = 0.0;
            pixelationPass.material.uniforms.uEffectiveRes.value.set(width, height);

        } else if (introTime < introAnimation.totalDuration) {
            // Stage 2: Gradual transition
            model.traverse(child => {
                if (originalMaterials.has(child) && child.material !== pixelMaterial) {
                    child.material = pixelMaterial;
                }
            });
            toggleOutlineVisibility(true);
            const stageTime = introTime - d.stage1_highRes;
            progress = easeInOutCubic(stageTime / d.stage2_crtAndPixel);

            pixelMaterial.uniforms.uPixelationMix.value = progress;
            outlineMaterial.uniforms.uOutlineOpacity.value = progress;
            pixelationPass.material.uniforms.uCurvatureAmount.value = progress * params.targetCurvature;

            const effX = THREE.MathUtils.lerp(width, params.effectiveResolutionX, progress);
            const effY = THREE.MathUtils.lerp(height, params.effectiveResolutionY, progress);
            pixelationPass.material.uniforms.uEffectiveRes.value.set(effX, effY);

        } else {
            // Finish intro
            introAnimation.isActive = false;
            pixelMaterial.uniforms.uPixelationMix.value = 1.0;
            outlineMaterial.uniforms.uOutlineOpacity.value = 1.0;
            pixelationPass.material.uniforms.uCurvatureAmount.value = params.targetCurvature;
            pixelationPass.material.uniforms.uEffectiveRes.value.set(params.effectiveResolutionX, params.effectiveResolutionY);
            toggleOutlineVisibility(params.showOutline);
        }
    }
    
    pixelationPass.render(scene, camera);
}

window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    pixelationPass.setSize(width, height);
    if (!introAnimation.isActive) {
        updateEffectiveRes();
    }
});

animate();
