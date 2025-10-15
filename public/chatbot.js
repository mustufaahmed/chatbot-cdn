(function () {
    // 🔹 Step 1: Extract secret key from script URL
    function getSecretKey() {
        const scripts = document.getElementsByTagName("script");
        const current = Array.from(scripts).find(s => s.src.includes("chatbot.js"));
        if (!current) return null;
        const qs = current.src.split("?")[1] || "";
        const urlParams = new URLSearchParams(qs);
        return urlParams.get("key");
    }
    const SECRET_KEY = getSecretKey();

    const API_URL = 'https://dotzerotech.net';
    const DOMAIN = window.location.hostname;

    // 🔹 Generate Chat ID
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

    // 🔹 WebSocket URL
    const SOCKET_URL = `wss://dotzerotech.net/api/ws/chat`;
    let socket;

    function connectSocket() {
        if (!SECRET_KEY) {
            console.warn("No SECRET_KEY found for websocket.");
            return;
        }
        const url = `${SOCKET_URL}?token=${SECRET_KEY}&domain=${DOMAIN}&chatId=${chatId}`;
        socket = new WebSocket(url);

        socket.onopen = () => console.log("🔗 WebSocket connected");

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // If server sends explicit typing events, handle them:
                if (data.type === "typing") {
                    if (data.status === "start") showTyping();
                    else hideTyping();
                    return;
                }

                if (data.type === "chat") {
                    hideTyping(); // hide typing when real message arrives
                    appendBotMessage(data.message);
                } else {
                    // fallback: treat message as chat text
                    if (data.message) {
                        hideTyping();
                        appendBotMessage(data.message);
                    }
                }
            } catch (err) {
                // if not JSON, just append raw text
                hideTyping();
                appendBotMessage(event.data);
            }
        };

        socket.onerror = (err) => console.warn("❌ WebSocket error", err);
        socket.onclose = () => console.warn("🔌 WebSocket closed");
    }

    // 🔹 Auto Scroll Function (target the actual scroll container)
    function autoScroll() {
        const chatBody = document.querySelector(".chat-body");
        if (chatBody) {
            // small delay to let DOM render new msg
            setTimeout(() => {
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 60);
        }
    }

    function fetchChatHistory() {
        fetch(`${API_URL}/api/chatbot/chat-history/${chatId}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    data.forEach(item => {
                        const bubble = document.createElement("div");
                        bubble.className = "chat-message-bubble";
                        if (item.sender === 'Client') bubble.classList.add("chat-message-user");
                        bubble.innerText = item.message;
                        messageContainer.appendChild(bubble);
                    });
                    autoScroll();
                }
            })
            .catch((error) => console.error("Something went wrong:", error));
    }

    function appendBotMessage(text) {
        const bubble = document.createElement("div");
        bubble.className = "chat-message-bubble";
        bubble.innerText = text;
        messageContainer.appendChild(bubble);
        autoScroll();
    }

    // 🔹 Typing Indicator (create / remove)
    function createTypingElement() {
        const wrap = document.createElement("div");
        wrap.className = "typing-indicator";
        wrap.setAttribute("data-typing", "1");
        wrap.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        return wrap;
    }

    function showTyping() {
        // prevent duplicate
        if (messageContainer.querySelector(".typing-indicator")) return;
        const el = createTypingElement();
        messageContainer.appendChild(el);
        autoScroll();
    }

    function hideTyping() {
        const ex = messageContainer.querySelector(".typing-indicator");
        if (ex) ex.remove();
    }

    // 🔹 Styles
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
      border-top-left-radius: 18px;
      border-top-right-radius: 18px;
    }

    .chat-header span {
      display: block;
      font-size: 14px;
      font-weight: 400;
      margin-top: 4px;
    }

    .chat-body {
      padding: 12px 16px;
      min-height: 240px;
      max-height: 320px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 6px;
      background: #fff;
    }

    .chat-message-bubble {
      background: #eef0ff;
      padding: 10px 14px;
      border-radius: 12px;
      max-width: 75%;
      word-wrap: break-word;
      margin: 10px 0px;
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
      gap: 8px;
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
      cursor: pointer;
    }

    .chat-powered {
      text-align: center;
      font-size: 10px;
      color: #666;
      padding: 6px 8px;
      background: #fafafa;
    }

    /* Typing indicator style */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 12px;
      background: #eef0ff;
      max-width: 35%;
    }
    .typing-dot {
      width: 8px;
      height: 8px;
      background: #999;
      border-radius: 50%;
      animation: typing-bounce 1.2s infinite;
      opacity: 0.6;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .typing-dot:nth-child(3) { animation-delay: 0.3s; }

    @keyframes typing-bounce {
      0% { transform: translateY(0); opacity: 0.6; }
      30% { transform: translateY(-6px); opacity: 1; }
      60% { transform: translateY(0); opacity: 0.6; }
      100% { transform: translateY(0); opacity: 0.6; }
    }
  `;
    document.head.appendChild(style);

    // 🔹 UI Elements
    const floatBtn = document.createElement("button");
    floatBtn.id = "chatbot-float-btn";
    floatBtn.innerHTML = "💬";
    document.body.appendChild(floatBtn);

    const popup = document.createElement("div");
    popup.id = "chatbot-popup";
    popup.innerHTML = `
      <div class="chat-header">👋 Hi there
        <span>Welcome to our website. Ask us anything 🎉</span>
      </div>
      <div class="chat-body">
        <div id="chat-messages"></div>
      </div>
      <div class="chat-input-box">
        <input type="text" id="user-message" placeholder="Type your message..." />
        <button id="send-btn">Send</button>
      </div>
      <div class="chat-powered">Powered by YOU</div>
    `;
    document.body.appendChild(popup);

    // 🔹 Message system
    const messageContainer = popup.querySelector("#chat-messages");
    const messageInput = popup.querySelector("#user-message");
    const sendBtn = popup.querySelector("#send-btn");

    // Toggle chat window
    let isOpen = false;
    floatBtn.addEventListener("click", () => {
        isOpen = !isOpen;
        popup.style.display = isOpen ? "block" : "none";
        floatBtn.innerHTML = isOpen ? "✖" : "💬";
        if (isOpen) {
            if (!socket || socket.readyState !== 1) connectSocket();
            fetchChatHistory();
            autoScroll();
        }
    });

    // Send message
    function handleSend(e) {
        e?.preventDefault();
        const msg = messageInput.value.trim();
        if (!msg) return;

        // Append user bubble
        const bubble = document.createElement("div");
        bubble.className = "chat-message-bubble chat-message-user";
        bubble.innerText = msg;
        messageContainer.appendChild(bubble);
        messageInput.value = "";
        autoScroll();

        // Show typing indicator while waiting for reply
        showTyping();

        // Send via websocket if available
        if (socket && socket.readyState === WebSocket.OPEN) {
            // sending a JSON helps server know it's client text
            try {
                socket.send(JSON.stringify({ type: "chat", message: msg }));
            } catch (err) {
                // fallback: send raw
                socket.send(msg);
            }
        } else {
            // If socket not connected, optionally call API fallback
            // simulate a bot reply after 1.5s for UX (remove if server handles)
            setTimeout(() => {
                hideTyping();
                appendBotMessage("Sorry, I'm currently offline. We'll respond shortly.");
            }, 1500);
        }
    }

    sendBtn.addEventListener("click", handleSend);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend(e);
    });
})();
