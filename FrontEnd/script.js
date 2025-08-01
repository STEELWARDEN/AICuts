// API Configuration - automatically detects environment
const API_BASE_URL = "http://127.0.0.1:5000";

document.addEventListener("DOMContentLoaded", function () {
  // NEW: Add upload form validation
  const uploadForm = document.querySelector(".upload form");
  uploadForm.addEventListener("submit", validateUploadForm);

  // Add file selection handler for visual feedback
  const fileInput = document.getElementById("photo-upload");
  fileInput.addEventListener("change", handleFileSelection);

  // Add clear file button handler
  const clearFileBtn = document.getElementById("clear-file");
  if (clearFileBtn) {
    clearFileBtn.addEventListener("click", clearFileSelection);
  }
});

function validateUploadForm(event) {
  event.preventDefault();
  const fileInput = document.getElementById("photo-upload");
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file to upload.");
    return false;
  } else if (file.size > 5 * 1024 * 1024) {
    // 5MB limit
    alert("File size must be less than 5MB.");
    return false;
  } else if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
    // Image types
    alert("Only image files (jpg, jpeg, png, gif) are allowed.");
    return false;
  } else {
    // Show loading state
    showLoadingState();

    // API approach - no page reload
    const formData = new FormData();
    formData.append("file", file);
    fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        // console.log("Response status:", response.status); // Remove for production
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // console.log("Response data:", data); // Remove for production
        // Hide loading state
        hideLoadingState();

        if (data.success) {
          // Show the results section
          const resultsSection = document.getElementById("results-section");
          resultsSection.style.display = "block";

          // Update the flip card image using ID
          const flipCardImage = document.getElementById("result-image");
          flipCardImage.src = data.image;

          // Display face shape info using IDs
          const faceShapeInfo = document.getElementById("face-shape");
          const confidenceInfo = document.getElementById("confidence");
          faceShapeInfo.textContent = `Face Shape: ${data.face_shape}`;
          confidenceInfo.textContent = `Confidence: ${(
            data.confidence * 100
          ).toFixed(1)}%`;

          toggleFaceShapeDetails(data.face_shape.toLowerCase());

          // Clear the file input
          fileInput.value = "";
        } else {
          alert(`Backend Error: ${data.message}`);
          // Don't clear file input on error - user can fix and retry
        }
      })
      .catch((error) => {
        // Hide loading state on error
        hideLoadingState();
        console.error("Upload error:", error);
        // console.error("Error details:", error.message); // Remove for production
        alert("Error uploading file. Please try again.");
      });
  }
}

function displayOriginialImage(data) {
  const fileInput = document.getElementById("image");
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById("original-image").src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please select an image file first.");
  }
}

function showResults() {
  const resultsSection = document.getElementById("results-section");
  resultsSection.style.display = "block"; // Makes it visible
}

// NEW: Handle file selection for upload preview
function handleFileSelection(event) {
  const file = event.target.files[0];
  const fileInfo = document.getElementById("file-info");
  const fileName = document.getElementById("file-name");
  const fileSize = document.getElementById("file-size");
  const uploadSection = document.querySelector(".upload");

  if (file) {
    // Show file info
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = "flex";

    // Add visual feedback to upload section
    uploadSection.classList.add("has-file");

    // Update upload button text
    const uploadButton = document.querySelector(".upload-button");
    uploadButton.textContent = "Change File";
  } else {
    clearFileSelection();
  }
}

