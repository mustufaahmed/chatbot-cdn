
  (function () {
  console.log("✅ Tidio-style chatbot with tabs loading...");

  const style = document.createElement("style");
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

    #chatbot-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background-color: #1a1aff;
      color: white;
      border: none;
      border-radius: 50%;
      font-size: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      z-index: 9999;
    }

    #chatbot-popup {
      font-family: 'Inter', sans-serif;
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 360px;
      max-width: 90%;
      background-color: #fff;
      border-radius: 18px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.2);
      overflow: hidden;
      z-index: 9999;
      display: none;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .chat-header {
      background-color: #1a1aff;
      color: white;
      padding: 20px;
      font-size: 18px;
      font-weight: 600;
      position: relative;
    }

    .chat-header span {
      display: block;
      font-size: 14px;
      font-weight: 400;
      margin-top: 4px;
    }

    .chat-body {
      padding: 16px;
      min-height: 240px;
    }

    .chat-section {
      display: none;
    }

    .chat-section.active {
      display: block;
    }

    .chat-prompt {
      background: #f6f8ff;
      padding: 16px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      margin-bottom: 10px;
    }

    .chat-footer {
      display: flex;
      justify-content: space-around;
      padding: 12px 0;
      border-top: 1px solid #eee;
      font-size: 14px;
    }

    .chat-footer div {
      text-align: center;
      cursor: pointer;
      color: #999;
    }

    .chat-footer div.active {
      color: #1a1aff;
      font-weight: 600;
    }

    .chat-powered {
      text-align: center;
      font-size: 10px;
      color: #ccc;
      padding: 4px;
      background: #f9f9f9;
    }

    .chat-message-bubble {
      background: #eef0ff;
      padding: 10px 14px;
      margin: 6px 0;
      border-radius: 12px;
      max-width: 75%;
    }
  `;
  document.head.appendChild(style);

  // Floating Button
  const floatBtn = document.createElement("button");
  floatBtn.id = "chatbot-float-btn";
  floatBtn.innerHTML = "✖";
  document.body.appendChild(floatBtn);

  // Popup
  const popup = document.createElement("div");
  popup.id = "chatbot-popup";
  popup.innerHTML = `
    <div class="chat-header">
      👋 Hi there
      <span>Welcome to our website. Ask us anything 🎉</span>
    </div>
    <div class="chat-body">
      <div id="home-tab" class="chat-section active">
        <div class="chat-prompt">
          <span>Chat with us<br><small style="color:gray;">We reply immediately</small></span>
          <i style="color:#1a1aff;">➤</i>
        </div>
      </div>
      <div id="chat-tab" class="chat-section">
        <div class="chat-message-bubble">Hi! How can I help you today? 😊</div>
        <div class="chat-message-bubble">We're available 24/7!</div>
      </div>
    </div>
    <div class="chat-footer">
      <div id="tab-home" class="active">🏠 Home</div>
      <div id="tab-chat">💬 Chat</div>
    </div>
    <div class="chat-powered">Powered by YOU</div>
  `;
  document.body.appendChild(popup);

  // Toggle Popup
  let isOpen = false;
  floatBtn.addEventListener("click", () => {
  isOpen = !isOpen;
  popup.style.display = isOpen ? "block" : "none";
});

  // Tab Switching
  const tabHome = document.getElementById("tab-home");
  const tabChat = document.getElementById("tab-chat");
  const sectionHome = document.getElementById("home-tab");
  const sectionChat = document.getElementById("chat-tab");

  tabHome.addEventListener("click", () => {
  tabHome.classList.add("active");
  tabChat.classList.remove("active");
  sectionHome.classList.add("active");
  sectionChat.classList.remove("active");
});

  tabChat.addEventListener("click", () => {
  tabChat.classList.add("active");
  tabHome.classList.remove("active");
  sectionChat.classList.add("active");
  sectionHome.classList.remove("active");
});
})();

