#version 300 es

/* downsamples to a 1/2 x 1/2 size texture while blurring */

precision mediump float;

in vec2 vTexCoord;

uniform highp sampler2D uSampler; //what we're downsampling
uniform vec2 uTexelSize;

out vec4 fragColour;

/* https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/main/31.Bloom.js */
void main() {
    vec3 A = texture(uSampler, vTexCoord + uTexelSize * vec2(-1.0,  1.0)).rgb;
    vec3 B = texture(uSampler, vTexCoord + uTexelSize * vec2( 0.0,  1.0)).rgb;
    vec3 C = texture(uSampler, vTexCoord + uTexelSize * vec2( 1.0,  1.0)).rgb;
    vec3 D = texture(uSampler, vTexCoord + uTexelSize * vec2(-0.5,  0.5)).rgb;
    vec3 E = texture(uSampler, vTexCoord + uTexelSize * vec2( 0.5,  0.5)).rgb;
    vec3 F = texture(uSampler, vTexCoord + uTexelSize * vec2(-1.0,  0.0)).rgb;
    vec3 G = texture(uSampler, vTexCoord                                       ).rgb;
    vec3 H = texture(uSampler, vTexCoord + uTexelSize * vec2( 1.0,  0.0)).rgb;
    vec3 I = texture(uSampler, vTexCoord + uTexelSize * vec2(-0.5, -0.5)).rgb;
    vec3 J = texture(uSampler, vTexCoord + uTexelSize * vec2( 0.5, -0.5)).rgb;
    vec3 K = texture(uSampler, vTexCoord + uTexelSize * vec2(-1.0, -1.0)).rgb;
    vec3 L = texture(uSampler, vTexCoord + uTexelSize * vec2( 0.0, -1.0)).rgb;
    vec3 M = texture(uSampler, vTexCoord + uTexelSize * vec2( 1.0, -1.0)).rgb;

    /*  SAMPLES PATTERN
            -1   0   1
            + ----------
        1 |  A   B   C
            |    D   E
        0 |  F   G   H   ←  [0,0] = G
            |    I   J
        -1 |  K   L   M
    */

    // Corner samples
    vec3 quad_NW  = (A + B + F + G) * 0.25;  // average of ABGF
    vec3 quad_NE  = (B + C + G + H) * 0.25;  // average of BCGH
    vec3 quad_SW  = (F + G + K + L) * 0.25;  // average of FGLK
    vec3 quad_SE  = (G + H + L + M) * 0.25;  // average of GHML

    // Central sample
    vec3 quad_C  = (D + E + I + J) * .25;   // average of DEIJ


    vec3 sum = 0.125 * (quad_NW + quad_NE + quad_SW + quad_SE)
                + 0.5   * quad_C;
                // .125 + .125 + .125 + .125 + .5 = 1.0
                // The combined sample weights sum to exactly 1.0, so no change in brightness

    fragColour = vec4(sum, 1.0);
}