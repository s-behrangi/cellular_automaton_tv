function createShader(gl: WebGL2RenderingContext, type: GLenum, source: string) {
            const shader = gl.createShader(type)!;

            gl.shaderSource(shader, source);
            gl.compileShader(shader);

            if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                return shader;
            } else {
                console.log(gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return;
            }            
}

function createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.log(gl.getShaderInfoLog(vertexShader));
                console.log(gl.getShaderInfoLog(fragmentShader));
                gl.deleteProgram(program);
                return;
            } else {
                return program;
            }
}

export function createProgramFromSource(gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    return program;
}

export function setRectangle(gl: WebGL2RenderingContext, x: number, y: number, width: number, height: number) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}

export function randomInt(range: number) {
    return Math.floor(Math.random() * range);
}