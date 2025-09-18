import * as THREE from 'three';
import vertexShader from './shaders/postFX.vert.glsl';
import fragmentShader from './shaders/postFX.frag.glsl';

export class PixelationPass {
    constructor(renderer, options = {}) {
        this.renderer = renderer;
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        const renderTargetOptions = {
            magFilter: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            type: THREE.HalfFloatType
        };

        const { width, height } = renderer.getSize(new THREE.Vector2());

        this.renderTarget = new THREE.WebGLRenderTarget(width, height, renderTargetOptions);
        this.readTarget = new THREE.WebGLRenderTarget(width, height, renderTargetOptions);
        this.writeTarget = new THREE.WebGLRenderTarget(width, height, renderTargetOptions);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uSceneTexture: { value: this.renderTarget.texture },
                uPrevFrameTexture: { value: this.readTarget.texture },
                uFadeOpacity: { value: options.fadeOpacity || 0.6 },
                uResolution: { value: new THREE.Vector2(width, height) },
                uEffectiveRes: { value: new THREE.Vector2(options.effectiveResolutionX || 480, options.effectiveResolutionY || 320) },
                uAberrationAmount: { value: options.aberrationAmount || 0.002 },
                uScanlineIntensity: { value: options.scanlineIntensity || 0.05 },
                uCurvatureAmount: { value: options.curvatureAmount || 0.25 },
            },
            vertexShader,
            fragmentShader,
        });

        this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material);
        this.scene.add(this.quad);
    }

    setSize(width, height) {
        this.renderTarget.setSize(width, height);
        this.readTarget.setSize(width, height);
        this.writeTarget.setSize(width, height);
        this.material.uniforms.uResolution.value.set(width, height);
    }

    render(scene, camera) {
        this.renderer.setRenderTarget(this.renderTarget);
        this.renderer.render(scene, camera);

        this.material.uniforms.uSceneTexture.value = this.renderTarget.texture;
        this.material.uniforms.uPrevFrameTexture.value = this.readTarget.texture;
        
        this.renderer.setRenderTarget(this.writeTarget);
        this.renderer.render(this.scene, this.camera);

        this.material.uniforms.uSceneTexture.value = this.writeTarget.texture;
        this.material.uniforms.uFadeOpacity.value = 0.0;
        
        this.renderer.setRenderTarget(null);
        this.renderer.render(this.scene, this.camera);

        this.material.uniforms.uFadeOpacity.value = this.quad.material.uniforms.uFadeOpacity.value;

        const temp = this.readTarget;
        this.readTarget = this.writeTarget;
        this.writeTarget = temp;
    }
}
