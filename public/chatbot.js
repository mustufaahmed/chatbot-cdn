(function () {
    function generateChatId() {
        const saved = sessionStorage.getItem("chat_id");
        if (saved) return saved;

        const timestamp = Date.now();
        const hash = btoa(navigator.userAgent).slice(0, 6);
        const chatId = `${timestamp}${hash}`;
        sessionStorage.setItem("chat_id", chatId);
        return chatId;
    }

    const chatId = generateChatId();

    const SOCKET_URL = `wss://dotzerotech.net/api/python/ws/user/chat${chatId}`;
    let socket;

    function connectSocket() {
        socket = new WebSocket(SOCKET_URL);

        socket.onopen = () => console.log("🔗 WebSocket connected");

        socket.onmessage = (event) => {
            const bubble = document.createElement("div");
            bubble.className = "chat-message-bubble";
            bubble.innerText = event.data;
            messageContainer.appendChild(bubble);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        };

        socket.onerror = (err) => console.warn("❌ WebSocket error", err);
        socket.onclose = () => console.warn("🔌 WebSocket closed");
    }

    function fetchChatHistory() {
        fetch(`https://dotzerotech.net/api/python/chat-history/chat${chatId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(item => {
                        const bubble = document.createElement("div");
                        bubble.className = "chat-message-bubble";
                        if (item.sender === 'Client') {
                            bubble.classList.add("chat-message-user");
                        }
                        bubble.innerText = item.message;
                        messageContainer.appendChild(bubble);
                    });
                }
                // else {
                //     appendBotMessage("Hello 😊");
                // }
            })
            .catch((error) => console.error("Something went wrong:", error));
    }

    function appendBotMessage(text) {
        const bubble = document.createElement("div");
        bubble.className = "chat-message-bubble";
        bubble.innerText = text;
        messageContainer.appendChild(bubble);
    }


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
      max-height: 300px;
      overflow-y: auto;
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

    .chat-message-user {
      background: #1a1aff;
      color: white;
      align-self: flex-end;
      margin-left: auto;
    }

    .chat-input-box {
      display: flex;
      border-top: 1px solid #eee;
      padding: 8px;
    }

    .chat-input-box input {
      flex: 1;
      padding: 10px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 8px;
      outline: none;
    }

    .chat-input-box button {
      background: #1a1aff;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 10px 14px;
      margin-left: 8px;
      cursor: pointer;
    }
  `;
    document.head.appendChild(style);

    // Button
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
        <div id="chat-messages">
          <div class="chat-message-bubble">Hello! How can I help you today? 😊</div>
        </div>
      </div>
    </div>
    <div class="chat-input-box" id="chat-input-area" style="display: none;">
      <input type="text" id="user-message" placeholder="Type your message..." />
      <button id="send-btn">Send</button>
    </div>
    <div class="chat-footer">
      <div id="tab-home" class="active">🏠 Home</div>
      <div id="tab-chat">💬 Chat</div>
    </div>
    <div class="chat-powered">Powered by YOU</div>
  `;
    document.body.appendChild(popup);

    // Popup toggle
    let isOpen = false;
    floatBtn.innerHTML = "💬"; // Initial icon
    floatBtn.addEventListener("click", () => {
        isOpen = !isOpen;
        popup.style.display = isOpen ? "block" : "none";
        floatBtn.innerHTML = isOpen ? "✖" : "💬";

        // if (isOpen && (!socket || socket.readyState !== 1)) {
        //     connectSocket(); // connect on open
        // }
        if (isOpen) {
            if (!socket || socket.readyState !== 1) connectSocket();
            fetchChatHistory();
        }
    });

    // Tabs
    const tabHome = document.getElementById("tab-home");
    const tabChat = document.getElementById("tab-chat");
    const sectionHome = document.getElementById("home-tab");
    const sectionChat = document.getElementById("chat-tab");
    const inputArea = document.getElementById("chat-input-area");

    tabHome.addEventListener("click", () => {
        tabHome.classList.add("active");
        tabChat.classList.remove("active");
        sectionHome.classList.add("active");
        sectionChat.classList.remove("active");
        inputArea.style.display = "none";
    });

    tabChat.addEventListener("click", () => {
        tabChat.classList.add("active");
        tabHome.classList.remove("active");
        sectionChat.classList.add("active");
        sectionHome.classList.remove("active");
        inputArea.style.display = "flex";
    });

    // Send message
    const sendBtn = document.getElementById("send-btn");
    const messageInput = document.getElementById("user-message");
    const messageContainer = document.getElementById("chat-messages");

    // sendBtn.addEventListener("click", () => {
    //     const msg = messageInput.value.trim();
    //     if (msg !== "") {
    //         const bubble = document.createElement("div");
    //         bubble.className = "chat-message-bubble chat-message-user";
    //         bubble.innerText = msg;
    //         messageContainer.appendChild(bubble);
    //         messageInput.value = "";
    //         messageContainer.scrollTop = messageContainer.scrollHeight;
    //
    //         // Send over socket
    //         socket.send(msg);
    //     }
    // });

    sendBtn.addEventListener("click", handleSend);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend(e);
    });

    function handleSend(e) {
        e.preventDefault();
        const msg = messageInput.value.trim();
        if (!msg) return;

        const bubble = document.createElement("div");
        bubble.className = "chat-message-bubble chat-message-user";
        bubble.innerText = msg;
        messageContainer.appendChild(bubble);
        messageInput.value = "";
        messageContainer.scrollTop = messageContainer.scrollHeight;

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(msg);
        }
    }

})();
