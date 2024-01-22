const sleep = ms => new Promise(r => setTimeout(r, ms));


const canvas = document.querySelector('canvas');
const gl_object = canvas.getContext('webgl');


const info = document.getElementById("info");
if (!gl_object) {
    info.innerText = "WebGL Not Supported, Please use a different browser";
    throw new Error("Couldn't initiate the WebGL functionality, please use a different browser");
}

var CanvasHtml = document.getElementsByClassName("mainRender");

info.innerText = "WebGL Supported, Rendering";

// // for mouse hold and slide.
// canvas.addEventListener() {

// }

// // for mouse scroll.
// canvas.addEventListener() {

// }

// ########### 
// managing the 2d-slider.
const dslider = document.getElementById("d-slider");
const pad = document.getElementById("vector-pad");
const real_slider = document.getElementById("c-real-slider");
const imagine_slider = document.getElementById("c-imaginary-slider");
var isMouseDragging = false;

// at the start of loading.
dslider.style.left = `48%`;
dslider.style.top = `48%`;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function handleSliderMove(e) {
    if (isMouseDragging) {
        const x = e.clientX;
        const y = e.clientY;

        // Update the slider position based on mouse coordinates
        const parentRect = document.getElementById("vector-pad");
        const rect = parentRect.getBoundingClientRect();

        const updateX = clamp(x - rect.left, 0, pad.offsetHeight-17);
        const updateY = clamp(y - rect.top, 0, pad.offsetWidth-17);


        dslider.style.left = `${updateX}px`;
        dslider.style.top = `${updateY}px`;

        updateFormulaFromPad();
    }
    sleep(100);
}

dslider.addEventListener( 'mousedown' , (e) => {
    isMouseDragging = true;
    
    document.addEventListener('mousemove', handleSliderMove);
    document.addEventListener('mouseup', () => {
    isMouseDragging = false;
    document.removeEventListener('mousemove', handleSliderMove);
    });

    e.preventDefault();
});

document.addEventListener('mouseleave', () => {
    isMouseDragging = false;
    document.removeEventListener('mousemove', handleSliderMove);
});

function toFixed(value, precision) {
  var power = Math.pow(10, precision || 0);
  return String(Math.round(value * power) / power);
}

// for updating the equation based on the present slider values
// also need to render again
function updateFormulaFromPad() {
  const power = document.getElementById("power-slider").value;

  const sliderRect = dslider.getBoundingClientRect();
  const containerRect = dslider.parentElement.getBoundingClientRect();

  const relativeX = (sliderRect.left - containerRect.left) / containerRect.width;
  const relativeY = (sliderRect.top - containerRect.top) / containerRect.height;

  // Calculate real and imaginary, based on the relative position
  const real = (relativeX * 4.24) - 2.0;
  const imagine = -((relativeY * 4.24) - 2.0); // Negating because y-axis is inverted in HTML

  // Round to 4 decimal places
  const roundedReal = Math.round(real * 10000) / 10000;
  const roundedImagine = Math.round(imagine * 10000) / 10000;

  var eqn = document.getElementById("equation");
  real_slider.value = roundedReal;
  imagine_slider.value = roundedImagine;
  
  eqn.innerText = `W = z^${power} + (${roundedReal} + ${roundedImagine}i)`;
}

function newOne() {
  const containerRect = document.getElementById("vector-pad");

  const real = parseFloat(document.getElementById("c-real-slider").value);
  const imagine = parseFloat(document.getElementById("c-imaginary-slider").value);
          
  const newX = containerRect.offsetWidth*((real+2.01)/4.22);
  const newY = containerRect.offsetHeight*(1 - (imagine + 2.2) / 4.2);

  dslider.style.left = `${newX}px`;
  dslider.style.top = `${newY}px`;
}





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


// vertex shader does not have much stuff to do , we are just passing the ccoordinates to the fragment shader.
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


// the fragment shader that caculates the color value for each pixel.
const fragmentShaderSource = `

precision mediump float;
uniform vec2 resolution;
uniform vec2 constant;
uniform vec2 corner;
uniform float range;
uniform int max_iter;
varying vec2 coords;

void main(void) {
  vec2 z = (coords * range + corner);
  vec2 c = constant;
  vec2 newZ;
  int num;
  

  for (int iterations = 0; iterations < 9000; iterations++) {

    if (iterations >= max_iter) break;

    if (dot(z, z) > 4.0) break;

    newZ.x = z.x * z.x - z.y * z.y + c.x;
    newZ.y = 2.0 * z.x * z.y + c.y;
    z = newZ;
    num = iterations;
  }

  float normalizedIterations = float(num) / float(max_iter);
  gl_FragColor = vec4(vec3(normalizedIterations), 1.0);
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

// getting the locations at which each of the "need to be passed input" is present.
const resolutionLocation = gl_object.getUniformLocation(shaderProgram, "resolution");
const constantLocation = gl_object.getUniformLocation(shaderProgram, "constant");
const cornerLocation = gl_object.getUniformLocation(shaderProgram, "corner");
const rangeLocation = gl_object.getUniformLocation(shaderProgram, "range");
const maxIterLocation = gl_object.getUniformLocation(shaderProgram, "max_iter");

const iterations = document.getElementById("iteration-slider");
const power = document.getElementById("power-slider");


function draw() {
    // Clear the canvas
    gl_object.clearColor(0.0, 0.0, 0.0, 1.0);
    gl_object.clear(gl_object.COLOR_BUFFER_BIT);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    gl_object.viewport(0, 0, canvas.width, canvas.height);

    renderImage( -2.0, -2.0, 4.0, iterations.value, power, real_slider.value, imagine_slider.value);


    // Draw the square
    gl_object.drawArrays(gl_object.TRIANGLE_STRIP, 0, vertices.length / 2);

    // Request the next frame
    
    updateFormula();
    newOne();
    
    requestAnimationFrame(draw);
}

  // Start the rendering loop
draw();


function renderImage(coord_x, coord_y, range, max_iterations, power, c_real, c_imagine) {
  // get the dimensions of the canvas.
  const height = canvas.offsetHeight;
  const width = canvas.offsetWidth;

  gl_object.uniform2f(resolutionLocation, height, width);
  gl_object.uniform2f(constantLocation, c_real, c_imagine);
  gl_object.uniform2f(cornerLocation, coord_x, coord_y);
  gl_object.uniform1f(rangeLocation, range);
  gl_object.uniform1i(maxIterLocation, max_iterations);

}



// for updating the equation based on the present slider values
// also need to render again
function updateFormula() {
    const power = document.getElementById("power-slider").value;
    const real = document.getElementById("c-real-slider").value;
    const imagine = document.getElementById("c-imaginary-slider").value;

    var eqn = document.getElementById("equation");
    eqn.innerText = `W = z^${power} + (${real} + ${imagine}i)`;
}


