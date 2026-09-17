#version 300 es
#define COLOURTEXWIDTH 8

/* 4x projection CRT shader */

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

uniform highp usampler2D uSampler;
uniform highp usampler2D uColours;  //colour scheme
uniform vec2 uScreenSize;           //dimensions of the screen
uniform vec2 uSimSize;              //dimensions of the simulation texture
uniform vec3 camera;                //camera x, y, zoom

layout(location = 0) out vec4 fragColour;

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

float dft4(float x, vec4 coeffs) {
    float A0 = 0.25 * (coeffs.x + coeffs.y + coeffs.z + coeffs.w);
    float A1 = 0.5 * (coeffs.x - coeffs.z);
    float B1 = 0.5 * (coeffs.y - coeffs.w);
    float A2 = 0.25 * (coeffs.x - coeffs.y + coeffs.z - coeffs.w);

    float w = 0.5 * PI;

    return A0 + A1 * cos(w * x) + B1 * sin(w * x) + A2 * cos(2.0 * w * x);
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
    vec2 pos = vTexCoord * uScreenSize;

    vec2 barrelledCoord = barrelDistort(vTexCoord);
    vec2 barrelledPos = barrelledCoord * uScreenSize;

    vec4 colour = bilinear(barrelledCoord);

    /* LUMINANCE-ADJUSTED SCAN LINES */
    float baseBrightness = sin(barrelledPos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5;
    float luminosityFraction = 0.2*(1.0 - baseBrightness)*(cos(barrelledPos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5);
    
    //float baseBrightness = dft4(barrelledPos.y, scanLineBrightness);
    //float luminosityFraction = dft4(barrelledPos.y, scanLineLumVariance);
    
    float luminosityAdjustment = rgbToLuminance(vec3(colour.rgb)) * luminosityFraction;
    colour = vec4(colour.rgb * (baseBrightness + luminosityAdjustment), 1.0);

    
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