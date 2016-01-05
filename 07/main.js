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

var palm_mesh;
var palm_obj;
var palm_mm;

var island_mesh;
var island_obj;
var island_mm;

var water_mesh;
var water_obj;
var water_mm;

var program;

window.onload = function init()
{
    // Get canvas and setup webGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    // Configure viewport
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(1.0,1.0,1.0,1.0);

    // Init shader program and bind it
    program = initShaders(gl, "vertex-shader", "fragment-shader");

    // Create palm tree
    palm_obj = document.getElementById("palm.obj").innerHTML;
    palm_mesh = new OBJ.Mesh(palm_obj);
    OBJ.initMeshBuffers(gl, palm_mesh);
    palm_mm = mat4.create();
    mat4.scale(palm_mm, palm_mm, vec3.fromValues(0.4, 0.4, 0.4));
    mat4.translate(palm_mm, palm_mm, vec3.fromValues(0, 1.6, 0));

    // Create water (simple plane)
    water_obj = document.getElementById("water.obj").innerHTML;
    water_mesh = new OBJ.Mesh(water_obj);
    OBJ.initMeshBuffers(gl, water_mesh);
    water_mm = mat4.create();
    mat4.scale(water_mm, water_mm, vec3.fromValues(5, 1, 5));
    mat4.translate(water_mm, water_mm, vec3.fromValues(0, -1, 0));

    // Create the island
    island_obj = document.getElementById("island.obj").innerHTML;
    island_mesh = new OBJ.Mesh(island_obj);
    OBJ.initMeshBuffers(gl, island_mesh);
    island_mm = mat4.create();
    mat4.translate(island_mm, island_mm, vec3.fromValues(0, -0.8, 0));

    gl.useProgram(program);
    
    // get locations of matrices
    modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    
    // Set and load modelMatrix
    //modelMatrix = mat4.create();
    //gl.uniformMatrix4fv(modelMatrixLoc, false, modelMatrix);

    // Set and load viewMatrix
    viewMatrix = mat4.create();
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    // Set and load projectionMatrix
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, 0.78, canvas.width/canvas.height, 0.01, 256.0);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

    // set some manipulation vectors

    // position of our camera
    var camera_pos = vec3.create();
    vec3.set(camera_pos, 0.0, 0.0, -3.0);

    // which direction is up? Y-Axis!
    var up = vec3.create();
    vec3.set(up, 0.0, 1.0, 0.0);

    // the direction vector of the direction in which we are looking
    var look_dir = vec3.create();
    vec3.set(look_dir, 0.0, 0.0, 1.0);

    // 'eye' is the sum of the camera position and the look-direction
    var eye = vec3.create();
    vec3.add(eye, camera_pos, look_dir);

    // look at the sum of camera and look direction
    mat4.lookAt(viewMatrix, camera_pos, eye, up);
    gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    // function called upon 'W' key-press
    function goforward()
    {
        var temp = vec3.create();
        // scale the look direction by 0.1 and add it to the camera position,
        // thus moving the camera position forward
        vec3.scale(temp, look_dir, 0.1);
        vec3.add(camera_pos, camera_pos, temp);

        // update 'eye' variable
        vec3.add(eye, camera_pos, look_dir);
        // update what we're looking at
        mat4.lookAt(viewMatrix, camera_pos, eye, up);

        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }

    // function called upon 'A' key-press
    function gobackwards()
    {
        // same as goforward(), but with a negative scalar
        var temp = vec3.create();
        vec3.scale(temp, look_dir, -0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);

        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }

    // function called upon 'D' key-press
    function goright()
    {
        // just like in goforward and gobackwards, we scale a vector
        // and add it to the camera's position
        // but this time, the vector we use is a direction vector orthogonal
        // to our look direction, computed in camera_right()
        var temp = vec3.create();
        vec3.scale(temp, camera_right(), -0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }
    
    // function called upon 'S' key-press
    function goleft()
    {
        // same as goright(), but inverted sign on the scalar
        var temp = vec3.create();
        vec3.scale(temp, camera_right(), 0.1);
        vec3.add(camera_pos, camera_pos, temp);

        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }

    // compute a vector that points exactly right of the camera
    // i.e. is orthogonal to our look_dir vector
    function camera_right()
    {
        var temp = vec3.create();
        // we use the cross-product for that
        vec3.cross(temp, up, look_dir);
        vec3.normalize(temp, temp);
        return temp;
    }

    // key-press event listener
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

    // when the canvas is clicked, lock the mouse cursor in
    canvas.onclick = function() {
        canvas.requestPointerLock();
    }

    // add event listeners to see if the cursor lock state changes
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
    document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
    document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

    // handle changing states of cursor locking
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

    // just a null vector, i.e. [0, 0, 0]
    var null_vec = vec3.create();

    // our function that handles mouse-controlled camera-movement
    function look_around(e)
    {
        // get relative mouse position (x-coordinate only for the time being)
        var posX = e.movementX;

        // compute and offset to move the camera by
        // the -0.005 is just a number that makes for good speed
        var offsetX = -0.005 * posX;

        // rotate our look direction around the Y-axis
        vec3.rotateY(look_dir, look_dir, null_vec, offsetX);

        // update everything
        vec3.add(eye, camera_pos, look_dir);
        mat4.lookAt(viewMatrix, camera_pos, eye, up);
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
    }
    render();
};


function render()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var colorLoc = gl.getUniformLocation(program, "objColor");
    var iswaterLoc = gl.getUniformLocation(program, "isWater");
    gl.uniform1i(iswaterLoc, 0);

	// Set attributes
	var palm_vPosition = gl.getAttribLocation(program, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, palm_mesh.vertexBuffer);
	gl.vertexAttribPointer(palm_vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(palm_vPosition);

    // Set uniforms
	gl.uniformMatrix4fv(modelMatrixLoc, false, palm_mm);
	gl.uniform4fv(colorLoc, vec4.fromValues(0,0.7,0,1));

	// Draw
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, palm_mesh.indexBuffer);
	gl.drawElements(gl.TRIANGLES, palm_mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    // Set attributes
    var island_vPosition = gl.getAttribLocation(program, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, island_mesh.vertexBuffer);
    gl.vertexAttribPointer(island_vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(island_vPosition);

    // Set uniforms
    gl.uniformMatrix4fv(modelMatrixLoc, false, island_mm);
    gl.uniform4fv(colorLoc, vec4.fromValues(1, 0.5, 0.5, 1));

    // Draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, island_mesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, island_mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.uniform1i(iswaterLoc, 1);

    // Set attributes
    var water_vPosition = gl.getAttribLocation(program, "vPosition");
    gl.bindBuffer(gl.ARRAY_BUFFER, water_mesh.vertexBuffer);
    gl.vertexAttribPointer(water_vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(water_vPosition);

    // Set uniforms
    gl.uniformMatrix4fv(modelMatrixLoc, false, water_mm);
    gl.uniform4fv(colorLoc, vec4.fromValues(0.1, 0.1, 0.9, 0.8));

    // Draw
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, water_mesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, water_mesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    requestAnimFrame(render);
}
