document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("camera");
  const captureButton = document.getElementById("capture");
  const toggleCameraBtn = document.getElementById("toggleCamera");
  const cameraOffMessage = document.getElementById("camera-off-message");
  const capturedImage = document.getElementById("capturedImage");
  const processScan = document.querySelector(".process-scan");
  const backButton = document.getElementById("backButton");
  const closeProcessButton = document.getElementById("closeProcess");

  let stream;
  let isCameraOn = true;

  function startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        stream = mediaStream;
        video.srcObject = stream;
        video.style.display = "block";
        cameraOffMessage.style.display = "none";
      })
      .catch((error) => {
        console.error("Gagal mengakses kamera:", error);
        alert("Tidak bisa mengakses kamera.");
      });
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    cameraOffMessage.style.display = "block";
  }
  startCamera();

  backButton.addEventListener("click", () => {
    window.history.back();
  });

  toggleCameraBtn.addEventListener("click", () => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
    isCameraOn = !isCameraOn;
  });

  // captureButton.addEventListener("click", () => {
  //   const canvas = document.createElement("canvas");
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;

  //   const context = canvas.getContext("2d");
  //   context.drawImage(video, 0, 0, canvas.width, canvas.height);

  //   capturedImage.src = canvas.toDataURL("image/png");
  //   capturedImage.style.display = "block";
  //   video.classList.add("hidden");
  //   capturedImage.classList.remove("hidden");
  //   processScan.style.display = "block";
  // });

  closeProcessButton.addEventListener("click", () => {
    processScan.style.display = "none";
    video.classList.remove("hidden");
    capturedImage.classList.add("hidden");
  });
});

document.getElementById("backButton").addEventListener("click", function() {
  window.location.href = "../Homepage/index.html";
});
