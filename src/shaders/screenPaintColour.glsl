#version 300 es

/* FRAGMENT SHADER FOR WRITING FROM SIMULATION TEXTURE TO SCREEN TEXTURE */

precision mediump float;

in vec2 vTexCoord;

uniform highp sampler2D uSampler;

out vec4 fragColour;

void main() {
    vec4 uColour = texture(uSampler, vTexCoord);

    fragColour = uColour;
}