// Configuration constants
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";

// Pagination settings
const BATCH_SIZE = 50; // Number of videos to add in each batch
const DELAY_BETWEEN_BATCHES = 10000; // Delay between batches in milliseconds (10 seconds)

// DOM element references
let authorizeButton = document.getElementById("createPlaylist");
let fileInput = document.getElementById("fileInput");
let statusDiv = document.getElementById("status");
let progressDiv = document.getElementById("progress");
let progressBarFill = document.getElementById("progressBarFill");

// Initialize the Google API client
function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(function () {
      authorizeButton.onclick = handleAuthClick;
    });
}

// Handle authorization and file processing
function handleAuthClick() {
  if (fileInput.files.length === 0) {
    statusDiv.textContent = "Please select a file first.";
    return;
  }

  gapi.auth2
    .getAuthInstance()
    .signIn()
    .then(function () {
      statusDiv.textContent = "Processing file...";
      processFile(fileInput.files[0]);
    });
}

// Process the uploaded ZIP file
function processFile(file) {
  let zip = new JSZip();
  zip.loadAsync(file).then(function (contents) {
    contents
      .file("Takeout/YouTube and YouTube Music/history/watch-history.json")
      .async("string")
      .then(function (content) {
        let watchHistory = JSON.parse(content);
        createPlaylist(watchHistory);
      });
  });
}

// Create a new playlist
function createPlaylist(watchHistory) {
  gapi.client.youtube.playlists
    .insert({
      part: "snippet,status",
      resource: {
        snippet: {
          title: "My Watch History",
          description: "Playlist created from my watch history",
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
    })
    .then(function (response) {
      let playlistId = response.result.id;
      addVideosToPlaylist(playlistId, watchHistory);
    });
}

// Add videos to the created playlist
function addVideosToPlaylist(playlistId, watchHistory) {
  let videoIds = watchHistory
    .filter((item) => item.titleUrl)
    .map((item) => item.titleUrl.split("v=")[1])
    .filter((id, index, self) => self.indexOf(id) === index);

  let totalVideos = videoIds.length;
  let addedVideos = 0;

  function addBatch(startIndex) {
    let endIndex = Math.min(startIndex + BATCH_SIZE, totalVideos);
    let batchIds = videoIds.slice(startIndex, endIndex);

    let promises = batchIds.map((videoId) =>
      gapi.client.youtube.playlistItems.insert({
        part: "snippet",
        resource: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: "youtube#video",
              videoId: videoId,
            },
          },
        },
      })
    );

    Promise.all(promises)
      .then(() => {
        addedVideos += batchIds.length;
        updateProgress(addedVideos, totalVideos);

        if (endIndex < totalVideos) {
          setTimeout(() => addBatch(endIndex), DELAY_BETWEEN_BATCHES);
        } else {
          statusDiv.textContent = "Playlist created successfully!";
        }
      })
      .catch((error) => {
        statusDiv.textContent = "An error occurred: " + error;
      });
  }

  addBatch(0);
}

function updateProgress(current, total) {
  let percentage = Math.round((current / total) * 100);
  progressDiv.textContent = `Progress: ${current}/${total} videos added`;
  progressBarFill.style.width = percentage + "%";
  progressBarFill.textContent = percentage + "%";
}

// Start the client load process when the script is executed
handleClientLoad();
