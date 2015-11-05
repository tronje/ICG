var gl;
var first_point_x = 0;
var first_point_y = 0;
var second_point_x = 0;
var second_point_y = 0;

// our canvas
var canvas = document.getElementById("gl-canvas");
if (!canvas) {alert("LOL");}

// vertices
var vertices = new Float32Array([]); // initialize empty

// colors
// we seperate color and vertex vectors because it'll be simpler to modify
// them on the fly (hopefully)
var colors = new Float32Array([
                                1, 0, 0, 1,
                                1, 0, 0, 1,
                                1, 0, 0, 1,
                                1, 0, 0, 1 ]);

window.onload = function init()
{
    // get canvas and set up webGL

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available!"); }

    // configure viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // init shader program and bind it
    var program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    
    // Load colors into the GPU and associate shader variables
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Load positions into the GPU and associate shader variables
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // fetch points of mouse down/up
    canvas.onmousedown = function(event) {
        first_point_x = event.clientX;
        first_point_y = event.clientY;
    }
    canvas.onmouseup = function(event) {
        second_point_x = event.clientX;
        second_point_x = event.clientX;
    }

    // loop our render function
    setInterval(render, 17);
};

function render()
{
    // clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // set vertices
    vertices = new Float32Array([
        normValue(first_point_x, 0, canvas.width, -1, 1),
        normValue(first_point_y, 0, canvas.height, -1, 1),
        normValue(second_point_x, 0, canvas.width, -1, 1),
        normValue(second_point_y, 0, canvas.height, -1, 1)]);

    // draw our square
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
}

function normValue(value, valueMin, valueMax, resultMin, resultMax)
{
    temp = (value - valueMin) / (valueMax - valueMin);
    return temp * (resultMax - resultMin) + resultMin;
}
