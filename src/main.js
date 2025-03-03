import { bootstrapCameraKit, createMediaStreamSource } from "@snap/camera-kit";


let startRecordingButton, videoContainer, stopRecordingButton, downloadButton, shareButton, closeBtn, liveRenderTarget, mediaRecorderOptions, mediaRecorder,downloadUrl;
let recording_ui;

async function main() {

    init();

    const apiToken = "YOUR_API_TOKEN";
    const cameraKit = await bootstrapCameraKit({ apiToken });

    liveRenderTarget = document.getElementById("canvas");
    const session = await cameraKit.createSession({ liveRenderTarget: liveRenderTarget });
    liveRenderTarget.replaceWith(session.output.live);

    session.events.addEventListener('error', (event) => {
      if (event.detail.error.name === 'LensExecutionError') {
        console.log('The current Lens encountered an error and was removed.', event.detail.error);
      }
    });

    //it will use the back camera. If you want to use the front camera (selfie mode), just change the facingMode to 'user' and the cameraType to 'front'

    const stream = await navigator.mediaDevices.getUserMedia({ video: {facingMode:'environment'} });
    const source = createMediaStreamSource(stream, { cameraType: 'back' });
    
    await session.setSource(source);

    const lens = await cameraKit.lensRepository.loadLens('YOUR_LENS_ID','YOUR_GROUP_ID');
    await session.applyLens(lens);

    session.source.setRenderSize(window.innerWidth,window.innerHeight)
    await session.play();
    console.log("Lens rendering has started!");

    recording_ui.classList.add('show')
}

async function init() {

  videoContainer = document.getElementById("preview")
  startRecordingButton = document.getElementById("start")
  stopRecordingButton = document.getElementById("stop")
  downloadButton = document.getElementById("download")
  shareButton = document.getElementById("share_btn")
  closeBtn = document.getElementById("close_btn")
  recording_ui = document.querySelector("#recording_ui")
  

  mediaRecorderOptions = { audio: false, video: true, videoBitsPerSecond: 2500000 };

  startRecordingButton.addEventListener("click", () => {
      startRecordingButton.disabled = true
      stopRecordingButton.disabled = false
      downloadButton.disabled = true

      const mediaStream = liveRenderTarget.captureStream(30)

      mediaRecorder = new MediaRecorder(mediaStream, mediaRecorderOptions)
      

      var chunks = [];
      mediaRecorder.ondataavailable = function(e) {
        chunks.push(e.data);
      };

      mediaRecorder.start();

      
      mediaRecorder.addEventListener("dataavailable", event => {
        if (!event.data.size) {
          console.warn("No recorded data available")
          return
        }

        const blob = new Blob([event.data])

        globalThis.blob = blob;

        downloadUrl = window.URL.createObjectURL(blob, {type: 'video/mp4'})
        downloadButton.disabled = false

        if (document.querySelector('#preview video')) {
          document.querySelector('#preview video').remove();
        }

        const video = document.createElement("video");
        video.setAttribute('autoplay','')
        video.setAttribute('muted','')
        video.setAttribute('loop','')
        video.setAttribute('playsinline','')
        video.setAttribute('crossorigin','anonymous')
        const videoSource = document.createElement('source');
        videoSource.type = 'video/mp4';
        videoSource.src = URL.createObjectURL(blob);
        video.append(videoSource);
        video.play();
        videoContainer.appendChild(video);

        videoContainer.classList.add('show');
      })

    })

    stopRecordingButton.addEventListener("click", () => {
      startRecordingButton.disabled = false
      stopRecordingButton.disabled = true

      mediaRecorder.stop()
    })




    downloadButton.addEventListener("click", () => {

      const link = document.createElement("a")

      link.setAttribute("style", "display: none")
      link.href = downloadUrl
      link.download = "webar_rec_.mp4"
      link.click()
      link.remove()
    })

    shareButton.addEventListener("click", async () =>  {
      if (navigator.share) {

        let filesArray = []; 
        let shareData = null;
        const file = new File([globalThis.blob], 'webar_rec.mp4', {type: 'video/mp4'});

        filesArray = [file];
        shareData = { files: filesArray };

        if (navigator.canShare && navigator.canShare(shareData)) {
          // Adding title afterwards as navigator.canShare just takes files as input
          shareData.title = 'Lens Studio CameraKit'
          shareData.text = 'Testing Native Share Functionality.'
          shareData.url = 'URL'
          navigator.share(shareData)
          .then(() => console.log('Share was successful.'))
          .catch((error) => console.log('Sharing failed', error)); // Can see if aborted here! - "Abort due to cancellation of share."
      } else {
          console.log("Your system doesn't support sharing files");
      }

    }
        
    })

    closeBtn.addEventListener("click", () => {
      videoContainer.classList.remove('show');
    });
  
}


document.addEventListener("DOMContentLoaded", main);