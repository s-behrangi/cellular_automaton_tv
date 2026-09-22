import { createProgramFromSource } from './utils/webglUtils';
import { binomialArray, chooseWithRep, hslToRGB, stringifyRule, packRule, unpackRule, rulifyString, fmod, importRuleDirect, exportRuleDirect } from './utils/mathUtils';
import { DEFAULT_CPU_RULE_CONTROL, DEFAULT_COLOUR, DEFAULT_COLOURING_STYLE, DEFAULT_DISTINGUISH_MAX, DEFAULT_DISTINGUISH_ZERO, MAX_N, MIN_N, DEFAULT_CRT, DEFAULT_BRUSH_SIZE, DEFAULT_SIM_FRAMERATE_IDX, FRAMERATES, COLOURING_STYLES, DEFAULT_COLOURING_STYLE_VARIABLE } from './constants';

const SIMWIDTH = 1024;
const SIMHEIGHT = 1024;
const RULEWIDTH = 8192; //for square texture
const BLACK_FLOAT = Float32Array.from([0, 0, 0, 1]);
const texDataBuffer = new Uint8Array(SIMWIDTH * SIMHEIGHT);

const NUMCOLOURS = 64;      //number of colours in colour map array
const COLOURWIDTH = 4;      //byte-width of colours (4 bc RGBA)
const COLOURTEXWIDTH = 8;   //sqrt(NUMCOLOURS)

/* CRT constants */
const CRTPIXELSTRUCTURE = Float32Array.from([
    0.25, 0.25, 0.25, 0.25,     0.5, 0.0, 0.5, 0.0,     0.5, 0.0, 0.5, 0.0,     0.5, 0.0, 0.5, 0.0,
    0.5, 0.5, 0.0, 0.0,         1.0, 0.0, 0.0, 0.0,     1.0, 0.0, 0.0, 0.0,     1.0, 0.0, 0.0, 0.0, 
    0.5, 0.5, 0.0, 0.0,         1.0, 0.0, 0.0, 0.0,     1.0, 0.0, 0.0, 0.0,     1.0, 0.0, 0.0, 0.0, 
    0.5, 0.5, 0.0, 0.0,         1.0, 0.0, 0.0, 0.0,     1.0, 0.0, 0.0, 0.0,     1.0, 0.0, 0.0, 0.0
]);

type FrameBufferBundle = {
    fb: WebGLFramebuffer,
    tex: WebGLTexture,
    outputSize: [number, number],
    texelSize: [number, number],
};

export class Automaton {
    /* WEBGL BASICS */
    gl: WebGL2RenderingContext;
    canvas: HTMLCanvasElement;
    private programs: Record<string, {prog: WebGLProgram}> = {};
    private uniforms: Record<string, {loc: WebGLUniformLocation}> = {};
    private fbBundles: Record<string, FrameBufferBundle> = {};
    
    /* TEXTURES & FRAMEBUFFERS &c */
    private texVAO?: WebGLVertexArrayObject;
    /* [simulation rendering] */
    private fbFrameA?: WebGLFramebuffer;
    private fbFrameB?: WebGLFramebuffer;
    private activeFrame: boolean = true; //true = A active
    private texA?: WebGLTexture;
    private texB?: WebGLTexture;
    /* ["rendering to screen"] */
    private fbScreenA?: WebGLFramebuffer;
    private fbScreenB?: WebGLFramebuffer;
    private activeScreen = true; //true = A active
    private texScreenA?: WebGLTexture;
    private texScreenB?: WebGLTexture;
    /* [precompute textures & fbs] */
    private binomialTex?: WebGLTexture;
    private ruleTex?: WebGLTexture;
    private fbRule? : WebGLFramebuffer;
    private colourTex?: WebGLTexture;
    private crtPixelTex?: WebGLTexture;
    /* [bloom] */
    private bloomDepth = 1; //how many times to downsample [both dimension of screensize should be divisible by 2^bloomDepth]

    /* RULE */
    private rule: Uint8Array = new Uint8Array(RULEWIDTH * RULEWIDTH).fill(0);
    ruleNumber: number = 0;
    private ruleZeroChanceExp = 0.5;
    states: number = 2;
    cpuRuleControl = true;
    ruleArrayIsCurrent = true;

    /* CANVAS & ANIMATION */
    private autoWidth: number = SIMWIDTH;
    private autoHeight: number = SIMHEIGHT;
    private screenWidth: number;
    private screenHeight: number;
    private playing: boolean = false;
    private lastSimFrame = performance.now();
    useCRT = true;
    private CRTstyle = true;
    private framerates = [1, 6, 12, 24, 60, 120];
    private frameRateIdx = 3;
    private panDir = "";
    fade = 0;   //fade ratio
    private flashing = false;
    private dotting = false;
    private clearing = false;
    
    /* CAMERA & DRAWING */
    camera = {x: 0, y: 0, rot: 0, zoom: 1}; //rot doesn't do anything atm
    private zoomLevels = [1, 2, 4, 8, 16, 32];
    private zoomIdx = 0;
    private pan = false;
    private panStartPos = [0, 0];
    private panStartCam = [0, 0];
    private draw = false;
    private brushState = 1;
    brushSize = 1;
    mouse = [0, 0];

    /* COLOUR PARAMETERS */
    private colourScheme: Uint8Array = new Uint8Array(NUMCOLOURS * COLOURWIDTH).fill(255);
    colouringStyle = "radialSpread";    // radialSpread, sameHue, threshold
    minColourLuminance = 100;            //clamps sameHue and sets threshold
    private radialSpreadDegrees = 360;          //Up to 360 (degrees)
    distinguishZeroColour = true;
    distinguishMaxColour = false;
    primaryColour = [70, 80, 60];
    
