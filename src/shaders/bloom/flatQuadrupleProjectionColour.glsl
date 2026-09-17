#version 300 es
#define COLOURTEXWIDTH 8

/* prepares a flat (undistorted) texture for a later bloom pass */

precision mediump float;

const float bilinearSharpness = 2.0; //larger is *less* sharp

in vec2 vTexCoord;

uniform highp usampler2D uSampler;
uniform highp usampler2D uColours;  //colour scheme
uniform vec2 uScreenSize;           //dimensions of the screen
uniform vec2 uSimSize;              //dimensions of the simulation texture
uniform vec3 camera;                //camera x, y, zoom

layout(location = 0) out vec4 fragColour;

vec4 bilinear(vec2 uv) {
    vec2 screenPixCoord = uv * uScreenSize;
    vec2 simPixCoord = camera.xy + screenPixCoord / camera.z;

    /* adjust blending for the fact that we're projecting a texture to a larger size */
    vec2 frac = fract(simPixCoord);
    float fracThreshold = 1.0 - 1.0 / camera.z * bilinearSharpness;
    float xFrac = step(fracThreshold, frac.x) * (frac.x - fracThreshold) / (1.0 - fracThreshold);
    float yFrac = step(fracThreshold, frac.y) * (frac.y - fracThreshold) / (1.0 - fracThreshold);

    /* really each cluster is the center, its +1 x, +1y, and +1xy*/
    vec2 centerCoord = floor(simPixCoord) + 0.5;

    vec2 texelSize = 1.0 / uSimSize;

    /* first we have to get the states */
    int s00 = int(texture(uSampler, centerCoord * texelSize).r);                   
    int s10 = int(texture(uSampler, (centerCoord + vec2(1.0, 0.0)) * texelSize).r); 
    int s01 = int(texture(uSampler, (centerCoord + vec2(0.0, 1.0)) * texelSize).r); 
    int s11 = int(texture(uSampler, (centerCoord + vec2(1.0, 1.0)) * texelSize).r);

    /* convert to colours */
    vec4 c00 = vec4(texelFetch(uColours, ivec2(s00 % COLOURTEXWIDTH, s00 / COLOURTEXWIDTH), 0)) / 255.0;                   
    vec4 c10 = vec4(texelFetch(uColours, ivec2(s10 % COLOURTEXWIDTH, s10 / COLOURTEXWIDTH), 0)) / 255.0;                   
    vec4 c01 = vec4(texelFetch(uColours, ivec2(s01 % COLOURTEXWIDTH, s01 / COLOURTEXWIDTH), 0)) / 255.0;                   
    vec4 c11 = vec4(texelFetch(uColours, ivec2(s11 % COLOURTEXWIDTH, s11 / COLOURTEXWIDTH), 0)) / 255.0;                   
    
    // use below code to produce "looking closer at screen" effect (supposing scanlines are adjusted too)
    // vec4 top = mix(c00, c10, frac.x * frac.x);
    // vec4 bot = mix(c01, c11, frac.x * frac.x);

    // return mix(top, bot, frac.y * frac.y);

    vec4 top = mix(c00, c10, xFrac );
    vec4 bot = mix(c01, c11, xFrac);

    return mix(top, bot, yFrac);
}

void main() {
    fragColour = bilinear(vTexCoord);
}