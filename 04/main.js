// our webgl context
var gl;

// our program
var program;

// our canvas
var canvas;

// our vertices
var vertices;

// our matrix's location
var matrixLoc;

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
    vertices = new Float32Array([// vertices
                                     -0.1, -0.1, 
                                      0.0,  0.1, 
                                      0.1, -0.1,

                                     // colors
                                      0, 1, 1, 1,
                                      0, 0, 1, 1,
                                      1, 0, 1, 1,
                                      ]);

    // Configure viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Init shader program and bind it
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    /// get variable locations from shader
    radius_loc = gl.getUniformLocation(program, "radius");
    thickness_loc = gl.getUniformLocation(program, "thickness");
    brightness_loc = gl.getUniformLocation(program, "brightness");
    gl.useProgram(program);

	matrixLoc = gl.getUniformLocation(program, "rotationMatrix");
    loadStuff();

	var alpha = 0.2;
	var rotmat = new Float32Array([
		Math.cos(alpha), Math.sin(alpha), 0, 0,
		-Math.sin(alpha), Math.cos(alpha), 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	]);

	gl.uniformMatrix4fv(
		matrixLoc,
		false,
		rotmat
	);
    // add an event listener to listen for keypresses
    // we add it to the window because the canvas can't handle keypresses/
    // keydowns, as it can't be focused.
//    window.addEventListener("keydown", function(event) {
//        switch(event.keyCode)
//        {
//            case left:
//                decreaseRadius(5.0);
//                break;
//            case right:
//                increaseRadius(5.0);
//                break;
//            case up:
//                increaseBrightness(0.05);
//                break;
//            case down:
//                decreaseBrightness(0.05);
//                break;
//        }
//    });
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 3);
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
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 24);
    gl.enableVertexAttribArray(vColor);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}

/*
 * Increase radius by val up until a certain limit
 */
function increaseRadius(val)
{
    radius += val;
    if (radius > radius_max)
    {
        radius = radius_max;
    }
    gl.uniform1f(radius_loc, radius);
    //loadStuff();
    render();
}

/*
 * Decrease radius by val up until a certain limit
 */
function decreaseRadius(val)
{
    radius -= val;
    if (radius < radius_min)
    {
        radius = radius_min;
    }
    gl.uniform1f(radius_loc, radius);
    //loadStuff();
    render();
}

/*
 * Increase brightness by val up until a certain limit
 */
function increaseBrightness(val)
{
    brightness += val;
    if (brightness > brightness_max)
    {
        brightness = brightness_max;
    }
    gl.uniform1f(brightness_loc, brightness);
    //loadStuff();
    render();
}

/*
 * Decrease brightness by val up until a certain limit
 */
function decreaseBrightness(val)
{
    brightness -= val;
    if (brightness < brightness_min)
    {
        brightness = brightness_min;
    }
    gl.uniform1f(brightness_loc, brightness);
    //loadStuff();
    render();
}
