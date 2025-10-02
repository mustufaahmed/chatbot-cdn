(function () {
    // 🔹 Step 1: Extract secret key from script URL
    function getSecretKey() {
        const scripts = document.getElementsByTagName("script");
        const current = Array.from(scripts).find(s => s.src.includes("chatbot.js"));
        const urlParams = new URLSearchParams(current.src.split("?")[1]);
        return urlParams.get("key");
    }
    const SECRET_KEY = getSecretKey();

    // 🔹 Step 2: Get current domain
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

    // 🔹 Validate secret key + domain with backend
    async function validateChatbot() {
        try {
            const res = await fetch("https://dotzerotech.net/api/validate-widget", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    secret_key: SECRET_KEY,
                    domain: DOMAIN
                })
            });
            const data = await res.json();
            return data?.valid === true;
        } catch (err) {
            console.error("❌ Validation failed:", err);
            return false;
        }
    }

    function connectSocket() {
        const url = `${SOCKET_URL}?token=${SECRET_KEY}&domain=${DOMAIN}&chatId=${chatId}`;
        socket = new WebSocket(url);

        socket.onopen = () => console.log("🔗 WebSocket connected");

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "chat"){
                const bubble = document.createElement("div");
                bubble.className = "chat-message-bubble";
                bubble.innerText = data.message;
                messageContainer.appendChild(bubble);
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
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
            })
            .catch((error) => console.error("Something went wrong:", error));
    }

    function appendBotMessage(text) {
        const bubble = document.createElement("div");
        bubble.className = "chat-message-bubble";
        bubble.innerText = text;
        messageContainer.appendChild(bubble);
    }

    // 🔹 Styles
    const style = document.createElement("style");
    style.innerHTML = `
      /* (same CSS as your version – omitted for brevity) */
    `;
    document.head.appendChild(style);

    // 🔹 UI Elements (same as your version)
    const floatBtn = document.createElement("button");
    floatBtn.id = "chatbot-float-btn";
    floatBtn.innerHTML = "✖";
    document.body.appendChild(floatBtn);

    const popup = document.createElement("div");
    popup.id = "chatbot-popup";
    popup.innerHTML = `
      <div class="chat-header">👋 Hi there
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
          <div id="chat-messages"></div>
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

    // 🔹 Tab Handling
    let isOpen = false;
    floatBtn.innerHTML = "💬";
    floatBtn.addEventListener("click", async () => {
        isOpen = !isOpen;
        popup.style.display = isOpen ? "block" : "none";
        floatBtn.innerHTML = isOpen ? "✖" : "💬";

        if (isOpen) {
            const valid = await validateChatbot();
            if (!valid) {
                console.warn("❌ Chatbot not authorized for this domain");
                appendBotMessage("This chatbot is not authorized for this website.");
                return;
            }
            if (!socket || socket.readyState !== 1) connectSocket();
            fetchChatHistory();
        }
    });

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

    // 🔹 Send Message
    const sendBtn = document.getElementById("send-btn");
    const messageInput = document.getElementById("user-message");
    const messageContainer = document.getElementById("chat-messages");

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

    sendBtn.addEventListener("click", handleSend);
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSend(e);
    });
})();