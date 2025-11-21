// Get DOM elements
const questionForm = document.getElementById("questionForm");
const questionInput = document.getElementById("questionInput");
const submitBtn = document.getElementById("submitBtn");
const btnIcon = submitBtn.querySelector(".btn-icon");
const spinner = submitBtn.querySelector(".spinner");
const chatMessages = document.getElementById("chatMessages");
const welcomeScreen = document.getElementById("welcomeScreen");

// API endpoint
const API_URL = "/api/ask";

// Chat history
let conversationHistory = [];

// Auto-resize textarea
questionInput.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = this.scrollHeight + "px";
});

// Form submit handler
questionForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();

  if (!question) {
    return;
  }

  // Hide welcome screen
  if (welcomeScreen) {
    welcomeScreen.style.display = "none";
  }

  // Add user message to chat
  addUserMessage(question);

  // Clear input
  questionInput.value = "";
  questionInput.style.height = "auto";

  // Show loading state
  setLoadingState(true);
  addTypingIndicator();

  try {
    // Send request to backend
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question: question }),
    });

    const data = await response.json();

    // Remove typing indicator
    removeTypingIndicator();

    if (response.ok) {
      // Add AI response to chat
      addAIMessage(data.answer);

      // Save to history
      conversationHistory.push({
        question: question,
        answer: data.answer,
        timestamp: new Date(),
      });
    } else {
      // Show error message
      addErrorMessage(
        data.error || "An error occurred while getting the answer."
      );
    }
  } catch (error) {
    console.error("Error:", error);
    removeTypingIndicator();
    addErrorMessage(
      "Failed to connect to the server. Please make sure the backend is running."
    );
  } finally {
    setLoadingState(false);
  }
});

// Add user message to chat
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
  scrollToBottom();
}

// Add AI message to chat
function addAIMessage(text) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message message-ai";
  messageDiv.innerHTML = `
        <div>
            <div class="message-label">AI CHAT BOT</div>
            <div class="message-content">${escapeHtml(text)}</div>
        </div>
    `;
  chatMessages.appendChild(messageDiv);
  scrollToBottom();
}

// Add typing indicator
function addTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "message message-ai";
  typingDiv.id = "typingIndicator";
  typingDiv.innerHTML = `
        <div>
            <div class="message-label">AI CHAT BOT</div>
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

// Remove typing indicator
function removeTypingIndicator() {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}

// Add error message
function addErrorMessage(text) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.textContent = text;
  chatMessages.appendChild(errorDiv);
  scrollToBottom();

  // Remove error after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Set loading state
function setLoadingState(isLoading) {
  submitBtn.disabled = isLoading;
  questionInput.disabled = isLoading;

  if (isLoading) {
    btnIcon.style.display = "none";
    spinner.style.display = "block";
  } else {
    btnIcon.style.display = "block";
    spinner.style.display = "none";
  }
}

// Scroll to bottom of chat
function scrollToBottom() {
  const chatMain = document.querySelector(".chat-main");
  setTimeout(() => {
    chatMain.scrollTop = chatMain.scrollHeight;
  }, 100);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, "<br>");
}

// Handle Enter key (Submit on Enter, Shift+Enter for new line)
questionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    questionForm.dispatchEvent(new Event("submit"));
  }
});

// Focus input on load
window.addEventListener("load", () => {
  questionInput.focus();
});
