const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const fpsDisplay = document.getElementById("fps");
const ctx = canvas.getContext("2d");

let encoderModel, decoderModel;
let lastFrameTime = performance.now();
let frameCount = 0;

async function loadModels() {
  encoderModel = await tf.loadGraphModel("tfjs_encoder/model.json");
  decoderModel = await tf.loadGraphModel("tfjs_decoder/model.json");
}

async function setupCamera() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          resolve();
        };
      })
      .catch((err) => {
        console.error("摄像头访问被拒绝或出错：", err);
        reject(err);
      });
  });
}

function processFrame() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let input = tf.browser.fromPixels(imageData).toFloat().expandDims(0);

  // TODO: 调用模型进行推理
  // let encoderOutput = encoderModel.predict(input);
  // let decoderOutput = decoderModel.predict(encoderOutput);

  // 清理内存
  input.dispose();
  // encoderOutput.dispose();
  // decoderOutput.dispose();

  frameCount++;
  let now = performance.now();
  let delta = now - lastFrameTime;

  if (delta >= 1000) {
    let fps = Math.round((frameCount / delta) * 1000);
    fpsDisplay.textContent = fps;
    frameCount = 0;
    lastFrameTime = now;
  }

  requestAnimationFrame(processFrame);
}

async function main() {
  await loadModels();
  await setupCamera();
  processFrame();
}

main();
