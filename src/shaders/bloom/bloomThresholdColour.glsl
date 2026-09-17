#version 300 es

/* start of bloom pipeline: extract pixels that meet luminance threshold */

precision mediump float;

/* https://tsev.dev/posts/2020-06-19-colour-correction-with-webgl/ */
const vec3 luminanceVec1 = vec3(0.2126, 0.7152, 0.0722);
/* https://www.w3.org/TR/AERT/#color-contrast */
const vec3 luminanceVec2 = vec3(0.299, 0.587, 0.114);
const float lumThresh = 0.5;
const float bloomStarts = 0.0;
const float bloomCaps = 0.4;

in vec2 vTexCoord;

uniform highp sampler2D uSampler; //source texture

out vec4 fragColour;

float rgbToLuminance(vec3 colour) {
    return dot(vec3(colour), luminanceVec1);
}

void main() {
    vec4 inColour = texture(uSampler, vTexCoord);

    //fragColour = vec4(1.0f, 0.0f, 0.0f, 1.0f);
    //fragColour = step(lumThresh, rgbToLuminance(vec3(inColour.rgb))) * inColour;
    fragColour = smoothstep(bloomStarts, bloomCaps, rgbToLuminance(vec3(inColour.rgb))) * inColour;
}