#version 300 es

/* converts a full rule texture to a square texture of just the relevant active rule */

precision mediump float;

in vec2 vTexCoord;

uniform highp usampler2D uRuleTexture;      //original rule texture (square)
uniform int uRuleTextureEdge;               //size of the rule texture edges
uniform int uRuleVisEdge;                   //size of the rule visualization (square)
uniform int uRuleLength;                    //length of the active rule
uniform vec4 uMouse;                        //(x, y, brushRadius, state)


out uvec4 fragColour;

void main() {
    vec2 visPix = vTexCoord * float(uRuleVisEdge);
    int ruleIdx = int(visPix.x) + int(visPix.y) * uRuleVisEdge;

    if (ruleIdx >= uRuleLength) {
        fragColour = uvec4(50, 0, 0, 1); //impossible state is understood to be black later on
        return;
    }

    int ruleTexX = ruleIdx % uRuleTextureEdge;
    int ruleTexY = ruleIdx / uRuleTextureEdge;

    uint ruleState = texelFetch(uRuleTexture, ivec2(ruleTexX, ruleTexY), 0).r;

    fragColour = uvec4(ruleState, 0, 0, 1);

    /* check if we're drawing */
    vec2 floorPix = floor(visPix);
    float d = distance(floorPix, uMouse.xy);
    if (d < uMouse.z) {
        fragColour = uvec4(uMouse.w, 0, 0, 1);
    }
}