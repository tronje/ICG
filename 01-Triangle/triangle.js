var gl;

window.onload = function init()
{
    // Get canvas and setup webGL
    
    var canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Specify position and color of the vertices
    
    var vertices = new Float32Array([  // vertices
                                       -0.5, -0.5, 
                                       -0.5,  0.5, 
                                        0.5,  0.5,
                                        0.5, -0.5,
                                       -0.5, -0.5,

                                       // colors
                                        1, 0, 0, 1,
                                        1, 1, 0, 1,
                                        0, 1, 0, 1,
                                        0, 1, 0, 1,
                                        0.5, 0.5, 0.5, 1]);

    // Configure viewport

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);

    // Init shader program and bind it

    var program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    
    // Load colors into the GPU and associate shader variables
    

    // Load positions into the GPU and associate shader variables

    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 40);
    gl.enableVertexAttribArray(vColor);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 5);
}
