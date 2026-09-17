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
uniform highp sampler2D uBloom;     //bloom source
uniform vec2 uScreenSize;           //dimensions of the screen
uniform vec2 uSimSize;              //dimensions of the simulation texture
uniform vec3 camera;                //camera x, y, zoom
uniform bool style;                 //aperture grille or shadow mask

layout(location = 0) out vec4 fragColour;

/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* ----- BIG WALL OF TONE-MAPPING ALGORITHMS----- */
/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/main/31.Bloom.js */
// Algorithms
float filmic_reinhard2(float x) {
    x *= 1.32;
    float k = 23.0;
    return (exp(-x*k) - 1.0)/k - 1.0/(x + 1.0) + 1.0;
}
vec3 filmic_reinhard2(vec3 x) {
    const float W = 2.0;
    float w = filmic_reinhard2(W);
    return vec3(
        filmic_reinhard2(x.r),
        filmic_reinhard2(x.g),
        filmic_reinhard2(x.b)) / w;
}

vec3 linear(vec3 value, vec3 max) {
    return value / max;
}

vec3 nativeTanh(vec3 color) {
    return tanh(color);
}

// https://varietyofsound.wordpress.com/2011/02/14/efficient-tanh-computation-using-lamberts-continued-fraction/
vec3 fastTanh(vec3 x)
{
    vec3 x2 = x * x;
    vec3 a = x * (135135.0 + x2 * (17325.0 + x2 * (378.0 + x2)));
    vec3 b = 135135.0 + x2 * (62370.0 + x2 * (3150.0 + x2 * 28.0));
    return a / b;
}

// Another curve-fitting approximation. I can't find where I got this, but I think it was on Math Exchange.
vec3 superfastTanh(vec3 x)
{
    vec3 x2 = x * x;
    return x * (27.0 + x2) / (27.0 + 9.0*x2);
}

// Original Eric Reinhard 2002
vec3 reinhard(vec3 source)
{
    return source / (source + 1.0);
}

// Reinhard's updated function, which aggressively passes through 1.0 (does not approach 1.0)
// https://bruop.github.io/tonemapping/
vec3 reinhardExtended(vec3 source, vec3 whiteRef)
{
    return source * (1.0 + (source / (whiteRef * whiteRef))) / (source + 1.0);
}

// https://knarkowicz.wordpress.com/2016/01/06/aces-filmic-tone-mapping-curve/
vec3 ACES_Narkowicz(vec3 source)
{
    const float A = 2.51;
    const float B = 0.03;
    const float C = 2.43;
    const float D = 0.59;
    const float E = 0.14;

    vec3 color = source * vec3(.6);

    return clamp((color * (A * color + B)) / (color * (C * color + D) + E), 0.0, 1.0);
}

// Polyphony's Gran Turismo tone mapper, developed by Hajime Uchimura
// https://github.com/dmnsgn/glsl-tone-map/blob/main/uchimura.glsl
vec3 uchimura(vec3 x, float P, float a, float m, float l, float c, float b) {
    float l0 = ((P - m) * l) / a;
    float L0 = m - m / a;
    float L1 = m + (1.0 - m) / a;
    float S0 = m + l0;
    float S1 = m + a * l0;
    float C2 = (a * P) / (P - S1);
    float CP = -C2 / P;

    vec3 w0 = vec3(1.0 - smoothstep(0.0, m, x));
    vec3 w2 = vec3(step(m + l0, x));
    vec3 w1 = vec3(1.0 - w0 - w2);

    vec3 T = vec3(m * pow(x / m, vec3(c)) + b);
    vec3 S = vec3(P - (P - S1) * exp(CP * (x - S0)));
    vec3 L = vec3(m + a * (x - m));

    return T * w0 + L * w1 + S * w2;
}

vec3 uchimura(vec3 x) {
    // values can be determined via https://www.desmos.com/calculator/gslcdxvipg
    const float P = 1.0;  // max display brightness
    const float a = 1.0;  // contrast
    const float m = 0.22; // linear section start
    const float l = 0.4;  // linear section length
    const float c = 1.33; // black
    const float b = 0.0;  // pedestal

    return uchimura(x, P, a, m, l, c, b);
}

vec3 exposure(vec3 source, float exposure)
{
    return vec3(1.0) - exp(-source * exposure);
}
vec3 exposure2(vec3 source, float exposure)
{
    return vec3(1.0) / (vec3(1.0) + exp(-vec3(exposure) * source + vec3(exposure * .5)));
}
vec3 fastApproxUchimura(vec3 color)
{
    return pow(superfastTanh(pow(color, vec3(1.4))), vec3(.7));
}

/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* ----- END WALL OF TONE-MAPPING ALGORITHMS----- */
/* ---------------------------------------------- */
/* ---------------------------------------------- */
/* ---------------------------------------------- */

