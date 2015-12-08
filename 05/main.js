// our webgl context
var gl;

// our program
var program;

// our canvas
var canvas;

// vertices that make up the grid
var grid_vertices;

// size of our grid
var grid_size = 8;

// vertices that make up the boxes
var box_vertices = new Float32Array([0, 0, 0, 0, 0, 0, 0, 0]);
var box_size;

window.onload = function init()
{
    // Get canvas and setup webGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // get our box size
    box_size = canvas.width / grid_size;

    // populate our grid vertex array
    grid_vertices = new Float32Array(makeGrid((grid_size)));

    // Configure viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Init shader program and bind it
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    loadStuff();

    window.addEventListener("mousedown", function(event) {
        var temp = getSquare(
            normValue(event.clientX, 10, 522, -1, 1),
            normValue(event.clientY, 10, 522, 1, -1)
        );
        temp = new Float32Array(temp);
        box_vertices = temp;
        loadStuff();
        render();
    });

    // render everything for the first time
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINES, 0, (grid_size - 1) * 4);

    var mybuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mybuffer);
    gl.bufferData(gl.ARRAY_BUFFER, box_vertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
 * Load colors into the GPU and associate shader variables.
 * Load positions into the GPU and associate shader variables.
 */
function loadStuff()
{
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, grid_vertices, gl.STATIC_DRAW);

    // not needed; we statically color everything in our fragment shader,
    // which makes things a bit simpler
    //var vColor = gl.getAttribLocation(program, "vColor");
    //gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, PAC_RESOLUTION * 2 * 4);
    //gl.enableVertexAttribArray(vColor);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

/*
 * Create and populate an array with vertices;
 * @return Float32Array
 */
function makeGrid()
{
    var grid = [];

    for (var i = 1; i < grid_size; i++)
    {
        var temp = normValue(i * box_size, 0, canvas.width, -1.0, 1.0);
        grid.push(temp);
        grid.push(-1.0);
        grid.push(temp);
        grid.push(1.0);
    }
    
    for (var i = 1; i < grid_size; i++)
    {
        var temp = normValue(i * box_size, 0, canvas.height, -1.0, 1.0);
        grid.push(-1.0);
        grid.push(temp);
        grid.push(1.0);
        grid.push(temp);
    }
    return grid;
}

/*
 * Get a square in our grid based on mouse coordinate;
 * i.e. input one point and get the square in which that point is located.
 */
function getSquare(x, y)
{
    var left_bound;
    var right_bound;
    var top_bound;
    var bottom_bound;

    for (var i = 0; i < grid_vertices.length / 2; i += 4)
    {
        if (grid_vertices[i] <= x && Math.abs(grid_vertices[i] - x) < box_size)
        {
            left_bound = grid_vertices[i];
        }
        else if (grid_vertices[i] > x && Math.abs(grid_vertices[i] - x) < box_size)
        {
            right_bound = grid_vertices[i];
        }

        if (left_bound != undefined && right_bound != undefined)
            break;
    }

    if (left_bound == undefined)
        left_bound = -1.0;

    if (right_bound == undefined)
        right_bound = 1.0;

    if (x < 0.0 && left_bound > 0.0)
        left_bound *= -1;

    if (x < 0.0 && right_bound > 0.0)
        right_bound *= -1;

    for (var i = grid_vertices.length / 2 + 1; i < grid_vertices.length; i += 4)
    {
        if (grid_vertices[i] > y && Math.abs(grid_vertices[i] - y) < box_size)
        {
            top_bound = grid_vertices[i];
        }
        else if (grid_vertices[i] <= y && Math.abs(grid_vertices[i] - y) < box_size)
        {
            bottom_bound = grid_vertices[i];
        }

        if (bottom_bound != undefined && top_bound != undefined)
            break;
    }

    if (top_bound == undefined)
        top_bound = 1.0;

    if (bottom_bound == undefined)
        bottom_bound = -1.0;

    if (y < 0.0 && top_bound > 0.0)
        top_bound *= -1;

    if (y < 0.0 && bottom_bound > 0.0)
        bottom_bound *= -1;

    var res = [left_bound, top_bound,
               right_bound, top_bound,
               left_bound, bottom_bound,
               right_bound, bottom_bound]

    return res;
}
