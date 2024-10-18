// To like or not to like. API and ToS investigation.

// Configuration constants
const CLIENT_ID = "YOUR_CLIENT_ID_HERE";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest",
];
const SCOPES = "https://www.googleapis.com/auth/youtube.force-ssl";

// Pagination settings
const BATCH_SIZE = 50; // Number of videos to add in each batch
const DELAY_BETWEEN_BATCHES = 10000; // Delay between batches in milliseconds (10 seconds)

// Add these constants after the existing constants
const DAILY_QUOTA = 10000; // Default daily quota for free tier
const PLAYLIST_INSERT_COST = 50; // Cost to create a new playlist
const PLAYLIST_ITEM_INSERT_COST = 50; // Cost to add an item to a playlist

// DOM element references
let authorizeButton = document.getElementById("createPlaylist");
let fileInput = document.getElementById("fileInput");
let statusDiv = document.getElementById("status");
let progressDiv = document.getElementById("progress");
let progressBarFill = document.getElementById("progressBarFill");

// Add this variable with the other DOM element references
let quotaStatusDiv = document.getElementById("quotaStatus");

// Add this variable after the DOM element references
let quotaUsed = 0;

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
  const file = fileInput.files[0];
  const fileError = validateFile(file);
  if (fileError) {
    statusDiv.textContent = fileError;
    return;
  }

  const privacyStatus = privacySelect.value;
  if (!["public", "unlisted", "private"].includes(privacyStatus)) {
    statusDiv.textContent = "Invalid privacy status selected.";
    return;
  }

  gapi.auth2
    .getAuthInstance()
    .signIn()
    .then(function () {
      statusDiv.textContent = "Processing file...";
      processFile(file, privacyStatus);
    })
    .catch(function (error) {
      statusDiv.textContent = "Authentication failed: " + error.message;
    });
}

// Process the uploaded ZIP file
function processFile(file, privacyStatus) {
  let zip = new JSZip();
  zip
    .loadAsync(file)
    .then(function (contents) {
      return contents
        .file("Takeout/YouTube and YouTube Music/history/watch-history.json")
        .async("string");
    })
    .then(function (content) {
      try {
        let watchHistory = JSON.parse(content);
        createPlaylist(watchHistory, privacyStatus);
      } catch (error) {
        statusDiv.textContent = "Error parsing watch history: " + error.message;
      }
    })
    .catch(function (error) {
      statusDiv.textContent = "Error processing ZIP file: " + error.message;
    });
}

// Create a new playlist
function createPlaylist(watchHistory, privacyStatus) {
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
          privacyStatus: privacyStatus,
        },
      },
    })
    .then(function (response) {
      quotaUsed += PLAYLIST_INSERT_COST;
      updateQuotaStatus();
      let playlistId = response.result.id;
      addVideosToPlaylist(playlistId, watchHistory);
    })
    .catch(function (error) {
      statusDiv.textContent = "Error creating playlist: " + error.message;
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

    let availableQuota = DAILY_QUOTA - quotaUsed;
    let batchCost = batchIds.length * PLAYLIST_ITEM_INSERT_COST;

    if (batchCost > availableQuota) {
      let possibleAdds = Math.floor(availableQuota / PLAYLIST_ITEM_INSERT_COST);
      batchIds = batchIds.slice(0, possibleAdds);
      endIndex = startIndex + possibleAdds;
    }

    if (batchIds.length === 0) {
      let now = new Date();
      let resetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      let timeUntilReset = resetTime - now;
      let hoursUntilReset = Math.ceil(timeUntilReset / (1000 * 60 * 60));

      statusDiv.textContent = `Daily quota reached. Progress saved. Quota will reset in approximately ${hoursUntilReset} hours.`;
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
        addedVideos += batchIds.length;
        quotaUsed += batchIds.length * PLAYLIST_ITEM_INSERT_COST;
        updateProgress(addedVideos, totalVideos);
        updateQuotaStatus();

        if (endIndex < totalVideos && quotaUsed < DAILY_QUOTA) {
          setTimeout(() => addBatch(endIndex), DELAY_BETWEEN_BATCHES);
        } else {
          statusDiv.textContent =
            addedVideos === totalVideos
              ? "Playlist created successfully!"
              : "Daily quota reached. Partial playlist created.";
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

// Add this new function at the end of the file
function updateQuotaStatus() {
  let percentage = Math.round((quotaUsed / DAILY_QUOTA) * 100);
  quotaStatusDiv.textContent = `API Quota: ${quotaUsed}/${DAILY_QUOTA} units used (${percentage}%)`;
}

function validateFile(file) {
  if (!file) {
    return "Please select a file.";
  }
  if (
    file.type !== "application/zip" &&
    file.type !== "application/x-zip-compressed"
  ) {
    return "Please upload a ZIP file.";
  }
  if (file.size > 100 * 1024 * 1024) {
    return "File size should not exceed 100MB.";
  }
  return null;
}

// Start the client load process when the script is executed
handleClientLoad();
