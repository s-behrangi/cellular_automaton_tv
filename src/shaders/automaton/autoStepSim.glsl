#version 300 es
#define MAX_N 21

precision mediump float;

const int K = 8;

int[MAX_N] neighbourArray = int[](
    0, 0, 0, 0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0
);

uniform highp usampler2D uSampler;  //Previous state
uniform highp usampler2D uBinomial; //Precomputed binomial texture
uniform highp usampler2D uRule;     //Rule texture
uniform vec2 uSize;                 //(width, height) in pixels [UNUSED]
uniform int n;                      //number of states
uniform int span;                   //C(n, 8)
uniform vec2 simSize;               //Size of simulation texture
uniform int ruleWidth;              //width of rule texture

in vec2 vTexCoord;

out uvec3 fragColour;

// Returns binomial coefficient (n choose k) from precompute texture
int binomial(int m, int k) {
    return int(texelFetch(uBinomial, ivec2(m, k), 0).r);
}

void main() {
    int state = int(texture(uSampler, vTexCoord).r);

    neighbourArray[state] = -1;

    for (int x = -1; x < 2; x += 1) {
        for (int y = -1; y < 2; y += 1) {
            int neighbourState = int(texture(uSampler, vTexCoord + (vec2(x, y) / simSize)).r);
            neighbourArray[neighbourState] += 1;
        }
    }
    
    int subIndex = 0;
    int y = K;
    for (int i = 0; i < MAX_N; i++) {
        if (i >= n) {
            break;
        }
        int v = neighbourArray[i];
        if (v > 0) {
            int x = n - i - 1;
            subIndex += binomial(y + x, x) - binomial(y - v + x, x);
        }
        y -= v;
    }
    //reverse into lex ordering
    int lexIndex = span - 1 - subIndex;
    int idx = state * span + lexIndex;

    uint newState = texelFetch(uRule, ivec2(idx % ruleWidth, idx / ruleWidth), 0).r;

    fragColour = uvec3(newState, 0, 0);
}