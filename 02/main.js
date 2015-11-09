var gl;

// points registered
var reg_points = [0, 0,
                  0, 0];

// our canvas
var canvas;

// vertices
var vertices = new Float32Array(reg_points);

// colors
// we seperate color and vertex vectors because it'll be simpler to modify
// them on the fly (hopefully)
var colors = new Float32Array([1, 0, 0, 1,
                               1, 0, 0, 1,
                               1, 0, 0, 1,
                               1, 0, 0, 1 ]);

var _red = new Float32Array([1, 0, 0, 1,
                             1, 0, 0, 1,
                             1, 0, 0, 1,
                             1, 0, 0, 1 ]);

var _green = new Float32Array([0, 1, 0, 1,
                               0, 1, 0, 1,
                               0, 1, 0, 1,
                               0, 1, 0, 1 ]);

var _blue = new Float32Array([0, 0, 1, 1,
                              0, 0, 1, 1,
                              0, 0, 1, 1,
                              0, 0, 1, 1 ]);

// fetch the keycodes we'll need to change color
// we do this now so we don't have to do it every
// time a key is pressed
var r_code = "r".charCodeAt(0);
var g_code = "g".charCodeAt(0);
var b_code = "b".charCodeAt(0);

window.onload = function init()
{
    // loop our render function
    // get canvas and set up webGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available!"); }

    // the canvas can't be focused; thus we need to add a key listener
    // to the window instead
    window.addEventListener("keypress", function(event) {
        switch(event.charCode) {
            case r_code:
                colors = _red;
                break;
            case g_code:
                colors = _green;
                break;
            case b_code:
                colors = _blue;
                break;
        }

        // Load colors into the GPU and associate shader variables
        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
        
        var vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
    });

    // add event listeners to canvas
    canvas.addEventListener("mousedown", function(event) {
        //reg_points[0] = event.clientX;
        //reg_points[1] = event.clientY;
        reg_points[0] = normValue(event.clientX, 0, canvas.width, -1, 1);
        reg_points[1] = normValue(event.clientY, 0, canvas.height, -1, 1);
    });

    canvas.addEventListener("mouseup", function(event) {
        //reg_points[2] = event.clientX;
        //reg_points[3] = event.clientY;
        reg_points[2] = normValue(event.clientX, 0, canvas.width, -1, 1);
        reg_points[3] = normValue(event.clientY, 0, canvas.height, -1, 1);

        vertices = new Float32Array(makeSquare(reg_points));


        // Load positions into the GPU and associate shader variables
        var bufferId = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);

        // clear canvas
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // re-register vertices in buffer
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        // draw our square
        //gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    });

    // configure viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // init shader program and bind it
    var program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    // Load colors into the GPU and associate shader variables
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
    
    vertices = new Float32Array(makeSquare(reg_points));
};

function normValue(value, valueMin, valueMax, resultMin, resultMax)
{
    temp = (value - valueMin) / (valueMax - valueMin);
    return temp * (resultMax - resultMin) + resultMin;
}

function makeSquare(arr)
{
    // assuming the first point's x and y are both lower than
    // the second point's x and y, the positions are..
    temp = [arr[0], -arr[1], // bottom left
            arr[2], -arr[1], // bottom right
            arr[2], -arr[3], // top right
            arr[0], -arr[3]]; // top left
    /* note: we invert the y-coordinates because the canvas
       and webgl have different coordinate conventions;
       canvas has its origin (0,0) at the top left corner, while
       webgl has its origin in the center.
    */

    return temp;
}
