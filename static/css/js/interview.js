const chat = document.getElementById("chat");
const textarea = document.getElementById("answer");
const sendBtn = document.getElementById("send-btn");

const sessionId = window.location.pathname.split("/")[2]; // /interview/22/...

// auto grow textarea
textarea.addEventListener("input", () => {
  textarea.style.height = "auto";
  textarea.style.height = textarea.scrollHeight + "px";
});

// Enter to send
textarea.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendAnswer();
  }
});

sendBtn.addEventListener("click", sendAnswer);

async function sendAnswer() {
  const answer = textarea.value.trim();
  if (!answer) return;

  setLoading(true);

  appendUserMessage(answer);

  try {
    const res = await fetch(`/interview/${sessionId}/submit/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: new URLSearchParams({ answer }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    // AI feedback
    appendAIMessage(data.feedback);

    // Next question
    if (data.next_question) {
      appendAIQuestion(data.next_question, data.next_question_number);
    }

    updateProgress(data);

  } catch (err) {
    console.error(err);
    alert("Network error");
  }

  textarea.value = "";
  textarea.style.height = "auto";
  setLoading(false);
}

function appendUserMessage(text) {
  chat.insertAdjacentHTML(
    "beforeend",
    `
    <div class="message user">
      <div class="avatar">You</div>
      <div class="message-content">
        <div class="bubble">${text}</div>
      </div>
    </div>
    `
  );
  scrollBottom();
}

function appendAIMessage(text) {
  chat.insertAdjacentHTML(
    "beforeend",
    `
    <div class="message ai">
      <div class="avatar">N</div>
      <div class="message-content">
        <div class="bubble">
          <strong>Feedback</strong>
          <p>${text}</p>
        </div>
      </div>
    </div>
    `
  );
  scrollBottom();
}

function appendAIQuestion(text, number) {
  chat.insertAdjacentHTML(
    "beforeend",
    `
    <div class="message ai">
      <div class="avatar">N</div>
      <div class="message-content">
        <div class="bubble">
          <span class="q-tag">Question ${number}</span>
          <p>${text}</p>
        </div>
      </div>
    </div>
    `
  );
  scrollBottom();
}

function updateProgress(data) {
  if (!data.current_question || !data.total_questions) return;

  const percent =
    (data.current_question / data.total_questions) * 100;

  const bar = document.getElementById("railFill");
  const current = document.getElementById("current-number");

  if (bar) bar.style.width = percent + "%";
  if (current) current.innerText = data.current_question;
}

function setLoading(state) {
  sendBtn.disabled = state;
  sendBtn.innerText = state ? "Thinking..." : "Send";
}

function scrollBottom() {
  chat.scrollTop = chat.scrollHeight;
}

// CSRF helper
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie) {
    document.cookie.split(";").forEach((c) => {
      c = c.trim();
      if (c.startsWith(name + "=")) {
        cookieValue = decodeURIComponent(c.substring(name.length + 1));
      }
    });
  }
  return cookieValue;
}