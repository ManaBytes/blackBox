// Configuration constants
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";

// DOM element references
let authorizeButton = document.getElementById("createPlaylist");
let fileInput = document.getElementById("fileInput");
let statusDiv = document.getElementById("status");

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
  // Extract unique video IDs from watch history
  let videoIds = watchHistory
    .filter((item) => item.titleUrl)
    .map((item) => item.titleUrl.split("v=")[1])
    .filter((id, index, self) => self.indexOf(id) === index);

  // Create promises for adding each video to the playlist
  let promises = videoIds.map((videoId) =>
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

  // Execute all promises and update status
  Promise.all(promises)
    .then(() => {
      statusDiv.textContent = "Playlist created successfully!";
    })
    .catch((error) => {
      statusDiv.textContent = "An error occurred: " + error;
    });
}

// Start the client load process when the script is executed
handleClientLoad();
