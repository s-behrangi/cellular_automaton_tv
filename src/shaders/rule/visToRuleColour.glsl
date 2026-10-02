#version 300 es

/* writes a rule visualization back to the original rule texture */

precision mediump float;

in vec2 vTexCoord;

uniform highp usampler2D uRuleTex;  //Copy of rule texture
uniform highp usampler2D uRuleVis;  //Rule visualization
uniform int uRuleTextureEdge;       //edge length of rule texture
uniform int uRuleVisEdge;           //edge length of rule visualization
uniform int uRuleLength;            //length of active rule

out uvec4 fragColour;

void main() {
    vec2 rulePix = vTexCoord * float(uRuleTextureEdge);
    int ruleIdx = int(rulePix.x) + int(rulePix.y) * uRuleTextureEdge;

    if (ruleIdx >= uRuleLength) {
        uint ruleState = texelFetch(uRuleTex, ivec2(rulePix), 0).r;
        fragColour = uvec4(ruleState, 0, 0, 1);
        return;
    }

    int ruleVisX = ruleIdx % uRuleVisEdge;
    int ruleVisY = ruleIdx / uRuleVisEdge;

    uint ruleState = texelFetch(uRuleVis, ivec2(ruleVisX, ruleVisY), 0).r;
    fragColour = uvec4(ruleState, 0, 0, 1); 
}