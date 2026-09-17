#version 300 es
#define COLOURTEXWIDTH 8

/* FRAGMENT SHADER FOR RENDERING THE SIMULATION TO THE SCREEN FRAME */

precision mediump float;

in vec2 vTexCoord;

uniform highp usampler2D uSampler;
uniform highp usampler2D uColours;  //colour scheme
uniform vec2 uScreenSize;           //dimensions of the screen
uniform vec2 uSimSize;              //dimensions of the simulation texture
uniform vec3 camera;                //camera x, y, zoom

out vec4 fragColour;

void main() {
    vec2 simCoord = (camera.xy + vTexCoord * (uScreenSize / camera.z)) / uSimSize;

    uint state = texture(uSampler, simCoord).r;
    int s = int(state);

    vec4 uColour = vec4(texelFetch(uColours, ivec2(s % COLOURTEXWIDTH, s / COLOURTEXWIDTH), 0)) / 255.0;

    float alpha = ceil(max(uColour.r, + max(uColour.g, uColour.b)));

    fragColour = vec4(uColour.r, uColour.g, uColour.b, alpha);

}