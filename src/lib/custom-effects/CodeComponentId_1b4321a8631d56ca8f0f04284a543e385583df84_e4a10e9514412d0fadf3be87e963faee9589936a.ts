// @ts-nocheck

// Property metadata is only used in Figma Design, so this is a no-op.
function defineProperties(
  _component: unknown,
  _properties: unknown,
): void {}

export default function Effect() { }
export function setup(device, frame) {
    var wgsl = `
diagnostic(off,derivative_uniformity);
struct Uniforms {
  frameData: vec4f,
  inputDimsData: vec4f,
  mouseData: vec4f,
  gridSpacing: vec4f,
  lineLength: vec4f,
  lineThickness: vec4f,
  lineColor: vec4f,
  backgroundColor: vec4f,
  attractionStrength: vec4f,
  restingAngle: vec4f,
  cursorRadius: vec4f,
  waveData: vec4f,
  noiseData: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

struct VsIn {
  @location(0) pos: vec2f,
  @location(1) uv: vec2f,
};
struct VsOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};



@vertex fn vs_main(in: VsIn) -> VsOut {
  var out: VsOut;
  out.position = vec4f(in.pos, 0.0, 1.0);
  out.uv = in.uv;
  return out;
}

// Approximate ellipse boundary distance in pixels. The center guard prevents
// the implicit gradient's zero denominator from producing a filled dot.
fn ellipseDistance(q: vec2f, radii: vec2f) -> f32 {
  let v = abs(q);
  let k0 = length(v / radii);
  let k1 = length(v / (radii * radii));
  return select(k0 * (k0 - 1.0) / max(k1, 0.00001), -radii.y, k0 < 0.0001);
}

fn segmentDistance(q: vec2f, start: vec2f, finish: vec2f) -> f32 {
  let edge = finish - start;
  let along = clamp(dot(q - start, edge) / max(dot(edge, edge), 0.00001), 0.0, 1.0);
  return length(q - start - edge * along);
}

fn noiseHash(p: vec2f) -> f32 {
  return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453);
}

// Continuous value noise: quintic interpolation avoids sharp lattice transitions.
fn smoothNoise(p: vec2f) -> f32 {
  let cell = floor(p);
  let f = fract(p);
  let blend = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(noiseHash(cell), noiseHash(cell + vec2f(1.0, 0.0)), blend.x),
    mix(noiseHash(cell + vec2f(0.0, 1.0)), noiseHash(cell + vec2f(1.0, 1.0)), blend.x), blend.y) * 2.0 - 1.0;
}

@fragment fn fs_main(@location(0) outputUv_in: vec2f) -> @location(0) vec4f {
  let time = u.frameData.x;
  let outputUv = outputUv_in;
  let dims = max(u.frameData.yz, vec2f(1.0));
  let inputDims = max(u.inputDimsData.xy, vec2f(1.0));
  let inputTexel = vec2f(1.0) / inputDims;
  let uv = outputUv;
  // texel and aspect are input-relative to match uv. Zoom fills rescale texel
  // alongside their uv redefinition below (see zoomLocal).
  let texel = inputTexel;
  let aspect = inputDims.x / max(inputDims.y, 1.0);
  let mousePx = u.mouseData.xy;
  let mouse = u.mouseData.zw;
  let gridSpacing = u.gridSpacing.x;
  let lineLength = u.lineLength.x;
  let lineThickness = u.lineThickness.x;
  let lineColor = u.lineColor;
  let backgroundColor = u.backgroundColor;
  let attractionStrength = u.attractionStrength.x;
  let restingAngle = u.restingAngle.x;
  let cursorRadius = max(u.cursorRadius.x, 0.0);
  let p = uv * dims;
  let spacing = max(gridSpacing, 1.0);
   // Keep one grid point at the exact layer center as spacing changes.
   let gridOrigin = dims * 0.5;
   let home = floor((p - gridOrigin) / spacing + 0.5);
  let rest = restingAngle * 0.017453292519943295;
  let waveWidth = max(u.waveData.z, 1.0);
  let waveDirection = u.waveData.w * 0.017453292519943295;
  let waveAxis = vec2f(cos(waveDirection), sin(waveDirection));
  let waveTangent = vec2f(-waveAxis.y, waveAxis.x);
     // animationMode: 0 = one Linear pulse, 1 = one expanding Radial pulse.
     let radialMode = u.frameData.w > 0.5;
     let waveSpan = select(dot(abs(waveAxis), dims), length(dims * 0.5), radialMode);
     // Include the full envelope plus the largest possible noise displacement.
     // Reset only when the old front is completely outside the visible domain.
     let waveMargin = waveWidth * (1.0 + abs(u.noiseData.x) * 0.8) + 1.0;
     let waveStart = select(-waveSpan * 0.5, 0.0, radialMode) - waveMargin;
     let frequency = select(clamp(u.inputDimsData.w, 0.25, 4.0), 1.0, radialMode);
     // Frequency changes the quiet interval, never creates additional fronts.
     let wavePeriod = waveSpan + waveMargin * 2.0 + waveWidth * 2.0 / frequency;
   let travel = time * u.waveData.x;
     let waveFront = waveStart + fract((travel - waveStart) / wavePeriod) * wavePeriod;
  let waveStrength = clamp(u.waveData.y, 0.0, 1.0) * u.noiseData.z;
  let noiseScale = max(u.noiseData.y, 1.0);
   // Gate every pointer-driven opening and rotation independently of the wave.
   let cursorActive = u.noiseData.w > 0.5 && mousePx.x > 0.0 && mousePx.y > 0.0 && mousePx.x < dims.x && mousePx.y < dims.y;
  let pull = select(0.0, clamp(attractionStrength, 0.0, 1.0), cursorActive);
  let halfLength = max(lineLength, 0.0) * 0.5;
   let radius = max(lineThickness, 0.1) * 0.5;
   let reach = i32(ceil((halfLength + radius + 1.0) / spacing));
  var nearest = 100000.0;
  // Search nearby cells so lengths greater than spacing remain continuous.
  for (var iy = -6; iy <= 6; iy = iy + 1) {
    for (var ix = -6; ix <= 6; ix = ix + 1) {
      if (abs(ix) > reach || abs(iy) > reach) { continue; }
       let centerPx = gridOrigin + (home + vec2f(f32(ix), f32(iy))) * spacing;
      let toward = mousePx - centerPx;
      let safeCursorRadius = max(cursorRadius, 0.0001);
      let distanceFalloff = 1.0 - smoothstep(safeCursorRadius * 0.65, safeCursorRadius, length(toward));
       let cursorPull = pull * select(0.0, distanceFalloff, cursorRadius > 0.0);
       let noiseCoord = (centerPx - gridOrigin - waveAxis * travel * 0.24) / noiseScale;
       let organicNoise = smoothNoise(noiseCoord);
         let wavePosition = select(dot(centerPx - gridOrigin, waveAxis), length(centerPx - gridOrigin), radialMode) - waveFront
          + organicNoise * u.noiseData.x * waveWidth * 0.8;
        // One unwrapped distance and one center-peaked envelope: no twin lobes.
        let waveDistance = abs(wavePosition);
        let wavePull = waveStrength * (1.0 - smoothstep(0.0, waveWidth, waveDistance));
      var cursorAngle = rest;
      if (dot(toward, toward) > 0.0001) {
        cursorAngle = atan2(toward.y, toward.x);
      }
      // Lines are undirected: choose the shortest angular path modulo pi.
      let deltaRaw = cursorAngle - rest;
      let delta = deltaRaw - floor((deltaRaw + 1.5707963267948966) / 3.141592653589793) * 3.141592653589793;
        var waveDelta = 1.1 * sin(dot(centerPx - gridOrigin, waveTangent) / noiseScale + travel / noiseScale * 0.45)
          + organicNoise * u.noiseData.x * 0.35;
        if (radialMode) {
          let radialOffset = centerPx - gridOrigin;
          var radialAngle = rest;
          if (dot(radialOffset, radialOffset) > 0.0001) {
            radialAngle = atan2(radialOffset.y, radialOffset.x);
          }
          let radialDelta = radialAngle - rest;
          waveDelta = radialDelta - floor((radialDelta + 1.5707963267948966) / 3.141592653589793) * 3.141592653589793;
        }
       // Cursor priority plus residual wave rotation, with no vector cancellation.
       let angle = rest + delta * cursorPull + waveDelta * wavePull * (1.0 - cursorPull);
      let axis = vec2f(cos(angle), sin(angle));
      let local = p - centerPx;
       let q = vec2f(dot(local, axis), dot(local, vec2f(-axis.y, axis.x)));
       // Core cells remain radial ellipses; the surrounding field opens into
       // circles, then smoothly collapses into horizontal resting rows.
       let coreShape = 1.0 - 0.60 * exp(-length(toward) / max(safeCursorRadius * 0.16, 0.001));
       let longRadius = max(halfLength - radius, 0.05);
         let cursorOpening = cursorPull * coreShape;
         let waveOpening = wavePull;
         let opening = cursorOpening + waveOpening * (1.0 - cursorOpening);
         let shortRadius = longRadius * opening;
       let endpoint = vec2f(clamp(q.x, -longRadius, longRadius), 0.0);
       let collapsedDistance = length(q - endpoint) - radius;
       let ringDistance = abs(ellipseDistance(q, vec2f(longRadius, max(shortRadius, 0.35)))) - radius;
       // Cross-fade only the subpixel degeneracy: never evaluate a zero axis.
        var distanceToLine = mix(collapsedDistance, ringDistance, smoothstep(0.0, 0.65, shortRadius));
        if (u.inputDimsData.z > 0.5) {
            // Honor the resting angle, then smoothly settle into an upright V.
            // Ignore field rotation; the fully opened arms point up and apex down.
           let vRest = rest - floor((rest + 1.5707963267948966) / 3.141592653589793) * 3.141592653589793;
           let vAngle = vRest * (1.0 - smoothstep(0.0, 1.0, opening));
           let vAxis = vec2f(cos(vAngle), sin(vAngle));
           let vLocal = vec2f(dot(local, vAxis), dot(local, vec2f(-vAxis.y, vAxis.x)));
           // The full V has a right-angle apex and stays within longRadius.
          let wing = longRadius * mix(1.0, 0.70710678, opening);
          let bend = shortRadius * 0.70710678;
          let apex = vec2f(0.0, bend);
          distanceToLine = min(
              segmentDistance(vLocal, vec2f(-wing, -bend), apex),
              segmentDistance(vLocal, apex, vec2f(wing, -bend))) - radius;
        }
       let exists = centerPx.x >= 0.0 && centerPx.y >= 0.0 && centerPx.x <= dims.x && centerPx.y <= dims.y;
      nearest = min(nearest, select(100000.0, distanceToLine, exists));
    }
  }
   // Integrate the signed edge over its pixel footprint, without a blur halo.
    // A true pixel-space distance has a footprint at most sqrt(2).
    // Bound the approximation's interior gradient so it cannot light up
    // ellipse centers or create broad antialiasing halos in flattened cells.
    let edgeFootprint = clamp(fwidth(nearest), 1.0, 1.414214);
   let coverage = clamp(0.5 - nearest / edgeFootprint, 0.0, 1.0);
  let foregroundAlpha = lineColor.a * coverage;
  let resultAlpha = foregroundAlpha + backgroundColor.a * (1.0 - foregroundAlpha);
  let resultPremul = lineColor.rgb * foregroundAlpha + backgroundColor.rgb * backgroundColor.a * (1.0 - foregroundAlpha);
  return vec4f(resultPremul / max(resultAlpha, 0.00001), resultAlpha);
}
`;
    frame.state.module = device.createShaderModule({ code: wgsl });
    frame.state.pipeline = null;
    frame.state.pipelineFormat = null;
    frame.state.quad = device.createBuffer({
        size: 6 * 4 * 4,
        usage: GPUBufferUsage.VERTEX,
        mappedAtCreation: true,
    });
    new Float32Array(frame.state.quad.getMappedRange()).set([
        -1, -1, 0, 1,
        1, -1, 1, 1,
        -1, 1, 0, 0,
        -1, 1, 0, 0,
        1, -1, 1, 1,
        1, 1, 1, 0,
    ]);
    frame.state.quad.unmap();
    frame.state.uniformBuf = device.createBuffer({
        size: 208,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
}
export function render(device, frame) {
    var params = frame.params || {};
    function finiteNumber(value, fallback) {
        var num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }
    function numberParam(name, fallback) {
        return finiteNumber(params[name], fallback);
    }
    function boolParam(name, fallback) {
        if (typeof params[name] === 'boolean')
            return params[name] ? 1 : 0;
        return fallback ? 1 : 0;
    }
    function selectParam(name, count, fallbackIndex) {
        // A select is a numeric dropdown: params[name] is the chosen option's index.
        var index = Math.round(Number(params[name]));
        return Number.isFinite(index) && index >= 0 && index < count ? index : fallbackIndex;
    }
    function colorParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.r, fallback[0]),
            finiteNumber(value.g, fallback[1]),
            finiteNumber(value.b, fallback[2]),
            finiteNumber(value.a, fallback[3]),
        ];
    }
    function pointParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
        ];
    }
    function pointRadiusParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            finiteNumber(value.radius, fallback[2]),
        ];
    }
    function pointPointLineParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            finiteNumber(value.x2, fallback[2]),
            finiteNumber(value.y2, fallback[3]),
        ];
    }
    function pointAngleRadiusParam(name, fallback) {
        var value = params[name] || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            finiteNumber(value.radius, fallback[2]),
            finiteNumber(value.angle, fallback[3]),
        ];
    }
    function colorPointParam(name, fallback) {
        var value = params[name] || {};
        var color = value.color || {};
        return [
            finiteNumber(value.x, fallback[0]),
            finiteNumber(value.y, fallback[1]),
            0,
            0,
            finiteNumber(color.r, fallback[2]),
            finiteNumber(color.g, fallback[3]),
            finiteNumber(color.b, fallback[4]),
            finiteNumber(color.a, fallback[5]),
        ];
    }
    function gradientParam(name, fallback) {
        var value = params[name] || {};
        var stops = Array.isArray(value.stops) && value.stops.length > 0 ? value.stops : fallback;
        // Layout: 8 stop colors (rgba), then 8 positions packed 4-per-vec4, then the live count.
        var out = new Array(44).fill(0);
        var count = Math.min(stops.length, 8);
        for (var i = 0; i < count; i++) {
            var stop = stops[i] || {};
            var color = stop.color || {};
            out[i * 4] = finiteNumber(color.r, 0);
            out[i * 4 + 1] = finiteNumber(color.g, 0);
            out[i * 4 + 2] = finiteNumber(color.b, 0);
            out[i * 4 + 3] = finiteNumber(color.a, 1);
            out[32 + i] = finiteNumber(stop.position, 0);
        }
        out[40] = count;
        return out;
    }
    var output = frame.output || {};
    var width = Math.max(1, finiteNumber(output.width, 1));
    var height = Math.max(1, finiteNumber(output.height, 1));
    var time = finiteNumber(frame.time, 0) * 0.001;
    var inputWidth = width;
    var inputHeight = height;
    var mousePosition = frame.mousePosition || {};
    var mouseX = finiteNumber(mousePosition.x, -1);
    var mouseY = finiteNumber(mousePosition.y, -1);
    device.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
        time, width, height, selectParam("animationMode", 2, 0),
        inputWidth, inputHeight, selectParam("morphShape", 2, 0), numberParam("waveFrequency", 1),
        mouseX, mouseY, mouseX / width, mouseY / height,
        numberParam("gridSpacing", 24), 0, 0, 0,
        numberParam("lineLength", 24), 0, 0, 0,
        numberParam("lineThickness", 0.7), 0, 0, 0,
        ...colorParam("lineColor", [0.82, 0.82, 0.82, 1]),
        ...colorParam("backgroundColor", [0, 0, 0, 1]),
        numberParam("attractionStrength", 1), 0, 0, 0,
        numberParam("restingAngle", 0), 0, 0, 0,
        numberParam("cursorRadius", 220), 0, 0, 0,
        numberParam("waveSpeed", 60), numberParam("waveStrength", 1), numberParam("waveWidth", 140), numberParam("waveDirection", 25),
        numberParam("noiseAmount", 0.35), numberParam("noiseScale", 180), boolParam("animationEnabled", true), boolParam("cursorEnabled", true),
    ]));
    var outputFormat = frame.output.format;
    if (frame.state.pipeline == null || frame.state.pipelineFormat !== outputFormat) {
        frame.state.pipeline = device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: frame.state.module,
                entryPoint: 'vs_main',
                buffers: [{
                        arrayStride: 16,
                        attributes: [
                            { shaderLocation: 0, format: 'float32x2', offset: 0 },
                            { shaderLocation: 1, format: 'float32x2', offset: 8 },
                        ],
                    }],
            },
            fragment: {
                module: frame.state.module,
                entryPoint: 'fs_main',
                targets: [{ format: outputFormat }],
            },
            primitive: { topology: 'triangle-list' },
        });
        frame.state.pipelineFormat = outputFormat;
    }
    var bindGroup = device.createBindGroup({
        layout: frame.state.pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: frame.state.uniformBuf } },
        ],
    });
    var encoder = device.createCommandEncoder();
    var pass = encoder.beginRenderPass({
        colorAttachments: [{
                view: frame.output.createView(),
                loadOp: 'clear',
                clearValue: { r: 0, g: 0, b: 0, a: 0 },
                storeOp: 'store',
            }],
    });
    pass.setPipeline(frame.state.pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.setVertexBuffer(0, frame.state.quad);
    pass.draw(6);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
defineProperties(Effect, {
    "morphShape": {
        type: "number",
        label: "Morph shape",
        defaultValue: 0,
        control: "select",
        options: [
            { value: 0, label: "Ellipse" },
            { value: 1, label: "V" },
        ],
    },
    "gridSpacing": {
        type: "number",
        label: "Grid spacing",
        defaultValue: 24,
        control: "slider",
        min: 8,
        max: 100,
        step: 1,
        unit: "px",
    },
    "lineLength": {
        type: "number",
        label: "Line length",
        defaultValue: 24,
        control: "slider",
        min: 2,
        max: 80,
        step: 1,
        unit: "px",
    },
    "lineThickness": {
        type: "number",
        label: "Line thickness",
        defaultValue: 0.7,
        control: "slider",
        min: 0.5,
        max: 12,
        step: 0.1,
        unit: "px",
    },
    "lineColor": {
        type: "color",
        label: "Line color",
        defaultValue: { "r": 0.82, "g": 0.82, "b": 0.82, "a": 1 },
    },
    "backgroundColor": {
        type: "color",
        label: "Background color",
        defaultValue: { "r": 0, "g": 0, "b": 0, "a": 1 },
    },
    "attractionStrength": {
        type: "number",
        label: "Cursor attraction strength",
        defaultValue: 1,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "restingAngle": {
        type: "number",
        label: "Resting angle",
        defaultValue: 0,
        control: "slider",
        min: 0,
        max: 180,
        step: 1,
        unit: "°",
    },
    "cursorRadius": {
        type: "number",
        label: "Cursor radius",
        defaultValue: 220,
        control: "slider",
        min: 0,
        max: 800,
        step: 1,
        unit: "px",
    },
    "cursorEnabled": {
        type: "boolean",
        label: "Cursor effect",
        defaultValue: true,
    },
    "animationEnabled": {
        type: "boolean",
        label: "Animation enabled",
        defaultValue: true,
    },
    "animationMode": {
        type: "number",
        label: "Wave mode",
        defaultValue: 0,
        control: "select",
        options: [
            { value: 0, label: "Linear" },
            { value: 1, label: "Radial" },
        ],
    },
    "waveSpeed": {
        type: "number",
        label: "Wave speed",
        defaultValue: 60,
        control: "slider",
        min: 0,
        max: 240,
        step: 1,
        unit: "px/s",
    },
    "waveFrequency": {
        type: "number",
        label: "Wave frequency",
        defaultValue: 1,
        control: "slider",
        min: 0.25,
        max: 4,
        step: 0.05,
    },
    "waveStrength": {
        type: "number",
        label: "Wave strength",
        defaultValue: 1,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "waveWidth": {
        type: "number",
        label: "Wave width",
        defaultValue: 140,
        control: "slider",
        min: 20,
        max: 600,
        step: 1,
        unit: "px",
    },
    "waveDirection": {
        type: "number",
        label: "Wave direction",
        defaultValue: 25,
        control: "slider",
        min: 0,
        max: 360,
        step: 1,
        unit: "°",
    },
    "noiseAmount": {
        type: "number",
        label: "Noise amount",
        defaultValue: 0.35,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "noiseScale": {
        type: "number",
        label: "Noise scale",
        defaultValue: 180,
        control: "slider",
        min: 40,
        max: 600,
        step: 1,
        unit: "px",
    },
});

export const manifest = {
  "version": 2,
  "name": "Magnetic filings",
  "isAnimated": true,
  "usesMouse": true
}
