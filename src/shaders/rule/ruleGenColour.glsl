#version 300 es

/* FRAGMENT SHADER THAT RANDOMLY GENERATES A RULE */

precision mediump float;

in vec2 vTexCoord;

uniform float seed; 
uniform float n;                //number of states
uniform float zeroChanceExp; 

out uvec4 fragColour;

/* https://martindevans.me/game-development/2015/02/22/Random-Gibberish/ */
uint random(vec2 uv, float seed, float n) {
    float fixedSeed = abs(seed) + 1.0;
    float x = dot(uv, vec2(12.9898,78.233) * fixedSeed);
    float rand = fract(sin(x) * 43758.5453);

    float zeroChance = max(zeroChanceExp, 1.0 - 1.0 / pow(n, zeroChanceExp));
    float notZero = step(zeroChance, rand);
    float stateIfNotZero = floor((n - 1.0) * ((rand - zeroChance) / (1.0 - zeroChance)));

    return uint(notZero * stateIfNotZero);
}

void main() {
    fragColour = uvec4(random(vTexCoord, seed, n), 0, 0, 0);
}