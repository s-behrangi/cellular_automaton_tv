#version 300 es

/* mutates the given pixel in a random direction    */
/* unless it can only mutate in one direction, in   */
/* which case that is the direction chosen          */

precision mediump float;

flat in ivec2 vTexCoord;
flat in uint ruleIdx;

uniform highp usampler2D uRule; 
uniform uint n;             //number of states
uniform uint colourSeed;

out uvec4 fragColour;

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
    uint curState = texelFetch(uRule, vTexCoord, 0).r;
    
    uint x = rand(ruleIdx ^ colourSeed);
    float normalized = float(x) / 4294967295.0;

    float rolledDecrease = step(normalized, 0.5);
    float rolledIncrease = 1.0 - rolledDecrease;
    
    float canDecrease = 1.0 - step(float(curState), 0.0);
    float canIncrease = 1.0 - step(float(n) - 1.0, float(curState));

    float mustDecrease = 1.0 - canIncrease;
    float mustIncrease = 1.0 - canDecrease;

    uint decrease = uint(rolledDecrease * canDecrease + mustDecrease * (1.0 - rolledDecrease));
    uint increase = uint(rolledIncrease * canIncrease + mustIncrease * (1.0 - rolledIncrease));

    uint newState = curState + increase - decrease;

    fragColour = uvec4(newState, 0, 0, 0);
}