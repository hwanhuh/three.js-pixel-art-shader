uniform sampler2D uDiffuseMap;
uniform float uDitherStrength;
uniform float uBrightness;

uniform int uDitherMode;
uniform sampler2D uDitherTexture;
uniform vec2 uDitherTextureResolution;
uniform float uHalftoneSpacing;

uniform vec3 uLight1Direction; uniform vec3 uLight1Color;
uniform vec3 uLight2Direction; uniform vec3 uLight2Color;
uniform vec3 uLight3Direction; uniform vec3 uLight3Color;
uniform float uThresholds[5];

uniform vec3 uColorPaletteR[6];
uniform vec3 uColorPaletteG[6];
uniform vec3 uColorPaletteB[6];

varying vec3 vNormal;
varying vec2 vUv;
uniform float uPixelationMix;

vec3 quantizeChannel(float channelValue, vec3 palette[6]) {
    vec3 quantizedColor = palette[0];
    if (channelValue > uThresholds[0]) quantizedColor = palette[1];
    if (channelValue > uThresholds[1]) quantizedColor = palette[2];
    if (channelValue > uThresholds[2]) quantizedColor = palette[3];
    if (channelValue > uThresholds[3]) quantizedColor = palette[4];
    if (channelValue > uThresholds[4]) quantizedColor = palette[5];
    return quantizedColor;
}
void main() {
    vec4 texColor = texture2D(uDiffuseMap, vUv);
    float intensity1 = max(0.0, dot(vNormal, uLight1Direction));

    if (intensity1 > 0.8) { intensity1 = 1.0; } else if (intensity1 > 0.4) { intensity1 = 0.6; } else { intensity1 = 0.2; }
    float diffuse1 = intensity1;
    float intensity2 = max(0.0, dot(vNormal, uLight2Direction));
    if (intensity2 > 0.8) { intensity2 = 1.0; } else if (intensity2 > 0.4) { intensity2 = 0.6; } else { intensity2 = 0.2; }
    float diffuse2 = intensity2;
    float intensity3 = max(0.0, dot(vNormal, uLight3Direction));
    if (intensity3 > 0.8) { intensity3 = 1.0; } else if (intensity3 > 0.4) { intensity3 = 0.6; } else { intensity3 = 0.2; }
    float diffuse3 = intensity3;

    vec3 light1Contribution = uLight1Color * diffuse1;
    vec3 light2Contribution = uLight2Color * diffuse2;
    vec3 light3Contribution = uLight3Color * diffuse3;
    vec3 totalIllumination = light1Contribution + light2Contribution + light3Contribution;
    vec3 litColor = texColor.rgb * totalIllumination * uBrightness;

    float ditherValue = 0.5;
    if (uDitherMode == 0) {
        vec2 ditherUV = gl_FragCoord.xy / uDitherTextureResolution;
        ditherValue = texture2D(uDitherTexture, ditherUV).r;
    } else if (uDitherMode == 1) {
        vec2 gridUV = gl_FragCoord.xy / uHalftoneSpacing;
        vec2 gridPos = fract(gridUV) - 0.5;
        float gridDist = length(gridPos) * 1.5;
        float brightness = (litColor.r + litColor.g + litColor.b) / 3.0;
        ditherValue = step(gridDist, brightness);
    }
    float ditherOffset = (ditherValue - 0.5) * uDitherStrength;

    float r_channel = litColor.r + ditherOffset;
    vec3 finalColorR = quantizeChannel(r_channel, uColorPaletteR);
    float g_channel = litColor.g + ditherOffset;
    vec3 finalColorG = quantizeChannel(g_channel, uColorPaletteG);
    float b_channel = litColor.b + ditherOffset;
    vec3 finalColorB = quantizeChannel(b_channel, uColorPaletteB);

    vec3 finalPixelColor = finalColorR + finalColorG + finalColorB;
    vec3 finalColor = mix(litColor, finalPixelColor, uPixelationMix);
    gl_FragColor = vec4(finalColor, 1.0);
}
