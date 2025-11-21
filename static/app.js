// ===========================
// DOM Elements
// ===========================
const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");
const submitBtn = document.getElementById("submitBtn");
const btnText = submitBtn.querySelector(".btn-text");
const spinner = submitBtn.querySelector(".spinner");
const btnIcon = submitBtn.querySelector(".btn-icon");
const chatMessages = document.getElementById("chatMessages");
const welcomeScreen = document.getElementById("welcomeScreen");
const messagesWrapper = document.querySelector(".messages-wrapper");
const toastContainer = document.getElementById("toastContainer");
const clearChatBtn = document.getElementById("clearChatBtn");

// API endpoint
const API_URL = "/api/ask";

// Chat history
let conversationHistory = [];
let isLoading = false;

// ===========================
// Event Listeners
// ===========================

// Form submission
questionForm.addEventListener("submit", handleSubmit);

// Auto-resize textarea on input
questionInput.addEventListener("input", autoResizeTextarea);

// Handle Shift+Enter for new line, Enter for submit
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    questionForm.dispatchEvent(new Event("submit"));
  }
});

// Clear chat button
if (clearChatBtn) {
  clearChatBtn.addEventListener("click", clearChat);
}

// Navigation items
document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", handleNavigation);
});

// ===========================
// Main Functions
// ===========================

/**
 * Handle form submission
 */
async function handleSubmit(e) {
  e.preventDefault();

  const question = questionInput.value.trim();

  if (!question || isLoading) {
    return;
  }

  // Hide welcome screen
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }

  // Add user message
  addUserMessage(question);

  // Clear input
  questionInput.value = "";
  questionInput.style.height = "auto";

  // Update UI state
  setLoadingState(true);
  addTypingIndicator();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    removeTypingIndicator();

    if (response.ok) {
      addAIMessage(data.answer);

      conversationHistory.push({
        question,
        answer: data.answer,
        timestamp: new Date(),
      });

      showToast("Message sent successfully", "success");
    } else {
      addErrorMessage(data.error || "An error occurred while getting the answer.");
      showToast(data.error || "Error", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    removeTypingIndicator();
    addErrorMessage(
      "Failed to connect to the server. Please make sure the backend is running."
    );
    showToast("Connection error", "error");
  } finally {
    setLoadingState(false);
  }
}

/**
 * Auto-resize textarea
 */
function autoResizeTextarea() {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 150) + "px";
}

/**
 * Add user message to chat
 */
function addUserMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message message-user";
  messageDiv.innerHTML = `
    <div>
      <div class="message-label">You</div>
      <div class="message-content">${escapeHtml(text)}</div>
    </div>
  `;
  chatMessages.appendChild(messageDiv);
}

/**
 * Add AI message to chat
 */
function addAIMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message message-ai";
  messageDiv.innerHTML = `
    <div>
      <div class="message-label">AI Assistant</div>
      <div class="message-content">${formatText(text)}</div>
    </div>
  `;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

/**
 * Add typing indicator
 */
function addTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message message-ai";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = `
    <div>
      <div class="message-label">AI Assistant</div>
      <div class="message-content">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    </div>
  `;
  chatMessages.appendChild(typingDiv);
  scrollToBottom();
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

/**
 * Add error message
 */
function addErrorMessage(text) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "message message-error";
  errorDiv.innerHTML = `
    <div>
      <div class="message-label">Error</div>
      <div class="message-content">${escapeHtml(text)}</div>
    </div>
  `;
  chatMessages.appendChild(errorDiv);
  scrollToBottom();
}

/**
 * Set loading state
 */
function setLoadingState(loading) {
  isLoading = loading;
  submitBtn.disabled = loading;
  spinner.classList.toggle("hidden", !loading);
  btnIcon.classList.toggle("hidden", loading);
  btnText.textContent = loading ? "Sending..." : "Send";
}

/**
 * Scroll to bottom of messages
 */
function scrollToBottom() {
  messagesWrapper.scrollTop = messagesWrapper.scrollHeight;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Format text with basic markdown support
 */
function formatText(text) {
  let formatted = escapeHtml(text);
  
  // Convert URLs to links
  formatted = formatted.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener">$1</a>'
  );
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, "<br>");
  
  return formatted;
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  }[type] || "●";
  
  toast.innerHTML = `
    <span style="font-weight: bold; font-size: 1.2em;">${icon}</span>
    <span>${escapeHtml(message)}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease-out forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Clear chat history
 */
function clearChat() {
  if (
    confirm("Are you sure you want to clear the chat? This cannot be undone.")
  ) {
    chatMessages.innerHTML = "";
    welcomeScreen.style.display = "flex";
    conversationHistory = [];
    showToast("Chat cleared", "info");
  }
}

/**
 * Handle navigation
 */
function handleNavigation(e) {
  const view = e.currentTarget.getAttribute("data-view");
  
  // Update active nav item
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });
  e.currentTarget.classList.add("active");
  
  // Handle different views (can be extended)
  switch (view) {
    case "chat":
      showChat();
      break;
    case "history":
      showHistory();
      break;
    case "settings":
      showSettings();
      break;
  }
}

/**
 * Show chat view
 */
function showChat() {
  document.querySelector(".chat-container").style.display = "flex";
  showToast("Chat view opened", "info");
}

/**
 * Show history view
 */
function showHistory() {
  if (conversationHistory.length === 0) {
    showToast("No chat history", "info");
    return;
  }
  
  const historyText = conversationHistory
    .map(
      (item, idx) => `
    Q${idx + 1}: ${item.question}
    A${idx + 1}: ${item.answer}
    ---
  `
    )
    .join("\n");
  
  console.log("Chat History:", historyText);
  showToast(`${conversationHistory.length} messages in history`, "info");
}

/**
 * Show settings view
 */
function showSettings() {
  showToast("Settings (not implemented yet)", "info");
}

/**
 * Initialize app
 */
function initializeApp() {
  console.log("AI Q&A Assistant initialized");
  showToast("Welcome to AI Q&A Assistant", "success");
}

// Initialize on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