// NEW: Clear file selection
function clearFileSelection() {
  const fileInput = document.getElementById("photo-upload");
  const fileInfo = document.getElementById("file-info");
  const uploadSection = document.querySelector(".upload");
  const uploadButton = document.querySelector(".upload-button");

  // Clear file input
  fileInput.value = "";

  // Hide file info
  fileInfo.style.display = "none";

  // Remove visual feedback
  uploadSection.classList.remove("has-file");

  // Reset upload button text
  uploadButton.textContent = "Choose File";
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// NEW: Show loading state
function showLoadingState() {
  // Get elements
  const analyzeButton = document.querySelector(".analyze-button");
  const buttonText = document.querySelector(".button-text");
  const buttonSpinner = document.querySelector(".button-spinner");
  const uploadSection = document.querySelector(".upload");

  // Update button state
  analyzeButton.classList.add("loading");
  analyzeButton.disabled = true;
  buttonText.style.display = "none";
  buttonSpinner.style.display = "flex";

  // Update upload section
  uploadSection.classList.add("processing");
  uploadSection.classList.remove("has-file");
}

// NEW: Hide loading state
function hideLoadingState() {
  // Get elements
  const analyzeButton = document.querySelector(".analyze-button");
  const buttonText = document.querySelector(".button-text");
  const buttonSpinner = document.querySelector(".button-spinner");
  const uploadSection = document.querySelector(".upload");

  // Reset button state
  analyzeButton.classList.remove("loading");
  analyzeButton.disabled = false;
  buttonText.style.display = "inline";
  buttonSpinner.style.display = "none";

  // Reset upload section
  uploadSection.classList.remove("processing");

  // Check if file is still selected to restore has-file state
  const fileInput = document.getElementById("photo-upload");
  if (fileInput.files.length > 0) {
    uploadSection.classList.add("has-file");
  }
}

function toggleFaceShapeDetails(shape) {
  // Hide all details first
  const details = document.querySelectorAll(
    ".square, .round, .oval, .rectangular"
  );
  details.forEach((detail) => {
    detail.style.display = "none";
  });

  // Show the selected shape's details
  const selectedDetail = document.querySelector(`.${shape}`);
  if (selectedDetail) {
    selectedDetail.style.display = "block";
  }

  if (shape === "square") {
    document.getElementById("CrewCut").style.display = "block";
    document.getElementById("Fade").style.display = "block";
    document.getElementById("Pompadour").style.display = "block";

    document.getElementById("Fringe").style.display = "none";
    document.getElementById("TexturedCrop").style.display = "none";
    document.getElementById("SidePart").style.display = "none";
    document.getElementById("HighFade").style.display = "none";
    document.getElementById("Quiff").style.display = "none";
    document.getElementById("Buzz").style.display = "none";
    document.getElementById("Waves").style.display = "none";
  } else if (shape === "round") {
    document.getElementById("Pompadour").style.display = "block";
    document.getElementById("HighFade").style.display = "block";
    document.getElementById("SidePart").style.display = "block";

    document.getElementById("Fringe").style.display = "none";
    document.getElementById("TexturedCrop").style.display = "none";
    document.getElementById("SidePart").style.display = "none";
    document.getElementById("Fade").style.display = "none";
    document.getElementById("Quiff").style.display = "none";
    document.getElementById("Buzz").style.display = "none";
    document.getElementById("Waves").style.display = "none";
  } else if (shape === "ovale") {
    document.getElementById("Quiff").style.display = "block";
    document.getElementById("Buzz").style.display = "block";
    document.getElementById("Waves").style.display = "block";

    document.getElementById("Pompadour").style.display = "none";
    document.getElementById("HighFade").style.display = "none";
    document.getElementById("SidePart").style.display = "none";
    document.getElementById("Fringe").style.display = "none";
    document.getElementById("TexturedCrop").style.display = "none";
    document.getElementById("SidePart").style.display = "none";
    document.getElementById("Fade").style.display = "none";
  } else if (shape === "rectangular") {
    document.getElementById("Fringe").style.display = "block";
    document.getElementById("TexturedCrop").style.display = "block";
    document.getElementById("SidePart").style.display = "block";
    document.getElementById("Quiff").style.display = "none";
    document.getElementById("Buzz").style.display = "none";
    document.getElementById("Waves").style.display = "none";

    document.getElementById("Pompadour").style.display = "none";
    document.getElementById("HighFade").style.display = "none";
    document.getElementById("SidePart").style.display = "none";
    document.getElementById("Fade").style.display = "none";
  }
}
