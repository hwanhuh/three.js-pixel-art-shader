uniform sampler2D uSceneTexture;
uniform sampler2D uPrevFrameTexture;
uniform float uFadeOpacity;

uniform vec2 uResolution; 
uniform vec2 uEffectiveRes;
uniform float uAberrationAmount;
uniform float uScanlineIntensity;
uniform float uCurvatureAmount;

varying vec2 vUv;

vec2 distortUV(vec2 uv) {
    vec2 centeredUv = uv - 0.5;
    float aspectRatio = uResolution.x / uResolution.y;
    centeredUv.x *= aspectRatio;
    float dist = dot(centeredUv, centeredUv);
    vec2 distortedUv = uv + centeredUv * dist * uCurvatureAmount;
    return distortedUv;
}

void main() {
    vec2 distortedUv = distortUV(vUv);

    // Simulate pixelation
    vec2 pixelSize = 1.0 / uEffectiveRes;
    distortedUv = floor(distortedUv / pixelSize) * pixelSize + pixelSize * 0.5;

    vec4 newColor;
    if (distortedUv.x < 0.0 || distortedUv.x > 1.0 || distortedUv.y < 0.0 || distortedUv.y > 1.0) {
        newColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else {
        vec2 offset = uAberrationAmount * (distortedUv - 0.5);
        float r = texture2D(uSceneTexture, distortedUv - offset).r;
        float g = texture2D(uSceneTexture, distortedUv).g;
        float b = texture2D(uSceneTexture, distortedUv + offset).b;
        newColor = vec4(r, g, b, 1.0);
    }

    float scanline = mod(gl_FragCoord.y, 2.0) * uScanlineIntensity;
    newColor.rgb -= scanline;

    vec4 oldColor = texture2D(uPrevFrameTexture, vUv);
    gl_FragColor = mix(newColor, oldColor, uFadeOpacity);
}
