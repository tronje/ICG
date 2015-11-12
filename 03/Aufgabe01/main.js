// our webgl context
var gl;

// our canvas
var canvas;

// our circle's attributes
var thickness = 20;
var radius = 200;
var brightness = 1.5;

// the corresponding locations
var radius_loc;
var thickness_loc;
var brightness_loc;

// define keycodes for arrow keys
var left = 37;
var up = 38;
var right = 39;
var down = 40;

window.onload = function init()
{
    // Get canvas and setup webGL
    
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // Specify position and color of the vertices
    var vertices = new Float32Array([// vertices
                                     -1, -1, 
                                     -1,  1, 
                                      1,  1,
                                      1, -1,

                                     // colors
                                      0, 1, 1, 1,
                                      0, 0, 1, 1,
                                      1, 0, 1, 1,
                                      1, 1, 0, 1,
                                      ]);

    // Configure viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Init shader program and bind it
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    /// get variable locations from shader
    radius_loc = gl.getUniformLocation(program, "radius");
    thickness_loc = gl.getUniformLocation(program, "thickness");
    brightness_loc = gl.getUniformLocation(program, "brightness");
    gl.useProgram(program);

    // initially set our variables in the fragment shader
    gl.uniform1f(radius_loc, 200.0);
    gl.uniform1f(thickness_loc, 20.0);
    gl.uniform1f(brightness_loc, 1.5);
    
    // Load colors into the GPU and associate shader variables
    // Load positions into the GPU and associate shader variables
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 32);
    gl.enableVertexAttribArray(vColor);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}

/*
 * map a given value that occours in the range valueMin to valueMax,
 * to its corresponding value within the range resultMin to resultMax.
 */
function normValue(value, valueMin, valueMax, resultMin, resultMax)
{
    temp = (value - valueMin) / (valueMax - valueMin);
    return temp * (resultMax - resultMin) + resultMin;
}

/*
 * Load positions into the GPU and associate shader variables
 */
function loadPos(vertices)
{
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    // register vertices in buffer
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

/*
 * Load colors into the GPU and associate shader variables
 */
function loadColors(colors)
{
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}
