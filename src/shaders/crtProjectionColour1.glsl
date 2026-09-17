#version 300 es
#define COLOURTEXWIDTH 8

/* 4x projection CRT shader */
/* performs the projection with bilinearfiltering*/

precision mediump float;

const float PI = 3.14159265359;

/* https://tsev.dev/posts/2020-06-19-colour-correction-with-webgl/ */
const vec3 luminanceVec1 = vec3(0.2126, 0.7152, 0.0722);
/* https://www.w3.org/TR/AERT/#color-contrast */
const vec3 luminanceVec2 = vec3(0.299, 0.587, 0.114);

const float bilinearSharpness = 2.0; //larger is *less* sharp

const float scanLinePeriodicity = 4.0; //really this is just the projected pixelwidth

/* END CONSTANTS */

in vec2 vTexCoord;

uniform highp usampler2D uSampler;
uniform highp usampler2D uColours;  //colour scheme
uniform vec2 uScreenSize;           //dimensions of the screen
uniform vec2 uSimSize;              //dimensions of the simulation texture
uniform vec3 camera;                //camera x, y, zoom

out vec4 fragColour;

float rgbToLuminance(vec3 colour) {
    return dot(vec3(colour), luminanceVec1);
}

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
    vec4 colour = bilinear(vTexCoord);
    vec2 pos = vTexCoord * uScreenSize;

    /* LUMINANCE-ADJUSTED SCAN LINES */
    float baseBrightness = sin(pos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5;
    float luminosityFraction = 0.2*(1.0 - baseBrightness)*(cos(pos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5);
    
    float luminosityAdjustment = rgbToLuminance(vec3(colour.rgb)) * luminosityFraction;
    colour = vec4(colour.rgb * (baseBrightness + luminosityAdjustment), 1.0);

    fragColour = colour;
}