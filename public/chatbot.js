
  (function () {
  console.log("✅ Tidio-style chatbot loading...");

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
      text-align: left;
      font-size: 16px;
      font-weight: 600;
      position: relative;
    }

    .chat-header::after {
      content: "⋮";
      position: absolute;
      right: 16px;
      top: 16px;
      font-size: 20px;
      cursor: pointer;
    }

    .chat-header span {
      display: block;
      font-size: 20px;
      margin-top: 4px;
    }

    .chat-message {
      padding: 16px;
      background-color: white;
      font-size: 14px;
    }

    .chat-prompt {
      background: #f6f8ff;
      padding: 16px;
      border-radius: 12px;
      margin: 0 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    }

    .chat-prompt span {
      font-size: 14px;
      color: #333;
    }

    .chat-prompt i {
      font-size: 18px;
      color: #1a1aff;
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

    .chat-close-btn {
      position: absolute;
      top: 10px;
      right: 14px;
      background: transparent;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Floating button
  const floatBtn = document.createElement("button");
  floatBtn.id = "chatbot-float-btn";
  floatBtn.innerHTML = "💬";
  document.body.appendChild(floatBtn);

  // Chat popup
  const popup = document.createElement("div");
  popup.id = "chatbot-popup";
  popup.innerHTML = `
    <div class="chat-header">
      👋 Hi there
      <span>Welcome to our website. Ask us anything 🎉</span>
    </div>
    <div class="chat-message">
      <div class="chat-prompt">
        <span>Chat with us<br><small style="color:gray;">We reply immediately</small></span>
        <i>➤</i>
      </div>
    </div>
    <div class="chat-footer">
      <div class="active">🏠 Home</div>
      <div>💬 Chat</div>
    </div>
    <div class="chat-powered">Powered by YOU</div>
  `;
  document.body.appendChild(popup);

  // Toggle
  let isOpen = false;
  floatBtn.addEventListener("click", () => {
  isOpen = !isOpen;
  popup.style.display = isOpen ? "block" : "none";
});
})();