float rgbToLuminance(vec3 colour) {
    return dot(vec3(colour), luminanceVec2);
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

vec3 apertureGrille(vec2 uv, float intensity) {
    /* splits the beam into rgb depending on horizontal position */
    /* clunky bc splitting 4 into 3 */
    float x = uv.x;
    float phase = fract(x / 2.0);
    float width = fwidth(phase);

    float rEnv = sin(2.0 * PI * x / 4.0 + PI / 6.0) - 0.5;
    float gEnv = sin(2.0 * PI * x / 4.0 - 3.0 * PI / 6.0) - 0.5;
    float bEnv = sin(2.0 * PI * x / 4.0 - 7.0 * PI / 6.0) - 0.5;

    float r = smoothstep(  1.0/3.0 + width, 1.0/3.0 - width, abs(phase - 1.0/6.0) * 2.0) * pow(max(rEnv + 0.5, 0.0), 0.2);
    float g = smoothstep( 1.0/3.0 + width, 1.0/3.0 - width, abs(phase - 3.0/6.0) * 2.0) * pow(max(gEnv + 0.5, 0.0), 0.2);
    float b = smoothstep( 1.0/3.0 + width, 1.0/3.0 - width, abs( phase - 5.0/6.0) * 2.0) * pow(max(bEnv + 0.5, 0.0), 0.2); 

    return mix(vec3(1.0), vec3(r, g, b), intensity);
}

// vec3 apertureGrille(float xPixels, float intensity) {
//     float phase = fract(xPixels / 4.0);
//     float d = fwidth(phase);

//     // Three windows centered at 1/6, 3/6, 5/6 of the period
//     vec3 mask;
//     mask.r = smoothstep(1.0/3.0 + d, 1.0/3.0 - d, abs(phase - 1.0/6.0) * 2.0);
//     mask.g = smoothstep(1.0/3.0 + d, 1.0/3.0 - d, abs(phase - 3.0/6.0) * 2.0);
//     mask.b = smoothstep(1.0/3.0 + d, 1.0/3.0 - d, abs(phase - 5.0/6.0) * 2.0);

//     return mix(vec3(1.0), mask, intensity);
// }

vec3 shadowMask(vec2 uv, float intensity) {
    float yPhase = fract(uv.y / 2.0);
    float xOffset = abs(yPhase - 1.0);
    float xPhase = fract((uv.x + xOffset) / 2.0);
    float width = fwidth(xPhase);

    vec3 mask;
    mask.r = smoothstep(1.0/3.0 + width, 1.0/3.0 - width, abs(xPhase - 1.0/6.0) * 2.0);
    mask.g = smoothstep(1.0/3.0 + width, 1.0/3.0 - width, abs(xPhase - 3.0/6.0) * 2.0);
    mask.b = smoothstep(1.0/3.0 + width, 1.0/3.0 - width, abs(xPhase - 5.0/6.0) * 2.0);

    return mix(vec3(1.0), mask, intensity);
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
    
    vec2 centerPos = centerCoord * texelSize;
    vec2 rightPos = (centerCoord + vec2(1.0, 0.0)) * texelSize;
    vec2 upPos = (centerCoord + vec2(0.0, 1.0)) * texelSize;
    vec2 upRightPos = (centerCoord + vec2(1.0, 1.0)) * texelSize;

    /* first we have to get the states */
    int s00 = int(texture(uSampler, centerPos).r);                   
    int s10 = int(texture(uSampler, rightPos).r); 
    int s01 = int(texture(uSampler, upPos).r); 
    int s11 = int(texture(uSampler, upRightPos).r);

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
    /* BARREL DISTORTION */
    vec2 barrelledCoord = barrelDistort(vTexCoord);
    vec2 barrelledPos = barrelledCoord * uScreenSize;

    vec4 colour = bilinear(barrelledCoord);
    //colour.rgb = colour.rgb * apertureGrille(pos.x, 0.5);
    colour.rgb = style ? colour.rgb * shadowMask(pos, 0.8) : colour.rgb * apertureGrille(pos, 0.8);

    /* LUMINANCE-ADJUSTED SCAN LINES */
    float baseBrightness = sin(barrelledPos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5;
    float luminosityFraction = 0.2*(1.0 - baseBrightness)*(cos(barrelledPos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5);
    
    //float baseBrightness = dft4(barrelledPos.y, scanLineBrightness);
    //float luminosityFraction = dft4(barrelledPos.y, scanLineLumVariance);
    
    float luminosityAdjustment = rgbToLuminance(vec3(colour.rgb)) * luminosityFraction;
    colour = vec4(colour.rgb * (baseBrightness + luminosityAdjustment), 1.0);

    /* INCORPORATE BLOOM AFTER SCANLINES TO SIMULATE PHOSPHOR OVERLOAD*/
    vec4 bloomColour = texture(uBloom, barrelledCoord );
    bloomColour.rgb = style ? bloomColour.rgb * shadowMask(pos, 0.6) : bloomColour.rgb * apertureGrille(pos, 0.4);
    baseBrightness = sin(barrelledPos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5;
    luminosityFraction = 0.5*(1.0 - baseBrightness)*(cos(barrelledPos.y * 2.0 * PI / scanLinePeriodicity) * 0.5 + 0.5);
    luminosityAdjustment = rgbToLuminance(vec3(bloomColour.rgb)) * luminosityFraction;
    bloomColour = vec4(bloomColour.rgb * (baseBrightness + luminosityAdjustment), 1.0);

    colour = vec4(exposure(colour.rgb + bloomColour.rgb * 0.6, 1.5), 1.0);
    

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