
const canvas = document.querySelector('canvas');
const gl_object = canvas.getContext('webgl');

if (!gl_object) {
    throw new Error("Couldn't initiate the WebGL functionality, please use a different browser");
}

var CanvasHtml = document.getElementsByClassName("mainRender");


// // for mouse hold and slide.
// canvas.addEventListener() {

// }

// // for mouse scroll.
// canvas.addEventListener() {

// }






// WebGL 
// ^ +ve y-axis
// > +ve x-axix

// our canvas square : 

const vertices = new Float32Array([
   -1.0,  1.0,
   -1.0, -1.0,
    1.0,  1.0,
    1.0, -1.0
])

const vertexBuffer = gl_object.createBuffer();
gl_object.bindBuffer(gl_object.ARRAY_BUFFER, vertexBuffer);
gl_object.bufferData(gl_object.ARRAY_BUFFER, vertices, gl_object.STATIC_DRAW);

const vertexShaderSource = `
  attribute vec2 coordinates;
  varying vec2 coords;

  void main(void) {
    gl_Position = vec4(coordinates, 0.0, 1.0);
    coords = coordinates;
}`;

const vertexShader = gl_object.createShader(gl_object.VERTEX_SHADER);
gl_object.shaderSource(vertexShader, vertexShaderSource);
gl_object.compileShader(vertexShader);

if (!gl_object.getShaderParameter(vertexShader, gl_object.COMPILE_STATUS)) {
  console.error('ERROR compiling vertex shader!', gl_object.getShaderInfoLog(vertexShader));
}


const fragmentShaderSource = `
precision mediump float;
varying vec2 coords;

void main(void) {
  gl_FragColor = vec4(0.5, coords, 1.0);
}`;

const fragmentShader = gl_object.createShader(gl_object.FRAGMENT_SHADER);
gl_object.shaderSource(fragmentShader, fragmentShaderSource);
gl_object.compileShader(fragmentShader);

if (!gl_object.getShaderParameter(fragmentShader, gl_object.COMPILE_STATUS)) {
console.error('ERROR compiling fragment shader!', gl_object.getShaderInfoLog(fragmentShader));
}

const shaderProgram = gl_object.createProgram();
gl_object.attachShader(shaderProgram, vertexShader);
gl_object.attachShader(shaderProgram, fragmentShader);
gl_object.linkProgram(shaderProgram);
gl_object.useProgram(shaderProgram);


// we want the coordinates of the 
const coord = gl_object.getAttribLocation(shaderProgram, 'coordinates');
gl_object.vertexAttribPointer(coord, 2, gl_object.FLOAT, false, 0, 0);
gl_object.enableVertexAttribArray(coord);

function draw() {
    // Clear the canvas
    gl_object.clearColor(0.0, 0.0, 0.0, 1.0);
    gl_object.clear(gl_object.COLOR_BUFFER_BIT);
    gl_object.viewport(0, 0, canvas.height, canvas.width);


    // Draw the square
    gl_object.drawArrays(gl_object.TRIANGLE_STRIP, 0, vertices.length / 2);

    // Request the next frame
    requestAnimationFrame(draw);
    updateFormula();
}

  // Start the rendering loop
draw();



// for updating the equation based on the present slider values
// also need to render again
function updateFormula() {
    const power = document.getElementById("power-slider").value;
    const real = document.getElementById("c-real-slider").value;
    const imagine = document.getElementById("c-imaginary-slider").value;

    var eqn = document.getElementById("equation");
    eqn.innerText = `W = z^${power} + (${real} + ${imagine}i)`;
}
