let videoFeed;
let poseNet;
let poses = [];
let started = false;
let defaultRightEyePosition = null;
let defaultLeftEyePosition = null;
let audio;
let poseNetInitialized = false;
let postureInterval;

let lastAudioTime = 0;
let lastNotificationTime = 0;

let lastAudioPlayTime = 0; // waktu terakhir audio diputar (dalam ms)
const AUDIO_COOLDOWN = 3000; // 3 detik

function setup() {
  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  noCanvas(); // kalau gak mau tampil canvas
  audio = document.getElementById("audioElement");

  const aktifBtn = document.getElementById("aktifPostureGuard");
  const nonaktifBtn = document.getElementById("nonaktifPostureGuard");

  if (aktifBtn && nonaktifBtn) {
    aktifBtn.addEventListener("click", () => {
      if (!poseNetInitialized) {
        initPoseNet();
      }

      started = true;
      defaultRightEyePosition = parseFloat(localStorage.getItem("defaultRightEyeY"));
      defaultLeftEyePosition = parseFloat(localStorage.getItem("defaultLeftEyeY"));

      if (isNaN(defaultRightEyePosition) || isNaN(defaultLeftEyePosition)) {
        alert("Belum ada data postur default! Silakan capture dulu.");
        started = false;
        return;
      }
      alert("Posture Guard Berhasil dijalankan");
      console.log("Posture Guard aktif");
      loop();

      postureInterval = setInterval(() => {
        if (started && poseNetInitialized) {
          if (videoFeed?.elt?.paused) {
            videoFeed.elt.play().catch(e => console.warn("Auto-play blocked", e));
          }

          const videoTrack = videoFeed?.elt?.srcObject?.getVideoTracks?.()[0];
          if (!videoTrack || videoTrack.readyState !== "live") {
            console.warn("Video feed interrupted. Restarting...");
            initPoseNet();
          }

          calEyes();
        }
      }, 500);
    });


    nonaktifBtn.addEventListener("click", () => {
      started = false;
      removeBlur();

      if (videoFeed) {
        const stream = videoFeed.elt.srcObject;
        if (stream) {
          stream.getTracks().forEach(track => {
            console.log("Stopping track", track);
            track.stop();
          });
        }
        videoFeed.remove();
        videoFeed = null;
      }

      poseNet = null;
      poseNetInitialized = false;
      defaultRightEyePosition = null;
      defaultLeftEyePosition = null;

      if (postureInterval) {
        clearInterval(postureInterval);
        postureInterval = null;
      }

      alert("Posture Guard berhasil dihentikan");
      console.log("Posture Guard nonaktif");
      noLoop(); // hentikan loop
    });
  }

  const captureBtn = document.getElementById("capture");
  if (captureBtn) {
    captureBtn.addEventListener("click", () => {
      // 1. Aktifkan PoseNet sementara
      videoFeed = createCapture(VIDEO);
      videoFeed.size(640, 480);
      videoFeed.hide();

      poseNet = ml5.poseNet(videoFeed, () => {
        console.log("PoseNet siap untuk capture");
      });

      let captured = false;

      poseNet.on("pose", function(results) {
        if (captured) return; // cegah pemrosesan ulang

        poses = results;

        if (poses.length > 0) {
          let pose = poses[0].pose;
          let rightEye = pose.keypoints[2].position;
          let leftEye = pose.keypoints[1].position;

          defaultRightEyePosition = rightEye.y;
          defaultLeftEyePosition = leftEye.y;

          localStorage.setItem("defaultRightEyeY", defaultRightEyePosition);
          localStorage.setItem("defaultLeftEyeY", defaultLeftEyePosition);

          captured = true; // tandai sudah diproses
          alert("Postur default berhasil disimpan!");
          console.log("Default posture set:", defaultRightEyePosition, defaultLeftEyePosition);

          // Stop kamera dan poseNet
          if (videoFeed) {
            videoFeed.elt.srcObject.getTracks().forEach(track => track.stop());
            videoFeed.remove();
            videoFeed = null;
          }

          poseNet = null;
          poses = [];
        } else if (!captured) {
          alert("Tidak dapat mendeteksi wajah. Coba lagi.");
          captured = true; // agar tidak muncul berkali-kali
        }
      });
    });
  }
}

function initPoseNet() {
  videoFeed = createCapture(VIDEO);
  videoFeed.size(640, 480);
  videoFeed.hide(); // tetap tidak tampilkan video

  poseNet = ml5.poseNet(videoFeed, () => {
    console.log("PoseNet siap");
  });

  poseNet.on("pose", function(results) {
    poses = results;
  });


  poseNetInitialized = true;
}

function calEyes() {
  if (
    poses.length === 0 ||
    defaultRightEyePosition === null ||
    defaultLeftEyePosition === null
  ) return;

  let pose = poses[0].pose;
  let rightEye = pose.keypoints[2].position;
  let leftEye = pose.keypoints[1].position;

  const threshold = 20;
  if (
    Math.abs(rightEye.y - defaultRightEyePosition) > threshold ||
    Math.abs(leftEye.y - defaultLeftEyePosition) > threshold
  ) {
    blur();
  } else {
    removeBlur();
  }
}

function blur() {
  document.body.style.filter = "blur(5px)";
  document.body.style.transition = "1s";
  const now = Date.now();
  if (now - lastAudioPlayTime > AUDIO_COOLDOWN) {
    if (audio.paused) {
      audio.play();
      lastAudioPlayTime = now;
    }
  }

  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      if (now - lastNotificationTime > 6000) {
        new Notification("Awas Postur!", {
          body: "Kamu terdeteksi membungkuk, segera perbaiki posturmu!",
          icon: "notif-icon.jpeg"
        });
        lastNotificationTime = now;
      }
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification("Awas Postur!", {
            body: "Kamu terdeteksi membungkuk, segera perbaiki posturmu!",
            icon: "../Homepage/Assets/notif-icon.jpeg"
          });
          lastNotificationTime = now;
        }
      });
    }
  }
}

function removeBlur() {
  document.body.style.filter = "blur(0px)";
  if (!audio.paused) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function draw() {
  if (!started) return; // kalau belum mulai, skip

  // poseNet sudah update 'poses' lewat event
  // lakukan pengecekan postur tiap frame
  calEyes();


}