// Configuration constants
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";

// Pagination settings
const BATCH_SIZE = 50; // Number of videos to add in each batch
const DELAY_BETWEEN_BATCHES = 10000; // Delay between batches in milliseconds (10 seconds)

// API quota settings
const DAILY_QUOTA = 10000; // Default daily quota for free tier
const PLAYLIST_INSERT_COST = 50; // Cost to create a new playlist
const PLAYLIST_ITEM_INSERT_COST = 50; // Cost to add an item to a playlist

// DOM element references
let authorizeButton = document.getElementById("createPlaylist");
let resumeButton = document.getElementById("resumeButton");
let fileInput = document.getElementById("fileInput");
let privacySelect = document.getElementById("privacySelect");
let statusDiv = document.getElementById("status");
let progressDiv = document.getElementById("progress");
let quotaStatusDiv = document.getElementById("quotaStatus");
let progressBarFill = document.getElementById("progressBarFill");
let modeToggle = document.getElementById("modeToggle");

let quotaUsed = 0;
let state = {
  playlistId: null,
  videoIds: [],
  addedVideos: 0,
  totalVideos: 0,
};

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
      resumeButton.onclick = handleResumeClick;
      loadState();
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

function handleResumeClick() {
  gapi.auth2
    .getAuthInstance()
    .signIn()
    .then(function () {
      addVideosToPlaylist(state.playlistId, state.videoIds);
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
  if (quotaUsed + PLAYLIST_INSERT_COST > DAILY_QUOTA) {
    statusDiv.textContent = "Daily quota exceeded. Please try again tomorrow.";
    return;
  }

  gapi.client.youtube.playlists
    .insert({
      part: "snippet,status",
      resource: {
        snippet: {
          title: "My Watch History",
          description: "Playlist created from my watch history",
        },
        status: {
          privacyStatus: privacySelect.value,
        },
      },
    })
    .then(function (response) {
      quotaUsed += PLAYLIST_INSERT_COST;
      updateQuotaStatus();
      state.playlistId = response.result.id;
      state.videoIds = watchHistory
        .filter((item) => item.titleUrl)
        .map((item) => item.titleUrl.split("v=")[1])
        .filter((id, index, self) => self.indexOf(id) === index);
      state.totalVideos = state.videoIds.length;
      state.addedVideos = 0;
      saveState();
      addVideosToPlaylist(state.playlistId, state.videoIds);
    });
}

function addVideosToPlaylist(playlistId, videoIds) {
  function addBatch(startIndex) {
    let endIndex = Math.min(startIndex + BATCH_SIZE, state.totalVideos);
    let batchIds = videoIds.slice(startIndex, endIndex);

    let availableQuota = DAILY_QUOTA - quotaUsed;
    let batchCost = batchIds.length * PLAYLIST_ITEM_INSERT_COST;

    if (batchCost > availableQuota) {
      let possibleAdds = Math.floor(availableQuota / PLAYLIST_ITEM_INSERT_COST);
      batchIds = batchIds.slice(0, possibleAdds);
      endIndex = startIndex + possibleAdds;
    }

    if (batchIds.length === 0) {
      statusDiv.textContent = "Daily quota reached. Progress saved.";
      saveState();
      return;
    }

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
        state.addedVideos += batchIds.length;
        quotaUsed += batchIds.length * PLAYLIST_ITEM_INSERT_COST;
        updateProgress(state.addedVideos, state.totalVideos);
        updateQuotaStatus();
        saveState();

        if (endIndex < state.totalVideos && quotaUsed < DAILY_QUOTA) {
          setTimeout(() => addBatch(endIndex), DELAY_BETWEEN_BATCHES);
        } else {
          statusDiv.textContent =
            state.addedVideos === state.totalVideos
              ? "Playlist created successfully!"
              : "Daily quota reached. Partial playlist created.";
          saveState();
        }
      })
      .catch((error) => {
        statusDiv.textContent = "An error occurred: " + error;
        saveState();
      });
  }

  addBatch(state.addedVideos);
}

function updateProgress(current, total) {
  let percentage = Math.round((current / total) * 100);
  progressDiv.textContent = `Progress: ${current}/${total} videos added`;
  progressBarFill.style.width = percentage + "%";
  progressBarFill.textContent = percentage + "%";
}

function updateQuotaStatus() {
  let percentage = Math.round((quotaUsed / DAILY_QUOTA) * 100);
  quotaStatusDiv.textContent = `API Quota: ${quotaUsed}/${DAILY_QUOTA} units used (${percentage}%)`;
}

function saveState() {
  localStorage.setItem("youtubePlaylistCreatorState", JSON.stringify(state));
  localStorage.setItem("youtubePlaylistCreatorQuota", quotaUsed.toString());
}

function loadState() {
  let savedState = localStorage.getItem("youtubePlaylistCreatorState");
  let savedQuota = localStorage.getItem("youtubePlaylistCreatorQuota");

  if (savedState) {
    state = JSON.parse(savedState);
    quotaUsed = parseInt(savedQuota) || 0;
    updateProgress(state.addedVideos, state.totalVideos);
    updateQuotaStatus();

    if (state.addedVideos < state.totalVideos) {
      resumeButton.style.display = "inline-block";
    }
  }
}

modeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
  localStorage.setItem(
    "colorMode",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
});

// Set initial color mode
if (localStorage.getItem("colorMode") === "light") {
  document.body.classList.remove("dark-mode");
  document.body.classList.add("light-mode");
}

handleClientLoad();
