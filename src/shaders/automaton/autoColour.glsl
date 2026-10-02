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
uniform bool uRuleDraw;              //true if what we're drawing is a rule;

out vec4 fragColour;

void main() {
    vec2 simCoord = (camera.xy + vTexCoord * (uScreenSize / camera.z)) / uSimSize;
    
    if (uRuleDraw && (
        simCoord.x < 0.0 ||
        simCoord.y < 0.0 ||
        simCoord.x > 1.0 ||
        simCoord.y > 1.0
    )) {
        fragColour = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    uint state = texture(uSampler, simCoord).r;
    if (uRuleDraw) {
        if (state == 50u) {
            /* special case for rule draw */
            fragColour = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
    }
    
    int s = int(state);

    vec4 uColour = vec4(texelFetch(uColours, ivec2(s % COLOURTEXWIDTH, s / COLOURTEXWIDTH), 0)) / 255.0;

    float alpha = ceil(max(uColour.r, + max(uColour.g, uColour.b)));

    if (uRuleDraw) {
        fragColour = vec4(uColour.r, uColour.g, uColour.b, 1.0);
    } else {
        fragColour = vec4(uColour.r, uColour.g, uColour.b, alpha);
    }
}