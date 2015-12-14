var gl;
var canvas;

var vertices;
var colors;

var colorBuffer;
var positionBuffer;

var modelMatrixLoc;
var modelMatrix;

var viewMatrixLoc;
var viewMatrix;

var projectionMatrixLoc;
var projectionMatrix;

window.onload = function init()
{
    // Get canvas and setup webGL
    
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    // Specify position and color of the vertices
    
                                 // Front
    vertices = new Float32Array([-0.5, -0.5, 0.5,
                                 0.5, -0.5, 0.5,
                                 0.5, 0.5, 0.5,
                                 
                                 0.5, 0.5, 0.5,
                                 -0.5, 0.5 ,0.5,
                                 -0.5, -0.5, 0.5,
                                 
                                 // Right
                                 0.5, 0.5, 0.5,
                                 0.5, -0.5, 0.5,
                                 0.5, -0.5, -0.5,
                                 
                                 0.5, -0.5, -0.5,
                                 0.5, 0.5, -0.5,
                                 0.5, 0.5, 0.5,
                                 
                                 // Back
                                 -0.5, -0.5, -0.5,
                                 0.5, -0.5, -0.5,
                                 0.5, 0.5, -0.5,
                                 
                                 0.5, 0.5, -0.5,
                                 -0.5, 0.5 ,-0.5,
                                 -0.5, -0.5, -0.5,
                                 
                                 // Left
                                 -0.5, 0.5, 0.5,
                                 -0.5, -0.5, 0.5,
                                 -0.5, -0.5, -0.5,
                                 
                                 -0.5, -0.5, -0.5,
                                 -0.5, 0.5, -0.5,
                                 -0.5, 0.5, 0.5,
                                 
                                 // Bottom
                                 -0.5, -0.5, 0.5,
                                 0.5, -0.5, 0.5,
                                 0.5, -0.5, -0.5,
                                 
                                 0.5, -0.5, -0.5,
                                 -0.5, -0.5 , -0.5,
                                 -0.5, -0.5, 0.5,
                                 
                                 // Top
                                 -0.5, 0.5, 0.5,
                                 0.5, 0.5, 0.5,
                                 0.5, 0.5, -0.5,
                                 
                                 0.5, 0.5, -0.5,
                                 -0.5, 0.5 , -0.5,
                                 -0.5, 0.5, 0.5
                                 ]);
                                        
                                // Front
    colors = new Float32Array([1, 0, 0, 1, 
                               1, 0, 0, 1,
                               1, 0, 0, 1,
                               1, 0, 0, 1,
                               1, 0, 0, 1,
                               1, 0, 0, 1,
                               
                               // Right
                               0, 1, 0, 1, 
                               0, 1, 0, 1,
                               0, 1, 0, 1,
                               0, 1, 0, 1,
                               0, 1, 0, 1,
                               0, 1, 0, 1,
                               
                               // Back
                               0, 0, 1, 1, 
                               0, 0, 1, 1,
                               0, 0, 1, 1,
                               0, 0, 1, 1,
                               0, 0, 1, 1,
                               0, 0, 1, 1,
                               
                               // Left
                               1, 1, 0, 1, 
                               1, 1, 0, 1,
                               1, 1, 0, 1,
                               1, 1, 0, 1,
                               1, 1, 0, 1,
                               1, 1, 0, 1,
                               
                               // Bottom
                               1, 0, 1, 1, 
                               1, 0, 1, 1,
                               1, 0, 1, 1,
                               1, 0, 1, 1,
                               1, 0, 1, 1,
                               1, 0, 1, 1,
                               
                               // Top
                               0, 1, 1, 1, 
                               0, 1, 1, 1,
                               0, 1, 1, 1,
                               0, 1, 1, 1,
                               0, 1, 1, 1,
                               0, 1, 1, 1
                               ]);

    // Configure viewport

    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(1.0,1.0,1.0,1.0);

    // Init shader program and bind it

    var program = initShaders(gl, "vertex-shader", "fragment-shader");

    gl.useProgram(program);
    
    // Load colors into the GPU and associate shader variables
    
    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    
    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    // Load positions into the GPU and associate shader variables

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // get locations of matrices
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    // Set and load modelMatrix
    modelMatrix = mat4.create();
    gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);

    // Set and load viewMatrix
    viewMatrix = mat4.create();
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    // Set and load projectionMatrix
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 0.78, canvas.width/canvas.height, 0.00001, 256.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

    // set some manipulation vectors
    // rotation vector
    var rotvec = vec3.create();
    vec3.set(rotvec, 1, 1, 1);

    var camera_pos = vec3.create();
    var up = vec3.create();
    var look_dir = vec3.create();
    vec3.set(camera_pos, 0.0, 0.0, -3.0);
    vec3.set(up, 0.0, 1.0, 0.0);
    vec3.set(look_dir, 0.0, 0.0, 1.0);

    var eye = vec3.create();
    vec3.add(eye, camera_pos, look_dir);

    mat4.lookAt(viewMatrix, eye, look_dir, up);
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    var zoominvec = vec3.create();
    vec3.set(zoominvec, 1.5, 1.5, 1.5);
    var zoomoutvec = vec3.create();
    vec3.set(zoomoutvec, 0.9, 0.9, 0.9);

    var transvec = vec3.create();

    function rotate()
    {
        mat4.rotate(modelMatrix, modelMatrix, 0.01, rotvec);
        gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);
    }

    function goforward()
    {
        var temp = vec3.create();
        vec3.scale(temp, look_dir, 0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);

        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }

    function gobackwards()
    {
        var temp = vec3.create();
        vec3.scale(temp, look_dir, -0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);

        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }

    function goright()
    {
        var temp = vec3.create();
        vec3.scale(temp, camera_right(), -0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }
    
    function goleft()
    {
        var temp = vec3.create();
        vec3.scale(temp, camera_right(), 0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }

    function camera_right()
    {
        var temp = vec3.create();
        vec3.cross(temp, up, look_dir);
        vec3.normalize(temp, temp);
        return temp;
    }

    window.addEventListener("keydown", function(event) {
        switch(event.keyCode)
        {
            case 87: // 'w'
                goforward();
                break;
            case 83: // 's'
                gobackwards();
                break;
            case 65: // 'a'
                goleft();
                break;
            case 68: // 'd'
                goright();
                break;
        }
    });

    var last_pos = 256;

    canvas.onclick = function() {
        canvas.requestPointerLock();
    }
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

    function lockChangeAlert()
    {
        if (document.pointerLockElement === canvas ||
            document.mozPointerLockElement === canvas ||
            document.webkitPointerLockElement === canvas)
           {
               document.addEventListener("mousemove", look_around, false);
           } else {
               document.removeEventListener("mousemove", look_around, false);
           }
    }

    function look_around(e)
    {
        var posX = e.movementX;
        var offset = -0.0001 * (posX - last_pos);
        vec3.rotateY(look_dir, look_dir, camera_pos, offset);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
        last_pos = posX;
        console.log(look_dir);
    }
    setInterval(rotate, 50);
    render();
};


function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/3);
    requestAnimFrame(render);
}

function normValue(value, valueMin, valueMax, resultMin, resultMax)
{
    temp = (value - valueMin) / (valueMax - valueMin);
    return temp * (resultMax - resultMin) + resultMin;
}
