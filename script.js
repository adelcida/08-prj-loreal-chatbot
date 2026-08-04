/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const currentQueryEl = document.getElementById("currentQuery");

// Add one message bubble to the chat window.
const appendMessage = (roleClass, text) => {
  const row = document.createElement("div");
  row.className = "msg-row";

  const bubble = document.createElement("div");
  bubble.className = `msg-bubble ${roleClass}`;
  bubble.textContent = text;

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
};

// Set initial message
appendMessage("ai", "Hello! How can I help you today?");

const workerUrl = 'https://wanderbot-worker.anthonyamaya201.workers.dev/';

let messages = [
  { role: 'system', content: `You are a L/’Oréal product advisor, specializing in their products. You help users find what L/’Oréal products are right for them, the routines they can make with those products, and recommendations.

  If a user's query is unrelated to L/’Oréal or not wanting to use L/’Oréal products for routines or recommendtaions and beauty topics, politely refurse to answer the questions.`}
];

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userText = userInput.value.trim();
  if (!userText) return;

  // update the current-query preview
  if (currentQueryEl) currentQueryEl.textContent = userText;

  appendMessage("user", userText);
  userInput.value = "";

  // When using Cloudflare, you'll need to POST a `messages` array in the body,
  // and handle the response using: data.choices[0].message.content
  messages.push({ role: 'user', content: userText });

  try {
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    const replyText = result.choices[0].message.content;

    messages.push({ role: 'assistant', content: replyText });
    appendMessage("ai", replyText);

  } catch (error) {
    console.error('Error:', error); // Log the error
    appendMessage("ai", "Sorry, something went wrong. Please try again later.");
  }
});
