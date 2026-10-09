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
  gradColors: array<vec4f, 8>,
  gradPositions: array<vec4f, 2>,
  gradMeta: vec4f,
  direction: vec4f,
  speed: vec4f,
  wave: vec4f,
  zoom: vec4f,
  mode: vec4f,
  freq: vec4f,
  detail: vec4f,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

fn sampleGradient(t: f32) -> vec4f {
  let count = i32(u.gradMeta.x);
  if (count <= 0) { return vec4f(0.0); }
  if (count == 1) { return u.gradColors[0]; }
  // positions are packed: gradPositions[i/4][i%4]
  var pos0 = u.gradPositions[0][0];
  if (t <= pos0) { return u.gradColors[0]; }
  for (var i = 1; i < 8; i++) {
    if (i >= count) { break; }
    let pi = u.gradPositions[i / 4][i % 4];
    if (t <= pi) {
      let f = (t - pos0) / max(pi - pos0, 0.00001);
      return mix(u.gradColors[i - 1], u.gradColors[i], vec4f(f));
    }
    pos0 = pi;
  }
  return u.gradColors[count - 1];
}

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

@fragment fn fs_main(@location(0) outputUv_in: vec2f) -> @location(0) vec4f {
  let time = u.frameData.x;
  let dims = max(u.frameData.yz, vec2f(1.0));
  let inputDims = max(u.inputDimsData.xy, vec2f(1.0));
  let inputTexel = vec2f(1.0) / inputDims;
  let uvRaw = outputUv_in;
  let aspect = inputDims.x / max(inputDims.y, 1.0);
  let direction = u.direction;
  let speed = u.speed.x;
  let gradientSpeed = u.speed.y;
  let wave = u.wave.x;
  let zoom = u.zoom.x;
  let uv = (uvRaw - vec2f(0.5)) / zoom + vec2f(0.5);
  let t = time * speed * 0.001;
  let gradientT = time * gradientSpeed * 0.001;
  let center = direction.xy / 100.0;
  let spread = direction.z / 100.0;
  let angleDeg = direction.w;
  let angleRad = angleDeg * 3.14159265 / 180.0;
  let axisDir = vec2f(cos(angleRad), sin(angleRad));
  let mode = i32(u.mode.x);

  var projected: f32;
  if (mode == 1) {
    let diff = uv - center;
    let corrected = vec2f(diff.x * aspect, diff.y);
    projected = length(corrected) / max(spread * aspect, 0.0001);
  } else if (mode == 2) {
    let diff = uv - center;
    let corrected = vec2f(diff.x * aspect, diff.y);
    let chevronDir = normalize(vec2f(axisDir.x * aspect, axisDir.y));
    let chevronSide = vec2f(-chevronDir.y, chevronDir.x);
    let forward = dot(corrected, chevronDir);
    let lateral = abs(dot(corrected, chevronSide));
    projected = (forward + lateral * 0.85) / max(spread, 0.0001) + 0.5;
  } else {
    projected = dot(uv - center, axisDir) / max(spread, 0.0001) + 0.5;
  }

  // Wave: add animated sinusoidal banding to the projected value
  let frequency = u.freq.x;
  let waveFreq = 6.2831853 * frequency;
  let waveOffset = sin(projected * waveFreq - t * 6.2831853) * 0.3 * wave;
  // A second harmonic for organic feel
  let waveOffset2 = sin(projected * waveFreq * 0.7 + t * 4.0) * 0.15 * wave;
  let finalProj = projected + waveOffset + waveOffset2;

  let detail = u.detail.x;
  // Mix between smooth unmodulated coordinate and wave-modulated coordinate
  let blendedProj = mix(projected, finalProj, detail * 0.3 + 0.7 * detail * detail);
  // Move the color ramp through the stable gradient field independently of its
  // wave deformation. A mirrored repeat keeps arbitrary endpoint colors
  // continuous at the cycle boundary, and smoothstep removes the turn seam.
  let colorCoord = blendedProj - gradientT * 0.35;
  let repeatedColor = fract(colorCoord * 0.5) * 2.0;
  let mirroredColor = 1.0 - abs(repeatedColor - 1.0);
  let gradT = smoothstep(0.0, 1.0, mirroredColor);
  let blended = sampleGradient(gradT);
  return vec4f(blended.rgb, blended.a);
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
        size: 320,
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
    var time = finiteNumber(frame.time, 0);
    var inputWidth = width;
    var inputHeight = height;
    device.queue.writeBuffer(frame.state.uniformBuf, 0, new Float32Array([
        time, width, height, 0,
        inputWidth, inputHeight, 0, 0,
        ...gradientParam("colors", [
            { position: 0, color: { r: 0.2, g: 0.1, b: 0.8, a: 1 } },
            { position: 0.5, color: { r: 0.9, g: 0.2, b: 0.5, a: 1 } },
            { position: 1, color: { r: 0.1, g: 0.8, b: 0.6, a: 1 } },
        ]),
        ...pointAngleRadiusParam("direction", [50, 50, 50, 0]),
        numberParam("speed", 0.5), numberParam("gradientSpeed", 0.5), 0, 0,
        numberParam("wave", 0.5), 0, 0, 0,
        numberParam("zoom", 1), 0, 0, 0,
        selectParam("mode", 3, 0), 0, 0, 0,
        numberParam("frequency", 5), 0, 0, 0,
        numberParam("detail", 0.5), 0, 0, 0,
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
    "colors": {
        type: "gradient",
        label: "Colors",
        defaultValue: {
            stops: [
                { position: 0, color: { r: 0.2, g: 0.1, b: 0.8, a: 1 } },
                { position: 0.5, color: { r: 0.9, g: 0.2, b: 0.5, a: 1 } },
                { position: 1, color: { r: 0.1, g: 0.8, b: 0.6, a: 1 } },
            ],
        },
    },
    "direction": {
        type: "point-angle-radius",
        label: "Direction",
        defaultValue: { "x": 50, "y": 50, "radius": 50, "angle": 0 },
        mode: "canvas_and_ui",
        minRadius: 1,
        maxRadius: 100,
        positionUnit: "%",
        radiusUnit: "%",
    },
    "speed": {
        type: "number",
        label: "Speed",
        defaultValue: 0.5,
        control: "slider",
        min: 0,
        max: 2,
        step: 0.01,
    },
    "gradientSpeed": {
        type: "number",
        label: "Gradient speed",
        defaultValue: 0.5,
        control: "slider",
        min: 0,
        max: 2,
        step: 0.01,
    },
    "wave": {
        type: "number",
        label: "Wave",
        defaultValue: 0.5,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "zoom": {
        type: "number",
        label: "Scale",
        defaultValue: 1,
        control: "slider",
        min: 0.1,
        max: 5,
        step: 0.01,
    },
    "frequency": {
        type: "number",
        label: "Frequency",
        defaultValue: 5,
        control: "slider",
        min: 1,
        max: 20,
        step: 1,
    },
    "detail": {
        type: "number",
        label: "Detail",
        defaultValue: 0.5,
        control: "slider",
        min: 0,
        max: 1,
        step: 0.01,
    },
    "mode": {
        type: "number",
        label: "Mode",
        defaultValue: 0,
        control: "select",
        options: [
            { value: 0, label: "Linear" },
            { value: 1, label: "Radial" },
            { value: 2, label: "Chevron" },
        ],
    },
});

export const manifest = {
  "version": 2,
  "name": "Morphing gradient",
  "isAnimated": true,
  "usesMouse": false
}
