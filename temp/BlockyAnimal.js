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
    void main() {
        gl_FragColor = u_FragColor;
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
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
    document.getElementById('doAFlipButton').onclick = function () { g_flipStartValue = g_globalAngleV; g_isDoingAFlip = true; };

    // left arm
    document.getElementById('upperArmLSlide').addEventListener('input', function () { g_upperArmLAngle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperArmLOnButton').onclick = function () { g_upperArmLAnimation = true; };
    document.getElementById('animationUpperArmLOffButton').onclick = function () { g_upperArmLAnimation = false; };
    document.getElementById('clawInnerLSlide').addEventListener('input', function () { g_clawInnerLAngle = this.value; renderAllShapes(); });
    document.getElementById('animationClawInnerLOnButton').onclick = function () { g_clawInnerLAnimation = true; };
    document.getElementById('animationClawInnerLOffButton').onclick = function () { g_clawInnerLAnimation = false; };
    document.getElementById('clawOuterLSlide').addEventListener('input', function () { g_clawOuterLAngle = this.value; renderAllShapes(); });
    document.getElementById('animationClawOuterLOnButton').onclick = function () { g_clawOuterLAnimation = true; };
    document.getElementById('animationClawOuterLOffButton').onclick = function () { g_clawOuterLAnimation = false; };

    // left leg 1
    document.getElementById('upperLegL1Slide').addEventListener('input', function () { g_upperLegL1Angle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperLegL1OnButton').onclick = function () { g_upperLegL1Animation = true; };
    document.getElementById('animationUpperLegL1OffButton').onclick = function () { g_upperLegL1Animation = false; };
    document.getElementById('lowerLegL1Slide').addEventListener('input', function () { g_lowerLegL1Angle = this.value; renderAllShapes(); });
    document.getElementById('animationLowerLegL1OnButton').onclick = function () { g_lowerLegL1Animation = true; };
    document.getElementById('animationLowerLegL1OffButton').onclick = function () { g_lowerLegL1Animation = false; };

    // left leg 2
    document.getElementById('upperLegL2Slide').addEventListener('input', function () { g_upperLegL2Angle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperLegL2OnButton').onclick = function () { g_upperLegL2Animation = true; };
    document.getElementById('animationUpperLegL2OffButton').onclick = function () { g_upperLegL2Animation = false; };
    document.getElementById('lowerLegL2Slide').addEventListener('input', function () { g_lowerLegL2Angle = this.value; renderAllShapes(); });
    document.getElementById('animationLowerLegL2OnButton').onclick = function () { g_lowerLegL2Animation = true; };
    document.getElementById('animationLowerLegL2OffButton').onclick = function () { g_lowerLegL2Animation = false; };

    // left leg 3
    document.getElementById('upperLegL3Slide').addEventListener('input', function () { g_upperLegL3Angle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperLegL3OnButton').onclick = function () { g_upperLegL3Animation = true; };
    document.getElementById('animationUpperLegL3OffButton').onclick = function () { g_upperLegL3Animation = false; };
    document.getElementById('lowerLegL3Slide').addEventListener('input', function () { g_lowerLegL3Angle = this.value; renderAllShapes(); });
    document.getElementById('animationLowerLegL3OnButton').onclick = function () { g_lowerLegL3Animation = true; };
    document.getElementById('animationLowerLegL3OffButton').onclick = function () { g_lowerLegL3Animation = false; };

    // right arm
    document.getElementById('upperArmRSlide').addEventListener('input', function () { g_upperArmRAngle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperArmROnButton').onclick = function () { g_upperArmRAnimation = true; };
    document.getElementById('animationUpperArmROffButton').onclick = function () { g_upperArmRAnimation = false; };
    document.getElementById('clawInnerRSlide').addEventListener('input', function () { g_clawInnerRAngle = this.value; renderAllShapes(); });
    document.getElementById('animationClawInnerROnButton').onclick = function () { g_clawInnerRAnimation = true; };
    document.getElementById('animationClawInnerROffButton').onclick = function () { g_clawInnerRAnimation = false; };
    document.getElementById('clawOuterRSlide').addEventListener('input', function () { g_clawOuterRAngle = this.value; renderAllShapes(); });
    document.getElementById('animationClawOuterROnButton').onclick = function () { g_clawOuterRAnimation = true; };
    document.getElementById('animationClawOuterROffButton').onclick = function () { g_clawOuterRAnimation = false; };

    // right leg 1
    document.getElementById('upperLegR1Slide').addEventListener('input', function () { g_upperLegR1Angle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperLegR1OnButton').onclick = function () { g_upperLegR1Animation = true; };
    document.getElementById('animationUpperLegR1OffButton').onclick = function () { g_upperLegR1Animation = false; };
    document.getElementById('lowerLegR1Slide').addEventListener('input', function () { g_lowerLegR1Angle = this.value; renderAllShapes(); });
    document.getElementById('animationLowerLegR1OnButton').onclick = function () { g_lowerLegR1Animation = true; };
    document.getElementById('animationLowerLegR1OffButton').onclick = function () { g_lowerLegR1Animation = false; };

    // right leg 2
    document.getElementById('upperLegR2Slide').addEventListener('input', function () { g_upperLegR2Angle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperLegR2OnButton').onclick = function () { g_upperLegR2Animation = true; };
    document.getElementById('animationUpperLegR2OffButton').onclick = function () { g_upperLegR2Animation = false; };
    document.getElementById('lowerLegR2Slide').addEventListener('input', function () { g_lowerLegR2Angle = this.value; renderAllShapes(); });
    document.getElementById('animationLowerLegR2OnButton').onclick = function () { g_lowerLegR2Animation = true; };
    document.getElementById('animationLowerLegR2OffButton').onclick = function () { g_lowerLegR2Animation = false; };

    // right leg 3
    document.getElementById('upperLegR3Slide').addEventListener('input', function () { g_upperLegR3Angle = this.value; renderAllShapes(); });
    document.getElementById('animationUpperLegR3OnButton').onclick = function () { g_upperLegR3Animation = true; };
    document.getElementById('animationUpperLegR3OffButton').onclick = function () { g_upperLegR3Animation = false; };
    document.getElementById('lowerLegR3Slide').addEventListener('input', function () { g_lowerLegR3Angle = this.value; renderAllShapes(); });
    document.getElementById('animationLowerLegR3OnButton').onclick = function () { g_lowerLegR3Animation = true; };
    document.getElementById('animationLowerLegR3OffButton').onclick = function () { g_lowerLegR3Animation = false; };

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

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
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
    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleH, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleV, 1, 0, 0);
    globalRotMat.rotate(10, 1, 0, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let redColor = [1.0, 0.0, 0.0, 1.0];

    // body
    let body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.matrix.setTranslate(-0.3, 0.0, 0.0);
    body.matrix.scale(0.6, 0.3, 0.6);
    body.render();

    // ---------- left arm ----------

    // left arm
    let upperArmL = new Cube();
    upperArmL.color = redColor;
    upperArmL.matrix.translate(0.2, 0.1, 0.0);
    upperArmL.matrix.rotate(60, 1, 0, 0);
    upperArmL.matrix.rotate(240, 0, 0, 1);
    upperArmL.matrix.rotate(g_upperArmLAngle, 0, 0, 1);
    let lowerArmLMat = new Matrix4(upperArmL.matrix);
    upperArmL.matrix.scale(0.1, 0.3, 0.1);
    upperArmL.render();

    // left claw center
    let lowerArmL = new Cube();
    lowerArmL.matrix = lowerArmLMat;
    lowerArmL.color = redColor;
    lowerArmL.matrix.translate(-0.05, 0.3, -0.05);
    let clawInnerLMat = new Matrix4(lowerArmL.matrix);
    let clawOuterLMat = new Matrix4(lowerArmL.matrix);
    lowerArmL.matrix.scale(0.2, 0.2, 0.2);
    lowerArmL.render();

    // left claw inner
    let clawInnerL = new Cube();
    clawInnerL.matrix = clawInnerLMat;
    clawInnerL.color = redColor;
    clawInnerL.matrix.translate(0.05, 0.2, 0.0);
    clawInnerL.matrix.rotate(g_clawInnerLAngle, 1, 0, 0);
    clawInnerL.matrix.scale(0.1, 0.2, 0.1);
    clawInnerL.render();

    // left claw outer
    let clawOuterL = new Cube();
    clawOuterL.matrix = clawOuterLMat;
    clawOuterL.color = redColor;
    clawOuterL.matrix.translate(0.05, 0.2, 0.1);
    clawOuterL.matrix.rotate(g_clawOuterLAngle, 1, 0, 0);
    clawOuterL.matrix.scale(0.1, 0.2, 0.1);
    clawOuterL.render();

    // ---------- right arm ----------

    // right arm
    let upperArmR = new Cube();
    upperArmR.color = redColor;
    upperArmR.matrix.translate(-0.15, 0.1, 0.0);
    upperArmR.matrix.rotate(80, 1, 0, 0);
    upperArmR.matrix.rotate(240, 0, 0, 1);
    upperArmR.matrix.rotate(270, 0, 0, 1);
    upperArmR.matrix.rotate(g_upperArmRAngle, 0, 0, 1);
    let lowerArmRMat = new Matrix4(upperArmR.matrix);
    upperArmR.matrix.scale(0.1, 0.3, 0.1);
    upperArmR.render();

    // right claw center
    let lowerArmR = new Cube();
    lowerArmR.matrix = lowerArmRMat;
    lowerArmR.color = redColor;
    lowerArmR.matrix.translate(-0.05, 0.3, -0.05);
    let clawInnerRMat = new Matrix4(lowerArmR.matrix);
    let clawOuterRMat = new Matrix4(lowerArmR.matrix);
    lowerArmR.matrix.scale(0.25, 0.25, 0.25);
    lowerArmR.render();

    // right claw inner
    let clawInnerR = new Cube();
    clawInnerR.matrix = clawInnerRMat;
    clawInnerR.color = redColor;
    clawInnerR.matrix.translate(0.05, 0.2, 0.025);
    clawInnerR.matrix.rotate(g_clawInnerRAngle, 1, 0, 0);
    clawInnerR.matrix.scale(0.1, 0.3, 0.1);
    clawInnerR.render();

    // right claw outer
    let clawOuterR = new Cube();
    clawOuterR.matrix = clawOuterRMat;
    clawOuterR.color = redColor;
    clawOuterR.matrix.translate(0.05, 0.2, 0.125);
    clawOuterR.matrix.rotate(g_clawOuterRAngle, 1, 0, 0);
    clawOuterR.matrix.scale(0.1, 0.3, 0.1);
    clawOuterR.render();

    // ---------- left legs ----------

    // left leg 1
    let upperLegL1 = new Cube();
    upperLegL1.color = redColor;
    upperLegL1.matrix.translate(0.2, 0.1, 0.1);
    upperLegL1.matrix.rotate(240, 0, 0, 1);
    upperLegL1.matrix.rotate(g_upperLegL1Angle, 0, 0, 1);
    let lowerLegL1Mat = new Matrix4(upperLegL1.matrix);
    upperLegL1.matrix.scale(0.1, 0.5, 0.1);
    upperLegL1.render();

    let lowerLegL1 = new Cube();
    lowerLegL1.matrix = lowerLegL1Mat;
    lowerLegL1.color = redColor;
    lowerLegL1.matrix.translate(0.01, 0.4, 0.0);
    lowerLegL1.matrix.rotate(320, 0, 0, 1);
    lowerLegL1.matrix.rotate(g_lowerLegL1Angle, 0, 0, 1);
    lowerLegL1.matrix.scale(0.1, 0.5, 0.1);
    lowerLegL1.render();

    // left leg 2
    let upperLegL2 = new Cube();
    upperLegL2.color = redColor;
    upperLegL2.matrix.translate(0.2, 0.1, 0.3);
    upperLegL2.matrix.rotate(240, 0, 0, 1);
    upperLegL2.matrix.rotate(g_upperLegL2Angle, 0, 0, 1);
    let lowerLegL2Mat = new Matrix4(upperLegL2.matrix);
    upperLegL2.matrix.scale(0.1, 0.5, 0.1);
    upperLegL2.render();

    let lowerLegL2 = new Cube();
    lowerLegL2.matrix = lowerLegL2Mat;
    lowerLegL2.color = redColor;
    lowerLegL2.matrix.translate(0.01, 0.4, 0.0);
    lowerLegL2.matrix.rotate(320, 0, 0, 1);
    lowerLegL2.matrix.rotate(g_lowerLegL2Angle, 0, 0, 1);
    lowerLegL2.matrix.scale(0.1, 0.5, 0.1);
    lowerLegL2.render();

    // left leg 3
    let upperLegL3 = new Cube();
    upperLegL3.color = redColor;
    upperLegL3.matrix.translate(0.2, 0.1, 0.5);
    upperLegL3.matrix.rotate(240, 0, 0, 1);
    upperLegL3.matrix.rotate(g_upperLegL3Angle, 0, 0, 1);
    let lowerLegL3Mat = new Matrix4(upperLegL3.matrix);
    upperLegL3.matrix.scale(0.1, 0.5, 0.1);
    upperLegL3.render();

    let lowerLegL3 = new Cube();
    lowerLegL3.matrix = lowerLegL3Mat;
    lowerLegL3.color = redColor;
    lowerLegL3.matrix.translate(0.01, 0.4, 0.0);
    lowerLegL3.matrix.rotate(320, 0, 0, 1);
    lowerLegL3.matrix.rotate(g_lowerLegL3Angle, 0, 0, 1);
    lowerLegL3.matrix.scale(0.1, 0.5, 0.1);
    lowerLegL3.render();

    // ---------- right legs ----------

    // right leg 1
    let upperLegR1 = new Cube();
    upperLegR1.color = redColor;
    upperLegR1.matrix.translate(-0.2, 0.1, 0.2);
    upperLegR1.matrix.rotate(180, 0, 1, 0); // mirror from left to right
    upperLegR1.matrix.rotate(240, 0, 0, 1);
    upperLegR1.matrix.rotate(g_upperLegR1Angle, 0, 0, 1);
    let lowerLegR1Mat = new Matrix4(upperLegR1.matrix);
    upperLegR1.matrix.scale(0.1, 0.5, 0.1);
    upperLegR1.render();

    let lowerLegR1 = new Cube();
    lowerLegR1.matrix = lowerLegR1Mat;
    lowerLegR1.color = redColor;
    lowerLegR1.matrix.translate(0.01, 0.4, 0.0);
    lowerLegR1.matrix.rotate(320, 0, 0, 1);
    lowerLegR1.matrix.rotate(g_lowerLegR1Angle, 0, 0, 1);
    lowerLegR1.matrix.scale(0.1, 0.5, 0.1);
    lowerLegR1.render();

    // right leg 2
    let upperLegR2 = new Cube();
    upperLegR2.color = redColor;
    upperLegR2.matrix.translate(-0.2, 0.1, 0.4);
    upperLegR2.matrix.rotate(180, 0, 1, 0); // mirror from left to right
    upperLegR2.matrix.rotate(240, 0, 0, 1);
    upperLegR2.matrix.rotate(g_upperLegR2Angle, 0, 0, 1);
    let lowerLegR2Mat = new Matrix4(upperLegR2.matrix);
    upperLegR2.matrix.scale(0.1, 0.5, 0.1);
    upperLegR2.render();

    let lowerLegR2 = new Cube();
    lowerLegR2.matrix = lowerLegR2Mat;
    lowerLegR2.color = redColor;
    lowerLegR2.matrix.translate(0.01, 0.4, 0.0);
    lowerLegR2.matrix.rotate(320, 0, 0, 1);
    lowerLegR2.matrix.rotate(g_lowerLegR2Angle, 0, 0, 1);
    lowerLegR2.matrix.scale(0.1, 0.5, 0.1);
    lowerLegR2.render();

    // right leg 3
    let upperLegR3 = new Cube();
    upperLegR3.color = redColor;
    upperLegR3.matrix.translate(-0.2, 0.1, 0.6);
    upperLegR3.matrix.rotate(180, 0, 1, 0); // mirror from left to right
    upperLegR3.matrix.rotate(240, 0, 0, 1);
    upperLegR3.matrix.rotate(g_upperLegR3Angle, 0, 0, 1);
    let lowerLegR3Mat = new Matrix4(upperLegR3.matrix);
    upperLegR3.matrix.scale(0.1, 0.5, 0.1);
    upperLegR3.render();

    let lowerLegR3 = new Cube();
    lowerLegR3.matrix = lowerLegR3Mat;
    lowerLegR3.color = redColor;
    lowerLegR3.matrix.translate(0.01, 0.4, 0.0);
    lowerLegR3.matrix.rotate(320, 0, 0, 1);
    lowerLegR3.matrix.rotate(g_lowerLegR3Angle, 0, 0, 1);
    lowerLegR3.matrix.scale(0.1, 0.5, 0.1);
    lowerLegR3.render();
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
