// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;
    void main() {
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main() {
        if(u_whichTexture == -2){
            gl_FragColor = u_FragColor;
        }
        else if(u_whichTexture == -1){
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        }
        else if(u_whichTexture == 0){
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        }
        else if(u_whichTexture == 1){
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        }
        else{
            gl_FragColor = vec4(1.0, 0.2, 0.2, 1.0);
        }
    }`;

let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0; // sky
let u_Sampler1; // dirt
let u_whichTexture;

function setupWebGL() {
    // Retrieve canvas element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return false;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedCircleSegments = 5;

let g_globalAngleH = 0;
let g_globalAngleV = 0;

// left arm
let g_upperArmLAngle = 0;
let g_upperArmLAnimation = false;
let g_clawInnerLAngle = 0;
let g_clawInnerLAnimation = false;
let g_clawOuterLAngle = 0;
let g_clawOuterLAnimation = false;

// left leg 1
let g_upperLegL1Angle = 0;
let g_upperLegL1Animation = false;
let g_lowerLegL1Angle = 0;
let g_lowerLegL1Animation = false;

// left leg 2
let g_upperLegL2Angle = 0;
let g_upperLegL2Animation = false;
let g_lowerLegL2Angle = 0;
let g_lowerLegL2Animation = false;

// left leg 3
let g_upperLegL3Angle = 0;
let g_upperLegL3Animation = false;
let g_lowerLegL3Angle = 0;
let g_lowerLegL3Animation = false;

// right arm
let g_upperArmRAngle = 0;
let g_upperArmRAnimation = false;
let g_clawInnerRAngle = 0;
let g_clawInnerRAnimation = false;
let g_clawOuterRAngle = 0;
let g_clawOuterRAnimation = false;

// right leg 1
let g_upperLegR1Angle = 0;
let g_upperLegR1Animation = false;
let g_lowerLegR1Angle = 0;
let g_lowerLegR1Animation = false;

// right leg 2
let g_upperLegR2Angle = 0;
let g_upperLegR2Animation = false;
let g_lowerLegR2Angle = 0;
let g_lowerLegR2Animation = false;

// right leg 3
let g_upperLegR3Angle = 0;
let g_upperLegR3Animation = false;
let g_lowerLegR3Angle = 0;
let g_lowerLegR3Animation = false;

let g_flipStartValue = 0;
let g_isDoingAFlip = false;

let mouseX = 0;
let mouseY = 0;

function addActionsForHtmlUI() {
    document.getElementById('angleHSlide').addEventListener('input', function () { g_globalAngleH = this.value; renderAllShapes(); });
    document.getElementById('angleVSlide').addEventListener('input', function () { g_globalAngleV = this.value; renderAllShapes(); });

    document.addEventListener('keydown', function (event) {
        if (event.key === "w" || event.key === "W") {
            g_globalAngleV += 1;
            console.log("w");
        }
        if (event.key === "s" || event.key === "S") {
            g_globalAngleV -= 1;
            console.log("s");
        }
        if (event.key === "d" || event.key === "D") {
            g_globalAngleH += 1;
            console.log("d");
        }
        if (event.key === "a" || event.key === "A") {
            g_globalAngleH -= 1;
            console.log("a");
        }
    });
}

function main() {

    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHtmlUI();

    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

function initTextures() {
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function () { sendImageToTEXTURE0(image); };
    // Tell the browser to load an image
    image.src = '../resources/sky.jpg';

    var image1 = new Image();
    if(!image1){
        console.log('Failed to create the image object');
        return false;
    }

    image1.onload = function () { sendImageToTEXTURE1(image1); };
    image1.src = '../resources/dirt.jpg';

    return true;
}

function sendImageToTEXTURE0(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

function sendImageToTEXTURE1(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler1, 1);

    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}

var g_shapesList = [];
var g_previewShape;

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    }
    else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    }
    else {
        point = new Circle();
        point.segments = g_selectedCircleSegments;
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    renderAllShapes();
}

function onShiftKey(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    }
    else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    }
    else {
        point = new Circle();
        point.segments = g_selectedCircleSegments;
    }
    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_previewShape = point;

    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function renderAllShapes() {
    let projMat = new Matrix4();
    projMat.setPerspective(90, canvas.width / canvas.height, 0.1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    let viewMat = new Matrix4();
    viewMat.setLookAt(10.0, 1.0, 10.0, 10.0, 0.0, 20.0, 0.0, 1.0, 0.0); // (eye, at, up)
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleH, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleV, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let redColor = [1.0, 0.0, 0.0, 1.0];

    // sky
    let sky = new Cube();
    sky.textureNum = 0;
    sky.matrix.setTranslate(0.0, 7, 0.0);
    sky.matrix.scale(50.0, 0.1, 50.0);
    sky.render();

    // ground
    let ground = new Cube();
    ground.textureNum = 1;
    ground.matrix.setTranslate(0.0, -0.5, 0.0);
    ground.matrix.scale(50.0, 0.1, 50.0);
    ground.render();

    // cube1 - color
    let cube1 = new Cube();
    cube1.color = [1.0, 0.0, 0.0, 1.0];
    cube1.textureNum = -2;
    cube1.matrix.setTranslate(12.5, 0.0, 15.0);
    cube1.matrix.scale(1.0, 1.0, 1.0);
    cube1.render();

    // cube2 - uv
    let cube2 = new Cube();
    cube2.color = [1.0, 0.0, 0.0, 1.0];
    cube2.textureNum = -1;
    cube2.matrix.setTranslate(10.0, 0.0, 15.0);
    cube2.matrix.scale(1.0, 1.0, 1.0);
    cube2.render();

    // cube3 - dirt texture
    let cube3 = new Cube();
    cube3.color = [1.0, 0.0, 0.0, 1.0];
    cube3.textureNum = 1;
    cube3.matrix.setTranslate(7.5, 0.0, 15.0);
    cube3.matrix.scale(1.0, 1.0, 1.0);
    cube3.render();

    

    // // ---------- left arm ----------

    // // left arm
    // let upperArmL = new Cube();
    // upperArmL.color = redColor;
    // upperArmL.matrix.translate(0.2, 0.1, 0.0);
    // upperArmL.matrix.rotate(60, 1, 0, 0);
    // upperArmL.matrix.rotate(240, 0, 0, 1);
    // upperArmL.matrix.rotate(g_upperArmLAngle, 0, 0, 1);
    // let lowerArmLMat = new Matrix4(upperArmL.matrix);
    // upperArmL.matrix.scale(0.1, 0.3, 0.1);
    // upperArmL.render();

    // // left claw center
    // let lowerArmL = new Cube();
    // lowerArmL.matrix = lowerArmLMat;
    // lowerArmL.color = redColor;
    // lowerArmL.matrix.translate(-0.05, 0.3, -0.05);
    // let clawInnerLMat = new Matrix4(lowerArmL.matrix);
    // let clawOuterLMat = new Matrix4(lowerArmL.matrix);
    // lowerArmL.matrix.scale(0.2, 0.2, 0.2);
    // lowerArmL.render();

    // // left claw inner
    // let clawInnerL = new Cube();
    // clawInnerL.matrix = clawInnerLMat;
    // clawInnerL.color = redColor;
    // clawInnerL.matrix.translate(0.05, 0.2, 0.0);
    // clawInnerL.matrix.rotate(g_clawInnerLAngle, 1, 0, 0);
    // clawInnerL.matrix.scale(0.1, 0.2, 0.1);
    // clawInnerL.render();

    // // left claw outer
    // let clawOuterL = new Cube();
    // clawOuterL.matrix = clawOuterLMat;
    // clawOuterL.color = redColor;
    // clawOuterL.matrix.translate(0.05, 0.2, 0.1);
    // clawOuterL.matrix.rotate(g_clawOuterLAngle, 1, 0, 0);
    // clawOuterL.matrix.scale(0.1, 0.2, 0.1);
    // clawOuterL.render();

    // // ---------- right arm ----------

    // // right arm
    // let upperArmR = new Cube();
    // upperArmR.color = redColor;
    // upperArmR.matrix.translate(-0.15, 0.1, 0.0);
    // upperArmR.matrix.rotate(80, 1, 0, 0);
    // upperArmR.matrix.rotate(240, 0, 0, 1);
    // upperArmR.matrix.rotate(270, 0, 0, 1);
    // upperArmR.matrix.rotate(g_upperArmRAngle, 0, 0, 1);
    // let lowerArmRMat = new Matrix4(upperArmR.matrix);
    // upperArmR.matrix.scale(0.1, 0.3, 0.1);
    // upperArmR.render();

    // // right claw center
    // let lowerArmR = new Cube();
    // lowerArmR.matrix = lowerArmRMat;
    // lowerArmR.color = redColor;
    // lowerArmR.matrix.translate(-0.05, 0.3, -0.05);
    // let clawInnerRMat = new Matrix4(lowerArmR.matrix);
    // let clawOuterRMat = new Matrix4(lowerArmR.matrix);
    // lowerArmR.matrix.scale(0.25, 0.25, 0.25);
    // lowerArmR.render();

    // // right claw inner
    // let clawInnerR = new Cube();
    // clawInnerR.matrix = clawInnerRMat;
    // clawInnerR.color = redColor;
    // clawInnerR.matrix.translate(0.05, 0.2, 0.025);
    // clawInnerR.matrix.rotate(g_clawInnerRAngle, 1, 0, 0);
    // clawInnerR.matrix.scale(0.1, 0.3, 0.1);
    // clawInnerR.render();

    // // right claw outer
    // let clawOuterR = new Cube();
    // clawOuterR.matrix = clawOuterRMat;
    // clawOuterR.color = redColor;
    // clawOuterR.matrix.translate(0.05, 0.2, 0.125);
    // clawOuterR.matrix.rotate(g_clawOuterRAngle, 1, 0, 0);
    // clawOuterR.matrix.scale(0.1, 0.3, 0.1);
    // clawOuterR.render();

    // // ---------- left legs ----------

    // // left leg 1
    // let upperLegL1 = new Cube();
    // upperLegL1.color = redColor;
    // upperLegL1.matrix.translate(0.2, 0.1, 0.1);
    // upperLegL1.matrix.rotate(240, 0, 0, 1);
    // upperLegL1.matrix.rotate(g_upperLegL1Angle, 0, 0, 1);
    // let lowerLegL1Mat = new Matrix4(upperLegL1.matrix);
    // upperLegL1.matrix.scale(0.1, 0.5, 0.1);
    // upperLegL1.render();

    // let lowerLegL1 = new Cube();
    // lowerLegL1.matrix = lowerLegL1Mat;
    // lowerLegL1.color = redColor;
    // lowerLegL1.matrix.translate(0.01, 0.4, 0.0);
    // lowerLegL1.matrix.rotate(320, 0, 0, 1);
    // lowerLegL1.matrix.rotate(g_lowerLegL1Angle, 0, 0, 1);
    // lowerLegL1.matrix.scale(0.1, 0.5, 0.1);
    // lowerLegL1.render();

    // // left leg 2
    // let upperLegL2 = new Cube();
    // upperLegL2.color = redColor;
    // upperLegL2.matrix.translate(0.2, 0.1, 0.3);
    // upperLegL2.matrix.rotate(240, 0, 0, 1);
    // upperLegL2.matrix.rotate(g_upperLegL2Angle, 0, 0, 1);
    // let lowerLegL2Mat = new Matrix4(upperLegL2.matrix);
    // upperLegL2.matrix.scale(0.1, 0.5, 0.1);
    // upperLegL2.render();

    // let lowerLegL2 = new Cube();
    // lowerLegL2.matrix = lowerLegL2Mat;
    // lowerLegL2.color = redColor;
    // lowerLegL2.matrix.translate(0.01, 0.4, 0.0);
    // lowerLegL2.matrix.rotate(320, 0, 0, 1);
    // lowerLegL2.matrix.rotate(g_lowerLegL2Angle, 0, 0, 1);
    // lowerLegL2.matrix.scale(0.1, 0.5, 0.1);
    // lowerLegL2.render();

    // // left leg 3
    // let upperLegL3 = new Cube();
    // upperLegL3.color = redColor;
    // upperLegL3.matrix.translate(0.2, 0.1, 0.5);
    // upperLegL3.matrix.rotate(240, 0, 0, 1);
    // upperLegL3.matrix.rotate(g_upperLegL3Angle, 0, 0, 1);
    // let lowerLegL3Mat = new Matrix4(upperLegL3.matrix);
    // upperLegL3.matrix.scale(0.1, 0.5, 0.1);
    // upperLegL3.render();

    // let lowerLegL3 = new Cube();
    // lowerLegL3.matrix = lowerLegL3Mat;
    // lowerLegL3.color = redColor;
    // lowerLegL3.matrix.translate(0.01, 0.4, 0.0);
    // lowerLegL3.matrix.rotate(320, 0, 0, 1);
    // lowerLegL3.matrix.rotate(g_lowerLegL3Angle, 0, 0, 1);
    // lowerLegL3.matrix.scale(0.1, 0.5, 0.1);
    // lowerLegL3.render();

    // // ---------- right legs ----------

    // // right leg 1
    // let upperLegR1 = new Cube();
    // upperLegR1.color = redColor;
    // upperLegR1.matrix.translate(-0.2, 0.1, 0.2);
    // upperLegR1.matrix.rotate(180, 0, 1, 0); // mirror from left to right
    // upperLegR1.matrix.rotate(240, 0, 0, 1);
    // upperLegR1.matrix.rotate(g_upperLegR1Angle, 0, 0, 1);
    // let lowerLegR1Mat = new Matrix4(upperLegR1.matrix);
    // upperLegR1.matrix.scale(0.1, 0.5, 0.1);
    // upperLegR1.render();

    // let lowerLegR1 = new Cube();
    // lowerLegR1.matrix = lowerLegR1Mat;
    // lowerLegR1.color = redColor;
    // lowerLegR1.matrix.translate(0.01, 0.4, 0.0);
    // lowerLegR1.matrix.rotate(320, 0, 0, 1);
    // lowerLegR1.matrix.rotate(g_lowerLegR1Angle, 0, 0, 1);
    // lowerLegR1.matrix.scale(0.1, 0.5, 0.1);
    // lowerLegR1.render();

    // // right leg 2
    // let upperLegR2 = new Cube();
    // upperLegR2.color = redColor;
    // upperLegR2.matrix.translate(-0.2, 0.1, 0.4);
    // upperLegR2.matrix.rotate(180, 0, 1, 0); // mirror from left to right
    // upperLegR2.matrix.rotate(240, 0, 0, 1);
    // upperLegR2.matrix.rotate(g_upperLegR2Angle, 0, 0, 1);
    // let lowerLegR2Mat = new Matrix4(upperLegR2.matrix);
    // upperLegR2.matrix.scale(0.1, 0.5, 0.1);
    // upperLegR2.render();

    // let lowerLegR2 = new Cube();
    // lowerLegR2.matrix = lowerLegR2Mat;
    // lowerLegR2.color = redColor;
    // lowerLegR2.matrix.translate(0.01, 0.4, 0.0);
    // lowerLegR2.matrix.rotate(320, 0, 0, 1);
    // lowerLegR2.matrix.rotate(g_lowerLegR2Angle, 0, 0, 1);
    // lowerLegR2.matrix.scale(0.1, 0.5, 0.1);
    // lowerLegR2.render();

    // // right leg 3
    // let upperLegR3 = new Cube();
    // upperLegR3.color = redColor;
    // upperLegR3.matrix.translate(-0.2, 0.1, 0.6);
    // upperLegR3.matrix.rotate(180, 0, 1, 0); // mirror from left to right
    // upperLegR3.matrix.rotate(240, 0, 0, 1);
    // upperLegR3.matrix.rotate(g_upperLegR3Angle, 0, 0, 1);
    // let lowerLegR3Mat = new Matrix4(upperLegR3.matrix);
    // upperLegR3.matrix.scale(0.1, 0.5, 0.1);
    // upperLegR3.render();

    // let lowerLegR3 = new Cube();
    // lowerLegR3.matrix = lowerLegR3Mat;
    // lowerLegR3.color = redColor;
    // lowerLegR3.matrix.translate(0.01, 0.4, 0.0);
    // lowerLegR3.matrix.rotate(320, 0, 0, 1);
    // lowerLegR3.matrix.rotate(g_lowerLegR3Angle, 0, 0, 1);
    // lowerLegR3.matrix.scale(0.1, 0.5, 0.1);
    // lowerLegR3.render();
}

let g_startTime = performance.now() / 1000.0;
let g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderAllShapes();
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    // left arm
    if (g_upperArmLAnimation)
        g_upperArmLAngle = -20 * Math.sin(g_seconds);
    if (g_clawInnerLAnimation)
        g_clawInnerLAngle = 10 * Math.sin(g_seconds * 3) - 20;
    if (g_clawOuterLAnimation)
        g_clawOuterLAngle = -10 * Math.sin(g_seconds * 3) + 20;
    // left leg 1
    if (g_upperLegL1Animation)
        g_upperLegL1Angle = 20 * Math.sin(g_seconds * 3 + 2);
    if (g_lowerLegL1Animation)
        g_lowerLegL1Angle = 15 * Math.sin(g_seconds * 3 + 2);
    // left leg 2
    if (g_upperLegL2Animation)
        g_upperLegL2Angle = 20 * Math.sin(g_seconds * 3 + 4);
    if (g_lowerLegL2Animation)
        g_lowerLegL2Angle = 15 * Math.sin(g_seconds * 3 + 4);
    // left leg 3
    if (g_upperLegL3Animation)
        g_upperLegL3Angle = 20 * Math.sin(g_seconds * 3 + 6);
    if (g_lowerLegL3Animation)
        g_lowerLegL3Angle = 15 * Math.sin(g_seconds * 3 + 6);

    // right arm
    if (g_upperArmRAnimation)
        g_upperArmRAngle = -15 * Math.sin(g_seconds * 3);
    if (g_clawInnerRAnimation)
        g_clawInnerRAngle = 10 * Math.sin(g_seconds * 3) - 20;
    if (g_clawOuterRAnimation)
        g_clawOuterRAngle = -10 * Math.sin(g_seconds * 3) + 20;
    // right leg 1
    if (g_upperLegR1Animation)
        g_upperLegR1Angle = 20 * Math.sin(g_seconds * 3 + 3);
    if (g_lowerLegR1Animation)
        g_lowerLegR1Angle = 15 * Math.sin(g_seconds * 3 + 3);
    // right leg 2
    if (g_upperLegR2Animation)
        g_upperLegR2Angle = 20 * Math.sin(g_seconds * 3 + 5);
    if (g_lowerLegR2Animation)
        g_lowerLegR2Angle = 15 * Math.sin(g_seconds * 3 + 5);
    // right leg 3
    if (g_upperLegR3Animation)
        g_upperLegR3Angle = 20 * Math.sin(g_seconds * 3 + 7);
    if (g_lowerLegR3Animation)
        g_lowerLegR3Angle = 15 * Math.sin(g_seconds * 3 + 7);

    // flip
    if (g_isDoingAFlip) {
        g_globalAngleV += 1;
        if (g_globalAngleV >= g_flipStartValue + 360)
            g_isDoingAFlip = false;
    }
}