    constructor(
        canvas: HTMLCanvasElement,
        shaders: Record<string, {shad: string}>,
    ) {
        this.canvas = canvas!;
        [this.canvas.width, this.canvas.height] = [this.canvas.clientWidth, this.canvas.clientHeight];
        [this.screenWidth, this.screenHeight] = [this.canvas.width, this.canvas.height];

        this.gl = this.canvas.getContext("webgl2", { preserveDrawingBuffer: true })!;
        this.programs = {
            autoStep: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.autoStepSim.shad)!},
            autoDraw: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.autoDrawColour.shad)!},
            autoColour: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.autoColour.shad)!},
            screenPaint: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.screenPaintColour.shad)!},
            screenFade: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.screenFadeColour.shad)!},
            ruleGen: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.ruleGenColour.shad)!},
            ruleMut: {prog: createProgramFromSource(this.gl, shaders.ruleMutVertex.shad, shaders.ruleMutColour.shad)!},
            
            crtWithBloom: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.crtWithBloomColour.shad)!},
    
            bloomThreshold: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.bloomThresholdColour.shad)!},
            bloomDownsample: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.bloomDownsampleColour.shad)!},
            bloomUpsample: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.bloomUpsampleColour.shad)!},
            bloomToneMap: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.bloomToneMapColour.shad)!},
            flatQuadrupleProjection: {prog: createProgramFromSource(this.gl, shaders.quadVertex.shad, shaders.flatQuadrupleProjectionColour.shad)!},
        }

        /* override with app constants as necessary */
        this.distinguishZeroColour = DEFAULT_DISTINGUISH_ZERO;
        this.distinguishMaxColour = DEFAULT_DISTINGUISH_MAX;
        this.colouringStyle = COLOURING_STYLES[DEFAULT_COLOURING_STYLE];
        this.primaryColour = [DEFAULT_COLOUR.h, DEFAULT_COLOUR.s, DEFAULT_COLOUR.l];
        this.radialSpreadDegrees = 360 * DEFAULT_COLOURING_STYLE_VARIABLE / 100;
        this.minColourLuminance = DEFAULT_COLOURING_STYLE_VARIABLE;
        
        this.brushSize = DEFAULT_BRUSH_SIZE;

        this.cpuRuleControl = DEFAULT_CPU_RULE_CONTROL;
        
        this.framerates = FRAMERATES;
        this.frameRateIdx = DEFAULT_SIM_FRAMERATE_IDX;

        this.useCRT = DEFAULT_CRT;
        
        this.zoomIdx = this.useCRT ? this.zoomLevels.findIndex(level => level == 4.0) : 0;

        this.init();
    }

    /* ---------------- INITIALIZATION ------------------ */
    /* ----- NOTHING HERE SHOULD RUN MORE THAN ONCE ----- */
    /* -------------------------------------------------- */

    private init(): void {
        this.setConway();

        this.initListeners();
        this.initTex();
        this.initLocs();
        this.initUnifsAndAttribs();

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        
        //this.drawToCanvas();
        this.handleZoomChange();
        this.animSim(performance.now());
    }

    private initListeners(): void {
        const handleMouseUp = (_: MouseEvent) => {
            this.pan = false;
            this.draw = false;
            this.canvas.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            this.gl.useProgram(this.programs.autoDraw.prog);
            this.gl.uniform4f(this.uniforms.drawMouse.loc, 0, 0, this.brushSize, 0);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const [simX, simY] = this.getSimSpaceMousePosition(e);
            if (this.pan) {
                this.camera.x = Math.floor(fmod(this.panStartCam[0] + (this.panStartPos[0] - simX), this.autoWidth));
                this.camera.y = Math.floor(fmod(this.panStartCam[1] + (this.panStartPos[1] - simY), this.autoHeight));

                this.updateCamera();
                this.drawToCanvas();
            } else if (this.draw) { //supposing proper functionality this is equivalent to an else
                this.gl.useProgram(this.programs.autoDraw.prog);
                this.gl.uniform4f(this.uniforms.drawMouse.loc, Math.floor(fmod(simX, this.autoWidth)), Math.floor(fmod(simY, this.autoHeight)), this.brushSize, this.brushState);
            }
        };

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const [simX, simY] = this.getSimSpaceMousePosition(e);
            const deltaY = e.deltaMode === 1 ? e.deltaY * 16.8 : (e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY);
            const dir = Math.round(deltaY * -0.01);

            /* clamp function */
            const minZoom = this.useCRT ? this.zoomLevels.findIndex(level => level == 4.0) : 0.0;
            this.zoomIdx = Math.min(Math.max(minZoom, this.zoomIdx + dir), this.zoomLevels.length - 1);
            const newZoom = this.zoomLevels[this.zoomIdx];
            const dZoom = newZoom / this.camera.zoom;

            const newX = Math.floor(simX + (this.camera.x - simX) / dZoom);
            const newY = Math.floor(simY + (this.camera.y - simY) / dZoom);

            this.camera.x = newX;
            this.camera.y = newY;
            this.camera.zoom = newZoom;
            
            this.updateCamera();

            this.drawToCanvas();
        }, { passive: false });

        this.canvas.addEventListener('mousedown', (e) => {
            e.preventDefault()
            const [simX, simY] = this.getSimSpaceMousePosition(e);
            this.canvas.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);

            this.pan = e.shiftKey;
            this.panStartPos = [simX, simY];
            this.panStartCam = [this.camera.x, this.camera.y];
            this.draw = ! this.pan;
            if (this.draw) {
                this.gl.useProgram(this.programs.autoDraw.prog);
                this.gl.uniform4f(this.uniforms.drawMouse.loc, Math.floor(fmod(simX, this.autoWidth)), Math.floor(fmod(simY, this.autoHeight)), this.brushSize, this.brushState);
            }
        });
    }

    private initTex(): void {
        this.gl.getExtension("OES_texture_float");
        this.gl.getExtension("EXT_color_buffer_float");
        this.gl.getExtension("EXT_float_blend");
        /* ---- PRECOMPUTES ---- */
        /* --------------------- */
        /* COLOUR TEXTURE */
        this.genColourArray();
        this.initColourTex();

        /* BINOMIAL TEXTURE */
        const binomials = binomialArray(64);
        this.binomialTex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.binomialTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32UI, 64, 64, 0, this.gl.RED_INTEGER, this.gl.UNSIGNED_INT, binomials);
        this.texParams(this.gl.REPEAT);

        /* RULE TEXTURE */
        this.ruleTex = this.gl.createTexture();
        this.genRule();

        /* CRT PIXEL TEXTURE */
        this.crtPixelTex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.crtPixelTex);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 
            0, 
            this.gl.RGBA32F, //this.gl.RGBA, 
            4, 
            4,
            0, 
            this.gl.RGBA, //this.gl.RGBA, 
            this.gl.FLOAT, //this.gl.UNSIGNED_BYTE,
            CRTPIXELSTRUCTURE
        );
        this.texParams();

        /* - SIMULATION FRAMES - */
        /* --------------------- */
        /* SIMULATION TEXTURE A */
        this.texA = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texA);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R8UI, this.autoWidth, this.autoHeight,
            0, this.gl.RED_INTEGER, this.gl.UNSIGNED_BYTE, texDataBuffer.subarray(0, this.autoWidth * this.autoHeight));
        this.texParams(this.gl.REPEAT);
        
        /* SIMULATION FRAMEBUFFER A */
        this.fbFrameA = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbFrameA);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texA, 0);
        
        /* SIMULATION TEXTURE B */
        this.texB = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texB);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R8UI, this.autoWidth, this.autoHeight,
            0, this.gl.RED_INTEGER, this.gl.UNSIGNED_BYTE, null);
        this.texParams(this.gl.REPEAT);
        
        /* SIMULATION FRAMEBUFFER B */
        this.fbFrameB = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbFrameB);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texB, 0);
        
        /* --- SCREEN FRAMES --- */
        /* --------------------- */
        /* SCREEN TEXTURE A */
        let blackScreen = new Float32Array(this.screenWidth * this.screenHeight * 4);
        for (let i = 0; i < this.screenWidth * this.screenHeight; i++) {
            for (let j = 0; j < 4; j++) {
                blackScreen[i * 4 + j] = BLACK_FLOAT[j];
            }
        }

        this.texScreenA = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texScreenA);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 
            0, 
            this.gl.RGBA32F, //this.gl.RGBA, 
            this.screenWidth, 
            this.screenHeight,
            0, 
            this.gl.RGBA, //this.gl.RGBA, 
            this.gl.FLOAT, //this.gl.UNSIGNED_BYTE,
            blackScreen
        );
        this.texParams();

        /* SCREEN A FRAMEBUFFER */
        this.fbScreenA = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbScreenA);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texScreenA, 0);

        /* SCREEN TEXTURE B */
        this.texScreenB = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texScreenB);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 
            0, 
            this.gl.RGBA32F, //this.gl.RGBA,  
            this.screenWidth, 
            this.screenHeight,
            0, 
            this.gl.RGBA, //this.gl.RGBA, 
            this.gl.FLOAT, //this.gl.UNSIGNED_BYTE,
            blackScreen
        );
        this.texParams();

        /* SCREEN B FRAMEBUFFER */
        this.fbScreenB = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbScreenB);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.texScreenB, 0);

        /* BLOOM UTILITIES */
        const bloomFormat = this.gl.RGBA16F;
        this.fbBundles.threshold = this.createFrameBufferBundle(this.screenWidth, this.screenHeight, this.gl.CLAMP_TO_EDGE, this.gl.LINEAR, bloomFormat);
        
        for (let i = 0; i < this.bloomDepth; i++) {
            const [downWidth, downHeight] = [this.screenWidth / Math.pow(2, i + 1), this.screenHeight / Math.pow(2, i + 1)];
            const [upWidth, upHeight] = [this.screenWidth / Math.pow(2, i), this.screenHeight / Math.pow(2, i)];
            this.fbBundles[`downSampler${i}`] = this.createFrameBufferBundle(downWidth, downHeight, this.gl.CLAMP_TO_EDGE, this.gl.LINEAR, bloomFormat);
            this.fbBundles[`upSampler${i}`] = this.createFrameBufferBundle(upWidth, upHeight, this.gl.CLAMP_TO_EDGE, this.gl.LINEAR, bloomFormat);
        }

        /* CLEAR */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    private initLocs(): void {
        /* Just initializing locations so that they're available */
        this.uniforms = {
            stepSimuSampler: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "uSampler")!},
            stepBinomial: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "uBinomial")!},
            stepAutoRule: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "uRule")!},
            stepN: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "n")!},
            stepSpan: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "span")!},
            stepSimSize: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "simSize")!},
            stepRuleWidth: {loc: this.gl.getUniformLocation(this.programs.autoStep.prog, "ruleWidth")!},

            drawDims: {loc: this.gl.getUniformLocation(this.programs.autoDraw.prog, "uDims")!},
            drawMouse: {loc: this.gl.getUniformLocation(this.programs.autoDraw.prog, "uMouse")!},

            colourColours: {loc: this.gl.getUniformLocation(this.programs.autoColour.prog, "uColours")!},
            colourScreenSize: {loc: this.gl.getUniformLocation(this.programs.autoColour.prog, "uScreenSize")!},
            colourSimSize: {loc: this.gl.getUniformLocation(this.programs.autoColour.prog, "uSimSize")!},
            colourCamera: {loc: this.gl.getUniformLocation(this.programs.autoColour.prog, "camera")!},

            screenFadeSampler: {loc: this.gl.getUniformLocation(this.programs.screenFade.prog, "uSampler")!},
            screenFadeCoefficient: {loc: this.gl.getUniformLocation(this.programs.screenFade.prog, "fade")!},
        
            ruleGenSeed: {loc: this.gl.getUniformLocation(this.programs.ruleGen.prog, "seed")!},
            ruleGenN: {loc: this.gl.getUniformLocation(this.programs.ruleGen.prog, "n")!},
            ruleGenZeroChanceExp: {loc: this.gl.getUniformLocation(this.programs.ruleGen.prog, "zeroChanceExp")!},
            
            ruleMutVertexSeed: {loc: this.gl.getUniformLocation(this.programs.ruleMut.prog, "seed")!},
            ruleMutVertexRuleTexWidth: {loc: this.gl.getUniformLocation(this.programs.ruleMut.prog, "ruleTexWidth")!},
            ruleMutVertexRuleLength: {loc: this.gl.getUniformLocation(this.programs.ruleMut.prog, "ruleLength")!},

            ruleMutColourN: {loc: this.gl.getUniformLocation(this.programs.ruleMut.prog, "n")!},
            ruleMutColourSeed: {loc: this.gl.getUniformLocation(this.programs.ruleMut.prog, "colourSeed")!},
            crtWithBloomStartTexture: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "uSampler")!},
            crtWithBloomColours: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "uColours")!},
            crtWithBloomBloomTexture: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "uBloom")!},
            crtWithBloomScreenSize: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "uScreenSize")!},
            crtWithBloomSimSize: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "uSimSize")!},
            crtWithBloomCamera: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "camera")!},
            crtWithBloomStyle: {loc: this.gl.getUniformLocation(this.programs.crtWithBloom.prog, "style")!},

            flatQuadrupleProjectionStartTexture: {loc: this.gl.getUniformLocation(this.programs.flatQuadrupleProjection.prog, "uSampler")!},
            flatQuadrupleProjectionColours: {loc: this.gl.getUniformLocation(this.programs.flatQuadrupleProjection.prog, "uColours")!},
            flatQuadrupleProjectionScreenSize: {loc: this.gl.getUniformLocation(this.programs.flatQuadrupleProjection.prog, "uScreenSize")!},
            flatQuadrupleProjectionSimSize: {loc: this.gl.getUniformLocation(this.programs.flatQuadrupleProjection.prog, "uSimSize")!},
            flatQuadrupleProjectionCamera: {loc: this.gl.getUniformLocation(this.programs.flatQuadrupleProjection.prog, "camera")!},

            bloomUpsamplerSmaller: {loc: this.gl.getUniformLocation(this.programs.bloomUpsample.prog, "smallerSampler")!},
            bloomUpsamplerLarger: {loc: this.gl.getUniformLocation(this.programs.bloomUpsample.prog, "largerSampler")!},
        }

        for (let i = 0; i < this.bloomDepth; i++) {
            this.uniforms[`bloomDownsample${i}TexelSize`] = {loc: this.gl.getUniformLocation(this.programs.bloomDownsample.prog, "uTexelSize")!};
            this.uniforms[`bloomUpsample${i}TexelSize`] = {loc: this.gl.getUniformLocation(this.programs.bloomUpsample.prog, "uTexelSize")!};
        }
    }

    private initUnifsAndAttribs(): void {
        /* COLOUR RENDERER */
        this.gl.useProgram(this.programs.autoColour.prog);
        
        this.texVAO = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.texVAO);

        /* two triangles makes a quad */
        const vertexBufferData = new Float32Array([
           -1, -1,
            1, -1,
            1,  1,
            1,  1,
           -1,  1,
           -1, -1
        ]);

        const texCoordBufferData = new Float32Array([
            0, 0,
            1, 0,
            1, 1,
            1, 1,
            0, 1,
            0, 0
        ]);

        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexBufferData, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        const texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoordBufferData, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);

        this.gl.bindVertexArray(null);

        this.gl.uniform1i(this.uniforms.colourColours.loc, 1);
        this.gl.uniform2f(this.uniforms.colourScreenSize.loc, this.screenWidth, this.screenHeight);
        this.gl.uniform2f(this.uniforms.colourSimSize.loc, this.autoWidth, this.autoHeight);
        this.gl.uniform3f(this.uniforms.colourCamera.loc, this.camera.x, this.camera.y, this.camera.zoom);

        /* CRT WITH BLOOM */
        this.gl.useProgram(this.programs.crtWithBloom.prog);

        this.gl.uniform1i(this.uniforms.crtWithBloomStartTexture.loc, 0);
        this.gl.uniform1i(this.uniforms.crtWithBloomColours.loc, 1);
        this.gl.uniform1i(this.uniforms.crtWithBloomBloomTexture.loc, 2);
        this.gl.uniform2f(this.uniforms.crtWithBloomScreenSize.loc, this.screenWidth, this.screenHeight);
        this.gl.uniform2f(this.uniforms.crtWithBloomSimSize.loc, this.autoWidth, this.autoHeight);
        this.gl.uniform3f(this.uniforms.crtWithBloomCamera.loc, this.camera.x, this.camera.y, this.camera.zoom);
        this.gl.uniform1i(this.uniforms.crtWithBloomStyle.loc, 1);

        /* FLAT QUADRUPLE PROJECTOR */
        this.gl.useProgram(this.programs.flatQuadrupleProjection.prog);

        this.gl.uniform1i(this.uniforms.flatQuadrupleProjectionStartTexture.loc, 0);
        this.gl.uniform1i(this.uniforms.flatQuadrupleProjectionColours.loc, 1);
        this.gl.uniform2f(this.uniforms.flatQuadrupleProjectionScreenSize.loc, this.screenWidth, this.screenHeight);
        this.gl.uniform2f(this.uniforms.flatQuadrupleProjectionSimSize.loc, this.autoWidth, this.autoHeight);
        this.gl.uniform3f(this.uniforms.flatQuadrupleProjectionCamera.loc, this.camera.x, this.camera.y, this.camera.zoom);

        /* SIMULATION STEPPER */
        this.gl.useProgram(this.programs.autoStep.prog);

        this.gl.uniform1i(this.uniforms.stepSimuSampler.loc, 0);
        this.gl.uniform1i(this.uniforms.stepBinomial.loc, 1);
        this.gl.uniform1i(this.uniforms.stepAutoRule.loc, 2);

        this.gl.uniform1i(this.uniforms.stepN.loc, 2);
        this.gl.uniform1i(this.uniforms.stepSpan.loc, chooseWithRep(this.states, 8));
        this.gl.uniform2f(this.uniforms.stepSimSize.loc, this.autoWidth, this.autoHeight);
        this.gl.uniform1i(this.uniforms.stepRuleWidth.loc, RULEWIDTH);

        /* SIMULATION DRAWER */
        this.gl.useProgram(this.programs.autoDraw.prog);

        this.gl.uniform2f(this.uniforms.drawDims.loc, this.autoWidth, this.autoHeight);
        this.gl.uniform4f(this.uniforms.drawMouse.loc, 0, 0, this.brushSize, this.brushState);

        /* SCREEN PAINTER */
        this.gl.useProgram(this.programs.screenPaint.prog);
        //nothing to set up here atm 

        /* SCREEN FADER */
        this.gl.useProgram(this.programs.screenFade.prog);
        this.gl.uniform1i(this.uniforms.screenFadeSampler.loc, 0);
        this.gl.uniform1f(this.uniforms.screenFadeCoefficient.loc, this.fade);

        /* RULE MUTATOR */
        this.gl.useProgram(this.programs.ruleMut.prog);

        this.gl.uniform1ui(this.uniforms.ruleMutVertexRuleTexWidth.loc, RULEWIDTH);
    
        /* UPSAMPLER */
        this.gl.useProgram(this.programs.bloomUpsample.prog);

        this.gl.uniform1i(this.uniforms.bloomUpsamplerSmaller.loc, 0);
        this.gl.uniform1i(this.uniforms.bloomUpsamplerLarger.loc, 1);
    }

    /* ----------- FRAME AND SIM MANAGEMENT ------------- */
    /* -------------------------------------------------- */
    /* -------------------------------------------------- */

    private drawToCanvas(): void {
        /* Full routine from drawing frames through to the canvas */
        if (this.useCRT) {
            this.prepareBloom();
            this.drawCRTWithBloom();
            this.drawActiveScreen();
        } else {
            this.drawFrametoScreen();
            this.drawActiveScreen();
        }
    }

    public bloomScreen(): void {
        /* perform threshold pass */
        this.drawQuad(this.programs.bloomThreshold.prog, [(this.activeScreen ? this.texScreenA : this.texScreenB)!], this.fbBundles.threshold.fb);
        
        //this.drawQuad(this.programs.bloomThreshold.prog, [this.fbBundles.threshold.tex], (this.activeScreen ? this.fbScreenA : this.fbScreenB)!);

        /* downsampling */
        this.gl.useProgram(this.programs.bloomDownsample.prog);
        for (let i = 0; i < this.bloomDepth; i++) {
            this.gl.viewport(0, 0, this.fbBundles[`downSampler${i}`].outputSize[0], this.fbBundles[`downSampler${i}`].outputSize[1]);
            this.gl.uniform2fv(this.uniforms[`bloomDownsample${i}TexelSize`].loc, this.fbBundles[`downSampler${i}`].texelSize);
            this.drawQuad(this.programs.bloomDownsample.prog, [i == 0 ? this.fbBundles.threshold.tex : this.fbBundles[`downSampler${i - 1}`].tex], this.fbBundles[`downSampler${i}`].fb);
        }

        /* upsampling */
        this.gl.useProgram(this.programs.bloomUpsample.prog);
        for (let i = this.bloomDepth - 1; i >= 0; i--) {
            this.gl.viewport(0, 0, this.fbBundles[`upSampler${i}`].outputSize[0], this.fbBundles[`upSampler${i}`].outputSize[1]);
            this.gl.uniform2fv(this.uniforms[`bloomUpsample${i}TexelSize`].loc, this.fbBundles[`upSampler${i}`].texelSize);
            this.drawQuad(this.programs.bloomUpsample.prog, [i == this.bloomDepth - 1 ? this.fbBundles[`downSampler${i}`].tex : this.fbBundles[`upSampler${i + 1}`].tex, i == 0 ? (this.activeScreen ? this.texScreenA : this.texScreenB)! : this.fbBundles[`downSampler${i - 1}`].tex], this.fbBundles[`upSampler${i}`].fb);
        }

        this.gl.viewport(0, 0, this.screenWidth, this.screenHeight);
        /* tone mapping */
        this.drawQuad(this.programs.bloomToneMap.prog, [this.fbBundles.upSampler0.tex], (this.activeScreen ? this.fbScreenA : this.fbScreenB)!);
    }

    private prepareBloom(): void {
        /* makes sure that the last upsampler texture is ready to be used by the crt shader */
        /* first we have to draw a flat projection */
        this.drawQuad(this.programs.flatQuadrupleProjection.prog, [(this.activeFrame ? this.texA : this.texB)!, this.colourTex!], (this.activeScreen ? this.fbScreenA : this.fbScreenB)!);

        /* perform threshold pass */
        this.drawQuad(this.programs.bloomThreshold.prog, [(this.activeScreen ? this.texScreenA : this.texScreenB)!], this.fbBundles.threshold.fb);
        
        //this.drawQuad(this.programs.bloomThreshold.prog, [this.fbBundles.threshold.tex], (this.activeScreen ? this.fbScreenA : this.fbScreenB)!);

        /* downsampling */
        this.gl.useProgram(this.programs.bloomDownsample.prog);
        for (let i = 0; i < this.bloomDepth; i++) {
            this.gl.viewport(0, 0, this.fbBundles[`downSampler${i}`].outputSize[0], this.fbBundles[`downSampler${i}`].outputSize[1]);
            this.gl.uniform2fv(this.uniforms[`bloomDownsample${i}TexelSize`].loc, this.fbBundles[`downSampler${i}`].texelSize);
            this.drawQuad(this.programs.bloomDownsample.prog, [i == 0 ? this.fbBundles.threshold.tex : this.fbBundles[`downSampler${i - 1}`].tex], this.fbBundles[`downSampler${i}`].fb);
        }

        /* upsampling */
        this.gl.useProgram(this.programs.bloomUpsample.prog);
        for (let i = this.bloomDepth - 1; i >= 0; i--) {
            this.gl.viewport(0, 0, this.fbBundles[`upSampler${i}`].outputSize[0], this.fbBundles[`upSampler${i}`].outputSize[1]);
            this.gl.uniform2fv(this.uniforms[`bloomUpsample${i}TexelSize`].loc, this.fbBundles[`upSampler${i}`].texelSize);
            this.drawQuad(this.programs.bloomUpsample.prog, [i == this.bloomDepth - 1 ? this.fbBundles[`downSampler${i}`].tex : this.fbBundles[`upSampler${i + 1}`].tex, i == 0 ? (this.activeScreen ? this.texScreenA : this.texScreenB)! : this.fbBundles[`downSampler${i - 1}`].tex], this.fbBundles[`upSampler${i}`].fb);
        }

        this.gl.viewport(0, 0, this.screenWidth, this.screenHeight);
        /* tone mapping is saved for LATER */
    }

    private drawCRTWithBloom(): void {
        /* uses prepared bloom texture thru CRT shader */
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        /* draws active simulation texture to screen */
        this.gl.useProgram(this.programs.crtWithBloom.prog);
        this.gl.bindVertexArray(this.texVAO!);

        /* Bind the right texture to read from */
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeFrame ? this.texA : this.texB)!);
        
        /* Bind the colour scheme texture */
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colourTex!);

        /* Bind the bloom texture */
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.fbBundles.upSampler0.tex);

        /* Select the right framebuffer */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, (this.activeScreen ? this.fbScreenA : this.fbScreenB)!);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }
    
    private fadeScreen(): void {
        /* performs one iteration of fading out the screen */
        this.gl.useProgram(this.programs.screenFade.prog);

        /* Bind the currently active screen */
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeScreen ? this.texScreenA : this.texScreenB)!);

        /* Bind the framebuffer to draw to */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, (this.activeScreen ? this.fbScreenB : this.fbScreenA)!);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.activeScreen = ! this.activeScreen;
    }

    private drawFrametoScreen(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        /* draws active simulation texture to screen */
        this.gl.useProgram(this.programs.autoColour.prog);
        this.gl.bindVertexArray(this.texVAO!);

        /* Bind the right texture to read from */
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeFrame ? this.texA : this.texB)!);
        
        /* Bind the colour scheme texture */
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colourTex!);
        
        /* Configure blending */
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        /* Bind the framebuffer to draw to */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, (this.activeScreen ? this.fbScreenA : this.fbScreenB)!);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this.gl.disable(this.gl.BLEND);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    private drawActiveScreen(): void {
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        /* draws active screen to canvas */
        this.gl.useProgram(this.programs.screenPaint.prog);
        
        /* Bind the texture to read from */
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeScreen ? this.texScreenA : this.texScreenB)!);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    public stepSim(): void {
        this.gl.useProgram(this.programs.autoStep.prog);
        /* set canvas size to simulation size */
        this.gl.viewport(0, 0, this.autoWidth, this.autoHeight);

        /* Bind the texture to start from */
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeFrame ? this.texA : this.texB)!);
        /* Bind precalculated binomials */
        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.binomialTex!);
        /* Bind the rule */
        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.ruleTex!);

        /* Bind the framebuffer we're writing to */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, (this.activeFrame ? this.fbFrameB : this.fbFrameA)!);
        
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        /* CLEAR & reset canvas size */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.activeFrame = ! this.activeFrame;
    }

    private stepDraw(): void {
        /* handle any drawing that needs to be done */
        this.gl.useProgram(this.programs.autoDraw.prog);

        /* set canvas size to simulation size */
        this.gl.viewport(0, 0, this.autoWidth, this.autoHeight);

        /* Bind the texture to be start from */
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeFrame ? this.texA : this.texB)!);

         /* Bind the framebuffer we're writing to */
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, (this.activeFrame ? this.fbFrameB : this.fbFrameA)!);
        
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        /* reset canvas size */
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        this.activeFrame = ! this.activeFrame;
    }

    private animSim(now: number): void {
        /* one cycle per call */
        this.fadeScreen();

        const panSpeed = 4.0 / this.zoomLevels[this.zoomIdx];
        switch (this.panDir) {
            case 'up':
                this.camera.y += panSpeed;
                break;
            case 'down':
                this.camera.y -= panSpeed;
                break;
            case 'left':
                this.camera.x -= panSpeed;
                break;
            case 'right':
                this.camera.x += panSpeed;
        }

        this.updateCamera();

        if (this.flashing) {
            this.flash();
        } else if (this.dotting) {
            this.circle();
        } else if (this.clearing) {
            this.clear();
        }

        /* handle any drawing that needs to be done */
        if (this.draw) {
            this.stepDraw();
        }

        if (this.playing && now - this.lastSimFrame >= 1000 / this.framerates[this.frameRateIdx]) {
            this.lastSimFrame = now;
            this.stepSim();
        }

        this.drawToCanvas();
        window.requestAnimationFrame(this.animSim.bind(this));
    }

    private loadFrameFromBuffer(): void {
        /* set active texture and load information */
        this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, 1);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeFrame? this.texA : this.texB)!);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R8UI, this.autoWidth, this.autoHeight, 0, this.gl.RED_INTEGER, this.gl.UNSIGNED_BYTE, texDataBuffer.subarray(0, this.autoWidth * this.autoHeight));
        
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        //this.drawActiveFrame();
        this.drawToCanvas();
    }
    
    /* --------------- DRAWING FUNCTIONS ---------------- */
    /* -------------------------------------------------- */
    /* -------------------------------------------------- */

    public flash() {
        /* Fills the simulation with noise */
        this.randomize();
        this.loadFrameFromBuffer();
    }

    public diamond(size = 50) {
        /* clear the data buffer */
        texDataBuffer.fill(0);

        /* make a diamond */
        const xMid = this.screenWidth / 2;
        const yMid = this.screenHeight / 2;
        for (let dx = -1 * (size / 2); dx <= size / 2; dx++) {
            for (let dy = -1 * (size / 2 - Math.abs(dx)); dy < size / 2 - Math.abs(dx); dy++) {
                texDataBuffer[yMid * this.autoWidth + dy * this.autoWidth + xMid + dx] = this.states - 1;
            }
        }

        this.loadFrameFromBuffer();
    }

    public circle(size = this.brushSize) {
        /* uses Pythagoras */
        const xMid = this.screenWidth / 2;
        const yMid = this.screenHeight / 2;
        for (let i = 0; i < this.autoWidth * this.autoHeight; i++) {
            const x = i % this.autoWidth;
            const y = i / this.autoWidth;
            texDataBuffer[i] = Math.sqrt((x - xMid) ** 2 + (y - yMid) ** 2) <= size ? this.states - 1 : 0;
        }

        this.loadFrameFromBuffer();
    }

    public clear(): void {
        texDataBuffer.fill(0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, (this.activeFrame? this.texA : this.texB)!);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R8UI, this.autoWidth, this.autoHeight, 0, this.gl.RED_INTEGER, this.gl.UNSIGNED_BYTE, texDataBuffer.subarray(0, this.autoWidth * this.autoHeight));
        this.drawToCanvas();
    }

    /* ------------ BASIC FUNCTIONS/HELPERS ------------- */
    /* -------------------------------------------------- */
    /* -------------------------------------------------- */

    public randomize(): void {
        for (let i = 0; i < this.autoWidth * this.autoHeight; i++) {
            texDataBuffer[i] = Math.floor(Math.random() * this.states);
        }
    }

    private texParams(wrap: number = this.gl.CLAMP_TO_EDGE, filter: number = this.gl.NEAREST): void {
        /* Takes care of the repetitive boilerplate for each new texture */
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, wrap);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, wrap);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, filter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, filter);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAX_LEVEL, 0);
    }

    private createFrameBufferBundle(width: number, 
                                    height: number, 
                                    wrap: number = this.gl.CLAMP_TO_EDGE, 
                                    filter: number = this.gl.NEAREST,
                                    iFormat: number = this.gl.R11F_G11F_B10F
                                ) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texStorage2D(this.gl.TEXTURE_2D, 1, iFormat, width, height);
        this.texParams(wrap, filter);
        
        const fb = this.gl.createFramebuffer();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fb);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, texture, 0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        const outputSize: [number, number] = [width, height];
        const texelSize: [number, number] = [1.0 / width, 1.0 / height];

        return {
            fb,
            tex: texture,
            outputSize,
            texelSize,
        }
    }

    private drawQuad(program: WebGLProgram, textures: Array<WebGLTexture>, output: WebGLFramebuffer | null) {
        this.gl.bindVertexArray(this.texVAO!);
        this.gl.useProgram(program);

        for (let i = 0; i < textures.length; i++) {
            this.gl.activeTexture(this.gl.TEXTURE0 + i);
            this.gl.bindTexture(this.gl.TEXTURE_2D, textures[i]);  
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, output);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    private getSimSpaceMousePosition(e: MouseEvent): Array<number> {
        // get canvas relative css position
        const rect = this.canvas.getBoundingClientRect();
        const simX = (e.clientX - rect.left) / this.camera.zoom + (this.pan ? this.panStartCam[0] : this.camera.x);
        const simY = (-1 * (e.clientY - rect.bottom)) / this.camera.zoom + (this.pan ? this.panStartCam[1] : this.camera.y);

        return [simX, simY];
    }

    private updateCamera(): void {
        this.gl.useProgram(this.programs.autoColour.prog);
        this.gl.uniform3f(this.uniforms.colourCamera.loc, this.camera.x, this.camera.y, this.camera.zoom);
        this.gl.useProgram(this.programs.crtWithBloom.prog);
        this.gl.uniform3f(this.uniforms.crtWithBloomCamera.loc, this.camera.x, this.camera.y, this.camera.zoom);
        this.gl.useProgram(this.programs.flatQuadrupleProjection.prog);
        this.gl.uniform3f(this.uniforms.flatQuadrupleProjectionCamera.loc, this.camera.x, this.camera.y, this.camera.zoom);
    }

    private handleZoomChange(
            simX = this.canvas.width / (2.0 * this.camera.zoom) + this.camera.x, 
            simY = this.canvas.height/ (2.0 * this.camera.zoom) + this.camera.y                              
        ) {
        const newZoom = this.zoomLevels[this.zoomIdx];
        const dZoom = newZoom / this.camera.zoom;

        const newX = Math.floor(simX + (this.camera.x - simX) / dZoom);
        const newY = Math.floor(simY + (this.camera.y - simY) / dZoom);

        this.camera.x = newX;
        this.camera.y = newY;
        this.camera.zoom = newZoom;
        
        this.updateCamera();

        this.drawToCanvas();
    }

    /* --------------- GETTERS & SETTERS ---------------- */
    /* -------------------------------------------------- */
    /* -------------------------------------------------- */

    public togglePlay(): boolean {
        this.playing = ! this.playing;
        if (this.playing) {
            this.animSim(performance.now());
        }
        return this.playing;
    }

    public setPlay(val: boolean): void {
        this.playing = val;
        if (this.playing) {
            this.animSim(performance.now());
        }
        console.log("set");
    }

    public toggleCPU(): boolean {
        if (!this.cpuRuleControl && !this.ruleArrayIsCurrent) {
            this.synchronizeRuleArray();
        }
        this.cpuRuleControl = ! this.cpuRuleControl;
        return this.cpuRuleControl;
    }

    public getColours(): Array<number> {
        return Array.from(this.colourScheme.subarray(0, this.states * 4));
    }

    public setCPU(val: boolean): void {
        if (val != this.cpuRuleControl) {
            this.toggleCPU();
        }
    }

    public setFlash(val: boolean): void {
        this.flashing = val;
    }

    public setDot(val: boolean): void {
        this.dotting = val;
    }

    public setClear(val: boolean): void {
        this.clearing = val;
    }

    public toggleCRTStyle(): boolean {
        this.CRTstyle = ! this.CRTstyle;
        this.gl.useProgram(this.programs.crtWithBloom.prog);
        this.gl.uniform1i(this.uniforms.crtWithBloomStyle.loc, this.CRTstyle ? 1 : 0);
        return this.CRTstyle;
    }
    
    public setUseCRT(val: boolean): void {
        this.useCRT = val;
        if (this.useCRT && this.zoomLevels[this.zoomIdx] < 4) {
            this.zoomIdx = this.zoomLevels.findIndex(level => level == 4.0);
            this.handleZoomChange();
        }
    }

    public setN(n: number): number {
        if (n >= MIN_N && n <= MAX_N) {
            this.states = n;
            this.clear();
            this.randomizeRule();
            
            this.gl.useProgram(this.programs.autoColour.prog);

            this.gl.useProgram(this.programs.autoStep.prog);
            this.gl.uniform1i(this.uniforms.stepN.loc, n); //TODO
            this.gl.uniform1i(this.uniforms.stepSpan.loc, chooseWithRep(this.states, 8));

            this.brushState = this.states - 1;

            this.genColourArray();
            this.regenColourTex();
        }
        
        return this.states;
    }

    public changeFramerate(diff: number): number {
        this.frameRateIdx = Math.max(0, Math.min(this.frameRateIdx + diff, this.framerates.length - 1));
        return this.framerates[this.frameRateIdx];
    }

    public changeZoom(diff: number): number {
        //const prevIdx = this.zoomIdx;
        const minZoom = this.useCRT ? this.zoomLevels.findIndex(level => level == 4.0) : 0;
        this.zoomIdx = Math.max(minZoom, Math.min(this.zoomIdx + diff, this.zoomLevels.length - 1));
        // this.handleZoomChange(this.canvas.width / (2.0 * this.camera.zoom) + this.camera.x,
        //                       this.canvas.height/ (2.0 * this.camera.zoom) + this.camera.y);
        this.handleZoomChange();
        return this.zoomLevels[this.zoomIdx];
    }

    public setPanDir(s: string): void {
        this.panDir = s;
    }

    public setPrimaryColour(colour: Record<'h' | 's' | 'l', number>): void {
        this.primaryColour[0] = colour.h;
        this.primaryColour[1] = colour.s;
        this.primaryColour[2] = colour.l;

        this.genColourArray();
        this.regenColourTex();
    }

    public setRadialSpreadDegrees(n: number): void {
        this.radialSpreadDegrees = n;
        
        if (this.colouringStyle == "radialSpread") {
            this.genColourArray();
            this.regenColourTex();
        }
    }

    public setColouringStyleVariable(x: number): void {
        this.radialSpreadDegrees = 360 * x / 100;
        this.minColourLuminance = x;
        this.genColourArray();
        this.regenColourTex();
    }

    public setBrushSize(n: number): number {
        this.brushSize = n;
        this.gl.useProgram(this.programs.autoDraw.prog);
        this.gl.uniform4f(this.uniforms.drawMouse.loc, 0, 0, this.brushSize, 0);
        return this.brushSize;
    }

    public setBrushState(n: number): void {
        this.brushState = n;
    }

    public setDistinguishZeroColour(val: boolean): void {
        this.distinguishZeroColour = val;
        this.genColourArray();
        this.regenColourTex();
    }

    public setDistinguishMaxColour(val: boolean): void {
        this.distinguishMaxColour = val;
        this.genColourArray();
        this.regenColourTex();
    }

    public setColouringStyle(s: string): void {
        this.colouringStyle = s;
        this.genColourArray();
        this.regenColourTex();
    }

    /* ------------------ RULE CONTROL ------------------ */
    /* -------------------------------------------------- */
    /* -------------------------------------------------- */

    private genRule(): void {
        /* creates and binds the rule texture */
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.ruleTex!);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R8UI, RULEWIDTH, RULEWIDTH, 0, this.gl.RED_INTEGER, this.gl.UNSIGNED_BYTE, this.rule)!;
        this.texParams(this.gl.REPEAT);

        this.fbRule = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbRule);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.ruleTex!, 0);

        this.ruleNumber = this.ruleToNumber();
    }

    public setConway(): void {
        for (let i = 0; i < 18; i++) {
            this.rule[i] = 0;
        }
        this.rule[3] = 1;
        this.rule[11] = 1;
        this.rule[12] = 1;
    }

    public randomizeRule(n = this.states) {
        /* produces a random rule for an automaton with n states */
        /* uses a trick I owe to Benjamin Mastripolito to make it*/
        /* increasingly likely with each state to generate zeroes*/
        if (this.cpuRuleControl) {
            const span = chooseWithRep(n, 8);
            const zeroChance = Math.max(
                this.ruleZeroChanceExp,
                1.0 - 1.0 / Math.pow(this.states, this.ruleZeroChanceExp)
            )
            for (let i = 0; i < n * span; i++) {
                if (Math.random() < zeroChance) {
                    this.rule[i] = 0;
                } else {
                    this.rule[i] = Math.floor(Math.random() * n ); //technically still a chance of zero, but works better this way (less static)
                }
                
            }
            this.genRule()
            this.ruleArrayIsCurrent = true;
        } else {
            this.gl.viewport(0, 0, RULEWIDTH, RULEWIDTH);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

            this.gl.useProgram(this.programs.ruleGen.prog);

            this.gl.uniform1f(this.uniforms.ruleGenSeed.loc, Math.random());
            this.gl.uniform1f(this.uniforms.ruleGenN.loc, this.states);
            this.gl.uniform1f(this.uniforms.ruleGenZeroChanceExp.loc, this.ruleZeroChanceExp);
            
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbRule!);

            this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
            
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
            this.ruleArrayIsCurrent = false;
        }
    }
    
    public mutateRule(dist = this.ruleLength() / 18) {
        /* mutates a rule (in place) for n states dist times */

        if (this.cpuRuleControl) {
            for (let i = 0; i < dist; i++) {
                const idx = Math.floor(Math.random() * this.ruleLength());
                //this.rule[idx] = (this.rule[idx] === 0) ? 1 : 0;
                if (this.rule[idx] === 0) {
                    this.rule[idx] = 1;
                } else if (this.rule[idx] === this.states - 1) {
                    this.rule[idx] = this.states - 2;
                } else {
                    this.rule[idx] += Math.random() < 0.5 ? 1 : -1;
                }
            }
            this.genRule();
        } else {
            this.gl.viewport(0, 0, RULEWIDTH, RULEWIDTH);
            
            this.gl.useProgram(this.programs.ruleMut.prog);

            /* set appropriate uniforms */
            this.gl.uniform1ui(this.uniforms.ruleMutVertexSeed.loc, (Math.random() * 0x100000000) >>> 0);
            this.gl.uniform1f(this.uniforms.ruleMutVertexRuleLength.loc, this.ruleLength());

            this.gl.uniform1ui(this.uniforms.ruleMutColourN.loc, this.states);
            this.gl.uniform1ui(this.uniforms.ruleMutColourSeed.loc, (Math.random() * 0x100000000) >>> 0);

            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbRule!);

            /* copy texture to temp texture to draw from (avoiding loops) */
            const temp = this.gl.createTexture();
            this.gl.bindTexture(this.gl.TEXTURE_2D, temp);
            this.gl.copyTexImage2D(this.gl.TEXTURE_2D, 0, this.gl.R8UI, 0, 0, RULEWIDTH, RULEWIDTH, 0);
            this.texParams();

            /* set up a temp vao */
            const blankVAO = this.gl.createVertexArray();
            this.gl.bindVertexArray(blankVAO);

            this.gl.drawArrays(this.gl.POINTS, 0, dist);

            /* reset */
            this.gl.bindVertexArray(this.texVAO!);
            this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

            this.ruleArrayIsCurrent = false;
        }
    }

    private ruleLength(n = this.states): number {
        /* returns the length of the current rule */
        return chooseWithRep(n, 8) * n;
    }

    public ruleToNumber(): number {
        /* returns 1-indexed rule number      
           only valid for 2-state because 
           3-state already has 3^(45*3) rules */
        if (this.states === 2) {
            return parseInt(Array.from(this.rule.subarray(0, 18)).map(String).join(""), 2) + 1;
        } else {
            return 0;
        }
    }

    public exportRule(): string {
        if ( !this.ruleArrayIsCurrent) {
            this.synchronizeRuleArray();
            this.ruleArrayIsCurrent = true;
        }

        if (this.states < 4) {
            return exportRuleDirect(this.rule, this.states);
        }
        
        return stringifyRule(packRule(this.rule, this.states));
    }

    private synchronizeRuleArray(): void {
        /* read the rule in from the rule texture */
        const length = this.ruleLength();
        const height = Math.ceil((length * 1.0 / RULEWIDTH));
        const pixels = new Uint8Array(height * RULEWIDTH);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbRule!);

        this.gl.readPixels(
            0,
            0,
            RULEWIDTH,
            height,
            this.gl.RED_INTEGER,
            this.gl.UNSIGNED_BYTE,
            pixels,
        );
        
        for (let i = 0; i < length; i++) {
            this.rule[i] = pixels[i];
        }
    }

    public importRule(rule: string): void {
        let unpacked;
        let n;

        if (rule.length == 3 || rule.length == 45) {
            /* 2-state or 3-state */
            n = rule.length == 3 ? 2 : 3;
            unpacked = importRuleDirect(rule, n);
        } else {
            const lengths = [-1, -1, -1, 34, 165, 930, 2898, 7884, 19305, 57915, 121550, 240669, 453492];
            const decompressed = rulifyString(rule);
            n = lengths.indexOf(decompressed.length);

            if (n < 3) {
                /* invalid */
                return;
            }

            unpacked = unpackRule(decompressed, n);
        }
        if (n != this.states) {
            this.setN(n);
        }

        const len = this.ruleLength(n);
        for (let i = 0; i < len; i++) {
            this.rule[i] = unpacked[i];
        }

        this.genRule();
        this.ruleArrayIsCurrent = true;
    }

    /* ----------------- COLOUR CONTROL ----------------- */
    /* -------------------------------------------------- */
    /* -------------------------------------------------- */

    private genColourArray() {
        /* set boundary colours, if so designated */
        if (this.distinguishZeroColour) {
            for (let i = 0; i < 3; i++) {
                this.colourScheme[i] = 0;
            }
        }

        if (this.distinguishMaxColour) {
            for (let i = 0; i < 3; i++) {
                this.colourScheme[(this.states - 1) * 4 + i] = 255;
            }
        }

        const start = this.distinguishZeroColour ? 1 : 0;
        const end = this.distinguishMaxColour ? this.states - 2 : this.states - 1;
        const spread = end - start;

        if (spread < 0) {
            /* edge case where we only have two states and they're black and white */
            return
        }

        const primaryRGB = hslToRGB(this.primaryColour);

        /* set primary colour */
        for (let i = 0; i < 3; i++) {
            this.colourScheme[end * 4 + i] = primaryRGB[i];
        }
        
        /* check if this all we needed to set */
        if (spread === 0) {
            return;
        }

        switch (this.colouringStyle) {
            case "radialSpread":
                this.radialSpreadColouring(start, end);
                break;
            case "sameHue":
                this.sameHueColouring(start, end);
                break;
            case "threshold":
                this.thresholdColouring(end);
                break;
        }
    }

    private radialSpreadColouring(start: number, end: number): void {
        /* fills the residual colour space divvying up the colour wheel */
        const primaryHue = this.primaryColour[0];
        const delta = this.radialSpreadDegrees / (end - start + 1);
        for (let i = 1; i <= end - start; i++) {
            let curHue;
            if (i % 2 == 0) {
                curHue = (primaryHue + (Math.floor(i / 2)) * delta) % 360;
            } else {
                curHue = (primaryHue + 360 - (Math.floor(i / 2) + 1) * delta) % 360;
            }
            const curRGB = hslToRGB([curHue, this.primaryColour[1], this.primaryColour[2]]);
            for (let j = 0; j < 3; j++) {
                this.colourScheme[(end - i) * 4 + j] = curRGB[j];
            }
        }
    }

    private sameHueColouring(start: number, end: number): void {
        /* fills the residual colour space (outside edges and primary colour) */
        /* with darker version of the primary colour in a linear scale        */
        const delta = (this.primaryColour[2] - this.minColourLuminance) / (end - start);
        for (let i = 1; i <= end - start; i++) {
            const curRGB = hslToRGB([this.primaryColour[0], this.primaryColour[1], this.primaryColour[2] - delta * i]);
            for (let j = 0; j < 3; j++) {
                this.colourScheme[(end - i) * 4 + j] = curRGB[j];
            }
        }
    }

    private thresholdColouring(end: number): void {
        const boundary = (this.minColourLuminance / 100.0) * end;
        const colour = hslToRGB(this.primaryColour.slice(0, 3));
        for (let i = 0; i < end; i++) {
            for (let j = 0; j < 3; j++) {
                this.colourScheme[(i * 4) + j] = (i > boundary) ? colour[j] : 0;
            }
        }
    }

    private initColourTex() {
        /* Should only need to be run on startup */
        this.colourTex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colourTex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA8UI, COLOURTEXWIDTH, COLOURTEXWIDTH,
            0, this.gl.RGBA_INTEGER, this.gl.UNSIGNED_BYTE, this.colourScheme);
        this.texParams();
    }

    private regenColourTex() {
        /* Regenerate the colours without having to remake the texture */
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.colourTex!);
        this.gl.texSubImage2D(this.gl.TEXTURE_2D, 0, 0, 0, COLOURTEXWIDTH, COLOURTEXWIDTH, this.gl.RGBA_INTEGER, this.gl.UNSIGNED_BYTE, this.colourScheme);
    }
}