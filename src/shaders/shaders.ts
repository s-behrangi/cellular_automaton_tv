import quadVertexSource from './quadVertex.glsl?raw';

import autoColourShaderSource from './automaton/autoColour.glsl?raw';
import autoStepSimSource from './automaton/autoStepSim.glsl?raw';

import screenPaintColourSource from './screenPaintColour.glsl?raw';

import screenFadeColourSource from './screenFadeColour.glsl?raw';

import autoDrawColourSource from './automaton/autoDrawColour.glsl?raw';

import ruleGenColourSource from './rule/ruleGenColour.glsl?raw';
import ruleMutVertexSource from './rule/ruleMutVertex.glsl?raw';
import ruleMutColourSource from './rule/ruleMutColour.glsl?raw';

import crtProjectionColourSource from './crtProjectionColour.glsl?raw';
import crtProjection1ColourSource from './crtProjectionColour1.glsl?raw';
import crtProjection2ColourSource from './crtProjectionColour2.glsl?raw';
import crtWithBloomColourSource from './crtWithBloomColour.glsl?raw';

import bloomThresholdColourSource from './bloom/bloomThresholdColour.glsl?raw';
import bloomDownsampleColourSource from './bloom/bloomDownsampleColour.glsl?raw';
import bloomUpsampleColourSource from './bloom/bloomUpsampleColour.glsl?raw';
import bloomToneMapColourSource from './bloom/bloomToneMapColour.glsl?raw';
import flatQuadrupleProjectionColourSource from './bloom/flatQuadrupleProjectionColour.glsl?raw';

export const shaders = {
    quadVertex: {shad: quadVertexSource},
    autoColour: {shad: autoColourShaderSource},
    autoStepSim: {shad: autoStepSimSource},
    autoDrawColour: {shad: autoDrawColourSource},
    screenPaintColour: {shad: screenPaintColourSource},
    screenFadeColour: {shad: screenFadeColourSource},
    ruleGenColour: {shad: ruleGenColourSource},
    ruleMutVertex: {shad: ruleMutVertexSource},
    ruleMutColour: {shad: ruleMutColourSource},

    crtProjectionColour: {shad: crtProjectionColourSource},
    crtWithBloomColour: {shad: crtWithBloomColourSource},
    crtProjectionColour1: {shad: crtProjection1ColourSource},
    crtProjectionColour2: {shad: crtProjection2ColourSource},


    bloomThresholdColour: {shad: bloomThresholdColourSource},
    bloomDownsampleColour: {shad: bloomDownsampleColourSource},
    bloomUpsampleColour: {shad: bloomUpsampleColourSource},
    bloomToneMapColour: {shad: bloomToneMapColourSource},
    flatQuadrupleProjectionColour: {shad: flatQuadrupleProjectionColourSource},
}