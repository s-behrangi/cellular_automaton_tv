#version 300 es

layout(location = 0) in vec4 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main() {
    vTexCoord = aPosition.xy / 2.0 + vec2(0.5, 0.5);
    gl_Position = aPosition;
}