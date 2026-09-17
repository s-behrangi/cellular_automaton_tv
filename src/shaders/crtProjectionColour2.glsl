#version 300 es
#define COLOURTEXWIDTH 8

/* 4x projection CRT shader */
/* performs post-projection distortion effects */

precision mediump float;

/* CONSTANTS */

const float PI = 3.14159265359;

const float bilinearSharpness = 2.0; //larger is *less* sharp

const float scanLinePeriodicity = 4.0; //really this is just the projected pixelwidth

const vec4 scanLineBrightness = vec4(0.0, 0.2, 0.6, 0.2);
const vec4 scanLineLumVariance = vec4(0.1, 0.5, 0.4, 0.5);

/* https://tsev.dev/posts/2020-06-19-colour-correction-with-webgl/ */
const vec3 luminanceVec1 = vec3(0.2126, 0.7152, 0.0722);
/* https://www.w3.org/TR/AERT/#color-contrast */
const vec3 luminanceVec2 = vec3(0.299, 0.587, 0.114);

const float vignetteIntensity = 0.9;
const float cornerRadius = 50.0;
const float bgGrey = 5.0;

const float screenCurvature = 0.25;

/* END CONSTANTS */

in vec2 vTexCoord;

uniform highp sampler2D uSampler;
uniform vec2 uScreenSize;           //dimensions of the screen

out vec4 fragColour;

float rgbToLuminance(vec3 colour) {
    return dot(vec3(colour), luminanceVec1);
}

/* https://raphlinus.github.io/graphics/2020/04/21/blurred-rounded-rects.html */
float sdRoundedBox(vec2 uv) {
    vec2 b = uScreenSize * 0.98;
    vec2 p = uv * 2.0 - uScreenSize;
    vec2 q = abs(p) - b + cornerRadius;
    return min(max(q.x,q.y),0.0) + length(max(q,0.0)) - cornerRadius;
}

/* https://blog.maximeheckel.com/posts/the-art-of-dithering-and-retro-shading-web/ */
vec2 barrelDistort(vec2 uv) {
    vec2 curveUV = uv * 2.0 - 1.0;
    vec2 offset = curveUV.yx * screenCurvature;
    curveUV += curveUV * offset * offset;
    curveUV = curveUV * 0.5 + 0.5;
    return curveUV;
}

vec4 bilinear(vec2 uv) {
    vec2 screenPixCoord = uv * uScreenSize;

    /* adjust blending for the fact that we're projecting a texture to a larger size */
    vec2 frac = fract(screenPixCoord);
    /* really each cluster is the center, its +1 x, +1y, and +1xy*/
    vec2 centerCoord = floor(screenPixCoord) + 0.5;

    vec2 texelSize = 1.0 / uScreenSize;

    /* sample four adjacent */
    vec4 c00 = texture(uSampler, centerCoord * texelSize);                   
    vec4 c10 = texture(uSampler, (centerCoord + vec2(1.0, 0.0)) * texelSize); 
    vec4 c01 = texture(uSampler, (centerCoord + vec2(0.0, 1.0)) * texelSize); 
    vec4 c11 = texture(uSampler, (centerCoord + vec2(1.0, 1.0)) * texelSize);

    // use below code to produce "looking closer at screen" effect (supposing scanlines are adjusted too)
    vec4 top = mix(c00, c10, frac.x * frac.x);
    vec4 bot = mix(c01, c11, frac.x * frac.x);

    return mix(top, bot, frac.y * frac.y);

    // vec4 top = mix(c00, c10, xFrac );
    // vec4 bot = mix(c01, c11, xFrac);

    // return mix(top, bot, yFrac);
}

void main() {
    vec2 pos = vTexCoord * uScreenSize;

    vec2 barrelledCoord = barrelDistort(vTexCoord);
    vec2 barrelledPos = barrelledCoord * uScreenSize;

    vec4 colour = bilinear(barrelledCoord);
    
    /* VIGNETTING & ROUNDED CORNERS*/
    float dist = length(vTexCoord - 0.5);
    float vignetteFactor = 1.0 - dist * vignetteIntensity;
    colour = vec4(colour.rgb * vignetteFactor, colour.a);  

    colour = max(colour, vec4(bgGrey, bgGrey, bgGrey, 255.0) / 255.0);

    float cornerDist = sdRoundedBox(barrelledPos);
    float blackCornerFactor = 1.0 - smoothstep(0.0, 10.0, cornerDist);
    colour = vec4(colour.rgb * blackCornerFactor, colour.a);

    fragColour = colour;
}