#version 300 es

/* upsamples additively for bloom effect */
/* https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/main/31.Bloom.js */

precision mediump float;

uniform sampler2D smallerSampler;
uniform sampler2D largerSampler;
uniform vec2 uTexelSize;

in vec2 vTexCoord;

out vec4 fragColour;

void main() {
    /*  SAMPLES PATTERN
            -1   1
            + ------
        1 |  A   B
            |    +      ←  + = [0,0]
        -1 |  C   D
    */

    // This is the single sample for the unblurred, larger texture
    vec3 largeSample = texture(largerSampler, vTexCoord).rgb;

    // These are the four samples for blurring the smaller texture
    vec3 A = texture(smallerSampler, vTexCoord + uTexelSize * vec2(-1, 1)).rgb;
    vec3 B = texture(smallerSampler, vTexCoord + uTexelSize * vec2( 1, 1)).rgb;
    vec3 C = texture(smallerSampler, vTexCoord + uTexelSize * vec2(-1,-1)).rgb;
    vec3 D = texture(smallerSampler, vTexCoord + uTexelSize * vec2( 1,-1)).rgb;

    vec3 blurSample = (A + B + C + D) * .25;

    // Add 100% of the blur sample with 100% of the larger, unblurred sample
    //                ↓blur samples↓      ↓unblurred↓
    fragColour.rgb =  blurSample      +    largeSample;

    fragColour.a = 1.0;
}