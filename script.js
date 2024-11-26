// 初始化 vConsole
var vConsole = new VConsole();

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const fpsDisplay = document.getElementById("fps");
const ctx = canvas.getContext("2d");

let encoderModel, decoderModel;
let lastFrameTime = performance.now();
let frameCount = 0;

async function loadModels() {
  console.log("开始加载模型...");
  try {
    encoderModel = await tf.loadGraphModel("tfjs_encoder/model.json");
    console.log("编码器模型加载完成。");
    decoderModel = await tf.loadGraphModel("tfjs_decoder/model.json");
    console.log("解码器模型加载完成。");
  } catch (error) {
    console.error("加载模型时出错：", error);
  }
}

async function setupCamera() {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        video.onloadedmetadata = () => {
          console.log("摄像头已就绪。");
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

  // 图像预处理（根据模型需求调整）
  let resizedInput = tf.image.resizeBilinear(input, [256, 256]); // 假设模型输入为 256x256
  let normalizedInput = resizedInput.div(255.0); // 归一化到 [0, 1]

  try {
    // 调用编码器模型进行推理
    let encoderOutput = encoderModel.predict(normalizedInput);
    console.log("编码器输出：", encoderOutput);

    // 调用解码器模型进行推理
    let decoderOutput = decoderModel.predict(encoderOutput);
    console.log("解码器输出：", decoderOutput);

    // 在此处处理 decoderOutput，例如显示结果
    // ...

    // 清理内存
    encoderOutput.dispose();
    decoderOutput.dispose();
  } catch (error) {
    console.error("模型推理时出错：", error);
  }

  // 清理内存
  input.dispose();
  resizedInput.dispose();
  normalizedInput.dispose();

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
