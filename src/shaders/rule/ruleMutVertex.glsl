#version 300 es

/* uses hash to select pseudo-random coordinate of rule texture */
/* surjective but not necessarily injective, collisions OK      */

precision mediump float;

const uint MASK = 0x3FFFFFFu;

uniform uint seed;
uniform uint ruleTexWidth;
uniform float ruleLength;

flat out ivec2 vTexCoord;
flat out uint ruleIdx;

/* https://nullprogram.com/blog/2018/07/31/ */
uint rand(uint x) {
    x ^= x >> 17;
    x *= 0xed5ad4bbU;
    x ^= x >> 11;
    x *= 0xac4c1b51U;
    x ^= x >> 15;
    x *= 0x31848babU;
    x ^= x >> 14;
    return x;
}

void main() {
    uint x = rand(uint(gl_VertexID) ^ seed);
    float normalized = float(x) / 4294967296.0;
    ruleIdx = uint(floor(normalized * ruleLength));

    vTexCoord = ivec2(ruleIdx % ruleTexWidth, ruleIdx / ruleTexWidth);
    gl_Position = vec4((((vec2(vTexCoord) + 0.5)  / vec2(ruleTexWidth, ruleTexWidth)) * 2.0 - 1.0).xy, 0.0, 1.0) ;
    gl_PointSize = 1.0;
}