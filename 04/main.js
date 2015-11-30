// our webgl context
var gl;

// our program
var program;

// our canvas
var canvas;

// our vertices
var vertices;

// our translation matrix's location
var transLoc;

// our rotation matrix's location
var rotLoc;

// number of points to build our circle with
var PAC_RESOLUTION = 36;

// radius of our circle
var PAC_RADIUS = 0.1;

// size of pacman's mouth (in vertices)
var MOUTH_SIZE = 6;

// rotation angle
var alpha = 0.0;

// alpha's threshold shall be 6.3, as that is equivalent to alpha being 0.0;
// it would be a rotation of 360 degrees. this is probably for good reasons, but we found out by 'testing' empirically...
var alpha_threshold = 6.3;

// the point pacman is looking at
var direction = [1.0, 0.0]

// pacman's position
var pac_pos = [0.0, 0.0];

// define keycodes for arrow keys
var left = 37;
var up = 38;
var right = 39;
var down = 40;

// initialize our translation matrix as the identity matrix
var transmat = [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
];

// initialize our rotation matrix as the identity matrix
var rotmat = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);

window.onload = function init()
{
    // Get canvas and setup webGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    // populate our vertex array
    vertices = makePacman();

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

    // get the location of our translation matrix in the shader
	transLoc = gl.getUniformLocation(program, "translationMatrix");

    // get the location of our rotation matrix in the shader
	rotLoc = gl.getUniformLocation(program, "rotationMatrix");
    loadStuff();

    // send the rotation matrix to our vertex shader
	gl.uniformMatrix4fv(
		rotLoc,
		false,
		rotmat
	);

    // send the translation matrix to our vertex shader
	gl.uniformMatrix4fv(
		transLoc,
		false,
		new Float32Array(transmat)
	);

    var alphaPos = gl.getUniformLocation(program, "alpha");
    gl.uniform1f(alphaPos, false, alpha);

    // add an event listener to listen for keypresses
    window.addEventListener("keydown", function(event) {
        switch(event.keyCode)
        {
            case left:
                turnLeft();
                break;
            case right:
                turnRight();
                break;
            case up:
                goForward();
                break;
            //case down:
                //goBackward();
                //break;
        }
    });

    // render everything for the first time
    render();
};

function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, PAC_RESOLUTION - MOUTH_SIZE);
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

    // not needed; we statically color everything yellow in our fragment shader,
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
 * first vertex is the origin (0, 0), and a few vertices of the would-be circle
 * are ignored to make a pacman-shape
 * @return Float32Array
 */
function makePacman()
{
    // index to insert points at; initialized as 0
    var idx = 2;

    // count our number of iterations
    var count = 0;

    // array to hold all circle coordinates
    var circle = [0.0, 0.0];

    // angle of points; updated iteratively
    var theta = 0;

    // step between angles; depends on circle's resolution
    var step = (2 * Math.PI) / (PAC_RESOLUTION - 2);

    // create all the points in a loop
    while (true)
    {
        count++;

        // skip the first few vertices of our would-be circle ...
        if (count <= MOUTH_SIZE/2)
        {
            theta += step;
            continue;
        }

        // ... as well as the last few!
        // this creates a vertex-free area in the shape of pacman's mouth!
        if (circle.length == (PAC_RESOLUTION * 2) - MOUTH_SIZE)
        {
            break;
        }

        // x coordinate
        circle[idx++] = PAC_RADIUS * Math.cos(theta);

        // y coordinate
        circle[idx++] = PAC_RADIUS * Math.sin(theta);

        // update theta
        theta += step;
    }

    return new Float32Array(circle);
}

/*
 * turn pacman to the left (i.e. counter-clockwise)
 */
function turnLeft()
{
    // increase our rotation angle
    alpha += 0.1;

    // this query goes wrong because of float inaccuracies
    //if (alpha == alpha_threshold)
    // we have to use this clumsy formula;
    // since we only ever increment by 0.1, the would-be inaccuracies resulting
    // from the 0.05 magic number can be ignored.
    if (alpha >= alpha_threshold -0.05 && alpha < alpha_threshold + 0.05)
        alpha = 0.0;

    // create a new rotation matrix
    rotmat = new Float32Array([
        Math.cos(alpha), Math.sin(alpha), 0, 0,
        -Math.sin(alpha), Math.cos(alpha), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

    // send the rotation matrix to our vertex shader
	gl.uniformMatrix4fv(
		rotLoc,
		false,
		rotmat
	);

    var alphaPos = gl.getUniformLocation(program, "alpha");
    gl.uniform1f(alphaPos, false, alpha);

    // re-render our scene
    render();
}

/*
 * turn pacman to the right (i.e. clockwise)
 */
function turnRight()
{
    // decrease our angle
    alpha -= 0.1;
    // if alpha becomes negative, we wrap it around to 6.2,
    // so it always stays within the interval [0.0, 6.3]
    if (alpha < 0.0)
        alpha = alpha_threshold - 0.1;

    rotmat = new Float32Array([
        Math.cos(alpha), Math.sin(alpha), 0, 0,
        -Math.sin(alpha), Math.cos(alpha), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);

	gl.uniformMatrix4fv(
		rotLoc,
		false,
		rotmat
	);

    var alphaPos = gl.getUniformLocation(program, "alpha");
    gl.uniform1f(alphaPos, false, alpha);

    render();
}

/*
 * move pacman forward (i.e. the way the mouth is facing)
 */
function goForward()
{
    direction[0] = PAC_RADIUS * Math.cos(alpha);
    direction[1] = PAC_RADIUS * Math.sin(alpha);

    // relevant indices in transmat array: 12 for x and 13 for y
    pac_pos[0] += 0.15 * direction[0];
    pac_pos[1] += 0.15 * direction[1];

    if (pac_pos[0] < -1.07)
        pac_pos[0] = 1.07;

    if (pac_pos[0] > 1.07)
        pac_pos[0] = -1.07;

    if (pac_pos[1] < -1.07)
        pac_pos[1] = 1.07;

    if (pac_pos[1] > 1.07)
        pac_pos[1] = -1.07;

    transmat[12] = pac_pos[0];
    transmat[13] = pac_pos[1];

    updateTransMat();

    render();
}

/*
 * move pacman backward (i.e. the opposite way the mouth is facing)
 * UNNEEDED!
 */
//function goBackward()
//{

//}

/*
 * update the translation matrix in the shader from the local array
 */
function updateTransMat()
{
    var tempmat = new Float32Array(transmat);

    gl.uniformMatrix4fv(
        transLoc,
        false,
        tempmat
    );
}

/*
 * calculate the position of pacman's eye, and return it as an array with two elements
 * @return Float32Array
 */
function eyePosition()
{
    return new Float32Array([0.05 * Math.cos(alpha), 0.05 * Math.sin(alpha)]);
}
