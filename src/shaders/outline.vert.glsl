uniform float uOutlineThickness;
void main() {
    vec4 displaced = vec4(position + normal * uOutlineThickness, 1.0);
    gl_Position = projectionMatrix * modelViewMatrix * displaced;
}
