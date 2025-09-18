uniform vec3 uOutlineColor;
uniform float uOutlineOpacity;
void main() {
    gl_FragColor = vec4(uOutlineColor, uOutlineOpacity);
}
