const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadButton = document.querySelector("#file-upload");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

let userFile = null;

// Create message element
function createMessageElement(content, classes = []) {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

// Bot response (demo)
function generateBotResponse(userText) {
  userText = userText.toLowerCase();
  if (userText.includes("hi") || userText.includes("hello")) return "Hello! How are you?";
  if (userText.includes("how are you")) return "I'm just a bot, but doing great! 😊";
  if (userText.includes("name")) return "I'm Chatbot 🤖";
  return `This is a demo response to: ${userText}`;
}

// Send message
function sendMessage(e) {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text && !userFile) return;

  // User message
  let messageContent = "";
  if (text) {
    messageContent += `<div class="message-text">${text}</div>`;
  }

  if (userFile) {
    const { file, type } = userFile;

    if (type.startsWith("image/")) {
      messageContent += `<img src="${URL.createObjectURL(file)}" class="attachment" />`;
    } else if (type === "application/pdf") {
      messageContent += `<iframe src="${URL.createObjectURL(file)}" class="attachment" style="width:100%;height:200px;border:none;border-radius:10px;"></iframe>`;
    } else {
      messageContent += `<a href="${URL.createObjectURL(file)}" download="${file.name}" class="attachment">${file.name}</a>`;
    }

    userFile = null;
  }

  const userMessageDiv = createMessageElement(messageContent, ["user-message"]);
  chatBody.appendChild(userMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Bot thinking
  const botMessageDiv = createMessageElement(
    `<div class="message-text">...</div>`,
    ["bot-message"]
  );
  chatBody.appendChild(botMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Bot response
  setTimeout(() => {
    botMessageDiv.querySelector(".message-text").innerText = generateBotResponse(text);
  }, 800);

  messageInput.value = "";
}

// Event listeners
sendMessageButton.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) sendMessage(e);
});

// File upload
fileUploadButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  userFile = { file, type: file.type };
});

// Toggle chatbot
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
