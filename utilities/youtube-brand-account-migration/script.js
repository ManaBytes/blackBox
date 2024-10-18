// Your Client ID from the Google Developers Console
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];

// Authorization scopes required by the API
const SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";

let authorizeButton = document.getElementById("createPlaylist");
let fileInput = document.getElementById("fileInput");
let statusDiv = document.getElementById("status");

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

function addVideosToPlaylist(playlistId, watchHistory) {
  let videoIds = watchHistory
    .filter((item) => item.titleUrl)
    .map((item) => item.titleUrl.split("v=")[1])
    .filter((id, index, self) => self.indexOf(id) === index);

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

  Promise.all(promises)
    .then(() => {
      statusDiv.textContent = "Playlist created successfully!";
    })
    .catch((error) => {
      statusDiv.textContent = "An error occurred: " + error;
    });
}

handleClientLoad();
