#version 300 es

precision mediump float;

uniform highp usampler2D uSampler;  //Previous state
uniform vec2 uDims;                 //Simulation dimension
uniform vec4 uMouse;                //(x, y, brushRadius, state)

in vec2 vTexCoord;

out uvec3 fragColour;

void main() {
    int state = int(texture(uSampler, vTexCoord).r);

    /* calculate toroidal distance to mouse */
    /* https://github.com/benpm/cellarium/blob/master/src/shaders/drawing.glsl */
    vec2 pixPos = floor(vTexCoord * uDims);
    float pMouseDist = uMouse.z * 2.0;
    for (int x = -1; x <= 1; x += 1) {
        for (int y = -1; y <= 1; y += 1) {
            pMouseDist = min(pMouseDist, distance(pixPos, ((uMouse.xy / uDims - vec2(x, y)) * uDims) ));
        }
    }

    /* add cells accordingly */
    if (floor(pMouseDist) < uMouse.z) {
        state = int(uMouse.w);
    }

    fragColour = uvec3(state, 0, 0);
}