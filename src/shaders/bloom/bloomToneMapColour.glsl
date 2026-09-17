#version 300 es

/* https://github.com/scriptfoundry/WebGL2-Videos-Materials/blob/main/31.Bloom.js */

precision mediump float;

/* https://tsev.dev/posts/2020-06-19-colour-correction-with-webgl/ */
const vec3 luminanceVec1 = vec3(0.2126, 0.7152, 0.0722);
/* https://www.w3.org/TR/AERT/#color-contrast */
const vec3 luminanceVec2 = vec3(0.299, 0.587, 0.114);

in vec2 vTexCoord;

uniform sampler2D sampler;

out vec4 fragColour;


float rgbToLuminance(vec3 colour) {
    return dot(vec3(colour), luminanceVec1);
}

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

void main()
{
    vec3 hdrColour = texture(sampler, vTexCoord).rgb;

    // Choose which algorithm you want to try:
    // fragColour.rgb = hdrColour; // no tone mapping
    // fragColour.rgb = linear(hdrColour, vec3(2.0));
    // fragColour.rgb = reinhard(hdrColour);
    // fragColour.rgb = reinhardExtended(hdrColour, vec3(4.0, 4.0, 4.0));
    // fragColour.rgb = ACES_Narkowicz(hdrColour);
    // fragColour.rgb = filmic_reinhard2(hdrColour) * 1.0;
     fragColour.rgb = exposure(hdrColour, 1.5);
    // fragColour.rgb = exposure2(hdrColour, 3.4);
    // fragColour.rgb = nativeTanh(hdrColour);
    // fragColour.rgb = fastTanh(hdrColour);
    // fragColour.rgb = superfastTanh(hdrColour);
    // fragColour.rgb = uchimura(hdrColour);
    // fragColour.rgb = fastApproxUchimura(hdrColour);

    // Correct gamma (if needed)
    // fragColour.rgb = pow(fragColour.rgb, vec3(1.0 / 2.2	));

    fragColour.a = 1.0;
}