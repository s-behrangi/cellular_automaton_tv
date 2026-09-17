#version 300 es

/* FRAGMENT SHADER FOR FADING SCREEN TEXTURES BACK AND FORTH */

precision mediump float;

in vec2 vTexCoord;

uniform highp sampler2D uSampler;
uniform float fade;                 //fade coefficient

out vec4 fragColour;

void main() {
    vec4 uColour = texture(uSampler, vTexCoord);

    fragColour = vec4((uColour.rgb * fade), 1.0);
}