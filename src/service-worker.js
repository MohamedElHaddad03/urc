importScripts("https://js.pusher.com/beams/service-worker.js");
const sw = navigator.serviceWorker;
if (sw != null) {
    sw.onmessage = (event) => {
        console.log("Got event from sw : " + event.data);
    }
}