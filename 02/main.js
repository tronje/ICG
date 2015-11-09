var gl;
var program;

// points registered
var reg_points = [0, 0,
                  0, 0];

// array to be drawn
var draw_points = [];

// number of squares to be drawn
var num_squares = 0;

// our canvas
var canvas;

// our color display
var color_display;

// our clear-button
var clearer;

// vertices
var vertices;
var temp_vertices;

// colors
// we seperate color and vertex vectors because it'll be simpler to modify
// them on the fly (hopefully)
var _colors = [1, 0, 0, 1,
               1, 0, 0, 1,
               1, 0, 0, 1,
               1, 0, 0, 1 ];

var colors = [];
var draw_colors;

var _red = [1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1,
            1, 0, 0, 1 ];

var _green = [0, 1, 0, 1,
              0, 1, 0, 1,
              0, 1, 0, 1,
              0, 1, 0, 1 ];

var _blue = [0, 0, 1, 1,
             0, 0, 1, 1,
             0, 0, 1, 1,
             0, 0, 1, 1 ];

// fetch the keycodes we'll need to change color
// we do this now so we don't have to do it every
// time a key is pressed
var r_code = "r".charCodeAt(0);
var g_code = "g".charCodeAt(0);
var b_code = "b".charCodeAt(0);

// variable to keep track of wether the mouse is clicked or not
var clicked = false;

// init function
window.onload = function init()
{
    // get our canvas
    canvas = document.getElementById("gl-canvas");

    // get our color-display div and modify it a little
    color_display = document.getElementById("color-display");
    color_display.style.maxWidth = '100px';
    color_display.style.color = 'white';
    color_display.style.backgroundColor = '#ff0000';

    // set up webgl
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available!"); }

    // get our clear button
    clearer = document.getElementById("clearer");

    // add functionality to it
    clearer.addEventListener("click", function() {
        // clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // re-initialize (almost) everything
        num_squares = 0;
        draw_points = [];
        reg_points = [0, 0, 0, 0];
        colors = [];
    });

    // the canvas can't be focused; thus we need to add a key listener
    // to the window instead
    window.addEventListener("keypress", function(event) {
        switch(event.charCode) {
            case r_code:
                _colors = _red;
                color_display.style.backgroundColor = '#ff0000';
                break;
            case g_code:
                _colors = _green;
                color_display.style.backgroundColor = '#00ff00';
                break;
            case b_code:
                _colors = _blue;
                color_display.style.backgroundColor = '#0000ff';
                break;
        }
    });

    // add event listeners to canvas

    // register mouse click and position on mousedown
    canvas.addEventListener("mousedown", function(event) {
        clicked = true;
        reg_points[0] = normValue(event.clientX, 0, canvas.width, -1, 1);
        reg_points[1] = normValue(event.clientY, 0, canvas.height, -1, 1);
    });

    // register mouse un-click and position on mouseup
    // also update vertices and colors and draw everything
    canvas.addEventListener("mouseup", function(event) {
        clicked = false;

        // update the number of squares to be drawn
        num_squares += 1;

        reg_points[2] = normValue(event.clientX, 0, canvas.width, -1, 1);
        reg_points[3] = normValue(event.clientY, 0, canvas.height, -1, 1);

        // concatenate registered points to the points to be drawn
        draw_points = draw_points.concat(makeSquare(reg_points));

        //vertices = new Float32Array(makeSquare(reg_points));
        vertices = new Float32Array(draw_points);
        colors = colors.concat(_colors);
        draw_colors = new Float32Array(colors);

        // Load colors into the GPU and associate shader variables
        loadColors(draw_colors);

        // draw our squares
        for (i = 0; i < num_squares; ++i)
        {
            gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
        }
    });

    // draw our preview squares
    canvas.addEventListener("mousemove", function(event) {
        if (clicked)
        {

            // fetch corner point
            reg_points[2] = normValue(event.clientX, 0, canvas.width, -1, 1);
            reg_points[3] = normValue(event.clientY, 0, canvas.height, -1, 1);

            // create new vertex array
            vertices = draw_points.concat(makeSquare(reg_points));
            console.log(vertices.length)
            vertices = new Float32Array(vertices);

            draw_colors = new Float32Array(colors.concat(_colors));

            // Load colors into the GPU and associate shader variables
            loadColors(draw_colors);

            // Load positions into the GPU and associate shader variables
            loadPos(vertices);

            // draw all squares...
            for (i = 0; i < num_squares; ++i)
            {
                gl.drawArrays(gl.TRIANGLE_FAN, i * 4, 4);
            }
            // ... as well as our preview square!
            gl.drawArrays(gl.LINE_LOOP, num_squares * 4, 4);
        }
    });

    // configure viewport
    gl.viewport(0, 0, canvas.width, canvas.height);

    // set background/default color
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // init shader program and bind it
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);

    // Load positions into the GPU and associate shader variables
    //loadPos(vertices);
};

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
 * return an array of 8 values, corresponding to the
 * coordinates of 4 points (which make a square),
 * calculated from two corner points (passed in the form of
 * a 4-element array)
 */
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
