(function () {
    // ✅ Step 1: Load Markdown Parser (Marked.js)
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    document.head.appendChild(script);

    script.onload = function () {

        let socket = null;   // ✅ TOP LEVEL DECLARATION

        // Configure Markdown rendering
        marked.setOptions({
            breaks: true,
            gfm: true,
        });

        // 🔹 Step 2: Extract secret key and website from script URL
        function getParams() {
            const scripts = document.getElementsByTagName("script");
            const current = Array.from(scripts).find((s) => s.src.includes("chatbot.js"));
            if (!current) {
                console.warn("⚠️ chatbot.js script tag not found");
                return { key: null, website: null };
            }
            const qs = current.src.split("?")[1] || "";
            const urlParams = new URLSearchParams(qs);
            const key = urlParams.get("key");
            
            // Extract and clean website parameter
            let website = urlParams.get("website");
            if (!website) {
                website = window.location.hostname;
            } else {
                // Clean website: remove protocol, port, path, trailing slash
                website = website.replace(/^https?:\/\//, '')
                                 .replace(/^www\./, '')
                                 .split('/')[0]
                                 .split(':')[0]
                                 .toLowerCase()
                                 .trim();
            }
            
            console.log('🔑 Extracted params:', { 
                key: key ? '***' + key.slice(-4) : 'MISSING', 
                website, 
                scriptSrc: current.src 
            });
            
            return { key, website };
        }

        const { key: SECRET_KEY, website: WEBSITE } = getParams();
        
        // Use localhost for development, production URL for production
        // Backend is running on port 3000 (as per user's terminal log)
        const getBackendUrl = () => {
            if (window.$chatbot_widget?.apiUrl) return window.$chatbot_widget.apiUrl;
            if (window.location.hostname === 'localhost') {
                // Backend runs on port 3000
                return "http://localhost:3000";
            }
            return "https://dashboard.dotzerotech.net";
        };
        const API_URL = getBackendUrl();
        const DOMAIN = window.location.origin;
        
        console.log('🌐 API URL:', API_URL);
        console.log('🌐 Website:', WEBSITE);
        console.log('🌐 Domain:', DOMAIN);

        // 🔹 Fetch Widget Configuration
        let widgetConfig = null;
        async function fetchWidgetConfig() {
            try {
                console.log('🔍 Fetching widget config for website:', WEBSITE);
                console.log('🔍 API URL:', `${API_URL}/api/widget-customize/public/${encodeURIComponent(WEBSITE)}`);
                
                const response = await fetch(`${API_URL}/api/widget-customize/public/${encodeURIComponent(WEBSITE)}`);
                const data = await response.json();
                
                console.log('📦 Widget config response:', data);
                
                if (data.success && data.data) {
                    widgetConfig = data.data;
                    console.log('✅ Widget config loaded:', widgetConfig);
                    applyWidgetConfig();
                } else {
                    console.warn('⚠️ No widget config found for website:', WEBSITE);
                }
            } catch (error) {
                console.error("❌ Failed to fetch widget config:", error);
            }
        }

        // 🔹 Apply Widget Configuration
        function applyWidgetConfig() {
            if (!widgetConfig) {
                console.warn('⚠️ No widget config to apply');
                return;
            }

            console.log('🎨 Applying widget config:', widgetConfig);

            // Update header color and apply to send button and float icon
            if (widgetConfig.widget_header_color) {
                const header = document.querySelector('.chat-header');
                if (header) {
                    header.style.backgroundColor = widgetConfig.widget_header_color;
                    console.log('✅ Header color applied:', widgetConfig.widget_header_color);
                } else {
                    console.warn('⚠️ Header element not found');
                }
                
                // Apply header color to send button
                const sendBtn = document.getElementById('send-btn');
                if (sendBtn) {
                    sendBtn.style.backgroundColor = widgetConfig.widget_header_color;
                    sendBtn.style.borderColor = widgetConfig.widget_header_color;
                    console.log('✅ Send button color applied:', widgetConfig.widget_header_color);
                } else {
                    console.warn('⚠️ Send button element not found');
                }
                
                // Apply header color to float icon button
                const floatBtn = document.getElementById('chatbot-float-btn');
                if (floatBtn) {
                    floatBtn.style.backgroundColor = widgetConfig.widget_header_color;
                    console.log('✅ Float icon color applied:', widgetConfig.widget_header_color);
                } else {
                    console.warn('⚠️ Float icon element not found');
                }
            }

            // Update company name and logo
            const headerTitle = document.querySelector('.chat-header');
            if (headerTitle) {
                if (widgetConfig.company_name) {
                    const logoHtml = widgetConfig.company_logo 
                        ? `<img src="${widgetConfig.company_logo}" alt="${widgetConfig.company_name}" style="width:24px;height:24px;border-radius:50%;margin-right:8px;vertical-align:middle;object-fit:cover;" />${widgetConfig.company_name}`
                        : `👋 ${widgetConfig.company_name}`;
                    
                    // Preserve the span for welcome message
                    const existingSpan = headerTitle.querySelector('span');
                    headerTitle.innerHTML = logoHtml;
                    if (existingSpan || widgetConfig.header_welcome_message) {
                        const span = document.createElement('span');
                        span.textContent = widgetConfig.header_welcome_message || 'Welcome to our website. Ask us anything';
                        headerTitle.appendChild(span);
                    }
                    console.log('✅ Company name/logo applied:', widgetConfig.company_name);
                }

                // Update welcome message
                if (widgetConfig.header_welcome_message) {
                    let headerSpan = headerTitle.querySelector('span');
                    if (!headerSpan) {
                        headerSpan = document.createElement('span');
                        headerTitle.appendChild(headerSpan);
                    }
                    headerSpan.textContent = widgetConfig.header_welcome_message;
                    console.log('✅ Welcome message applied:', widgetConfig.header_welcome_message);
                }
            } else {
                console.warn('⚠️ Header title element not found');
            }

            // Update powered by
            const poweredBy = document.querySelector('.chat-powered');
            if (poweredBy) {
                if (widgetConfig.powered_by === 'hide') {
                    poweredBy.style.display = 'none';
                    console.log('✅ Powered by hidden');
                } else if (widgetConfig.powered_by === 'customize' && widgetConfig.powered_by_custom_name) {
                    poweredBy.textContent = `Powered by ${widgetConfig.powered_by_custom_name}`;
                    console.log('✅ Powered by customized:', widgetConfig.powered_by_custom_name);
                } else {
                    console.log('✅ Powered by default (show)');
                }
            } else {
                console.warn('⚠️ Powered by element not found');
            }

            // Update widget placement
            if (widgetConfig.widget_placement === 'Left') {
                const floatBtn = document.getElementById('chatbot-float-btn');
                const popup = document.getElementById('chatbot-popup');
                if (floatBtn) {
                    floatBtn.style.right = 'auto';
                    floatBtn.style.left = '24px';
                }
                if (popup) {
                    popup.style.right = 'auto';
                    popup.style.left = '24px';
                }
            }

            // Set default state
            if (widgetConfig.default_state === 'Open') {
                const popup = document.getElementById('chatbot-popup');
                const floatBtn = document.getElementById('chatbot-float-btn');
                if (popup && floatBtn) {
                    popup.style.display = 'block';
                    floatBtn.innerHTML = '✖';
                    if (!socket || socket.readyState !== 1) connectSocket();
                    fetchChatHistory();
                    autoScroll();
                }
            }
        }

        // 🔹 Generate Chat ID
        function generateChatId() {
            const SESSION_DURATION = 5 * 60 * 1000;
            const IDLE_TIMEOUT = 5 * 60 * 1000;
            const now = Date.now();

            let chatId = sessionStorage.getItem("chat_id");
            let lastActivity = parseInt(sessionStorage.getItem("last_activity_time")) || 0;
            let expiryTime = parseInt(sessionStorage.getItem("session_expiry_time")) || 0;

            const formatDateTime = (date) => {
                const d = new Date(date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                const hours = String(d.getHours()).padStart(2, "0");
                const minutes = String(d.getMinutes()).padStart(2, "0");
                return `${year}${month}${day}_${hours}${minutes}`;
            };

            const createNewSession = () => {
                const current = Date.now();
                const formattedTime = formatDateTime(current);
                const hash = btoa(navigator.userAgent).slice(0, 6);
                const newChatId = `${formattedTime}${hash}`;
                const newExpiry = current + SESSION_DURATION;

                sessionStorage.clear();
                sessionStorage.setItem("chat_id", newChatId);
                sessionStorage.setItem("last_activity_time", current.toString());
                sessionStorage.setItem("session_expiry_time", newExpiry.toString());

                reconnectSocket();
                return newChatId;
            };

            if (!chatId) return createNewSession();
            if (now > expiryTime) return createNewSession();
            if ((now - lastActivity) > IDLE_TIMEOUT) return createNewSession();

            const extendedExpiry = now + SESSION_DURATION;
            sessionStorage.setItem("last_activity_time", now.toString());
            sessionStorage.setItem("session_expiry_time", extendedExpiry.toString());

            return chatId;
        }

        function reconnectSocket() {
            if (typeof socket !== "undefined" && socket && socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
            document.getElementById('chat-messages').innerHTML = "";
            if (typeof connectSocket === "function") {
                connectSocket();
            }
        }

        let chatId = generateChatId();
        const SOCKET_URL = `${API_URL.replace('http', 'ws')}/api/ws/chat`;

        function connectSocket() {
            if (!SECRET_KEY) {
                console.warn("No SECRET_KEY found for websocket.");
                return;
            }
            const url = `${SOCKET_URL}?token=${SECRET_KEY}&domain=${DOMAIN}&chatId=${chatId}&type=chat`;
            socket = new WebSocket(url);

            socket.onopen = () => console.log("🔗 WebSocket connected");

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === "error" && data.status === 4003) {
                        hideTyping();
                        appendBotMessage("⚠️ Your subscription token limit has been reached.<br>Please recharge your plan to continue chatting.");
                        messageInput.disabled = true;
                        messageInput.placeholder = "Recharge required";
                        sendBtn.disabled = true;
                        sendBtn.style.opacity = 0.6;
                        socket.close(4003, "Token limit reached");
                        return;
                    }

                    if (data.type === "typing") {
                        data.status === "start" ? showTyping() : hideTyping();
                        return;
                    }

                    if (data.type === "chat" && data.message) {
                        hideTyping();
                        appendBotMessage(data.message);
                        if (data.message.includes("Thank you! All your details have been received") || data.message.toLowerCase().includes("our agent will contact you")) {
                            setTimeout(() => {
                                sessionStorage.clear();
                                chatId = generateChatId();
                            }, 5000);
                        }
                    }
                } catch (err) {
                    hideTyping();
                    appendBotMessage(event.data);
                }
            };

            socket.onerror = (err) => console.warn("❌ WebSocket error", err);
            socket.onclose = (event) => {
                console.warn("🔌 WebSocket closed, attempting reconnect...");
                if (event.code === 4003) {
                    console.warn("⛔ Token limit reached — no reconnection.");
                    return;
                }
                setTimeout(connectSocket, 2000);
            };
        }

        function autoScroll() {
            const chatBody = document.querySelector(".chat-body");
            if (chatBody) {
                setTimeout(() => {
                    chatBody.scrollTop = chatBody.scrollHeight;
                }, 60);
            }
        }

        function fetchChatHistory() {
            fetch(`${API_URL}/api/chatbot/chat-history/${chatId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        messageContainer.innerHTML = "";
                        data.forEach((item) => {
                            const bubble = document.createElement("div");
                            bubble.className = "chat-message-bubble";
                            if (item.sender === "Client") bubble.classList.add("chat-message-user");
                            bubble.innerHTML = marked.parse(item.message || "");
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
            bubble.innerHTML = marked.parse(text || "");
            messageContainer.appendChild(bubble);
            autoScroll();
        }

        function createTypingElement() {
            const wrap = document.createElement("div");
            wrap.className = "typing-indicator";
            wrap.setAttribute("data-typing", "1");
            wrap.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
            return wrap;
        }

        function showTyping() {
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
        style.innerHTML = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');#chatbot-float-btn{position:fixed;bottom:24px;right:24px;width:56px;height:56px;background-color:#1a1aff;color:white;border:none;border-radius:50%;font-size:26px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(0,0,0,0.3);cursor:pointer;z-index:9999;}#chatbot-popup{font-family:'Inter',sans-serif;position:fixed;bottom:90px;right:24px;width:360px;max-width:90%;background-color:#fff;border-radius:18px;box-shadow:0 12px 36px rgba(0,0,0,0.2);overflow:hidden;z-index:9999;display:none;animation:slideUp 0.3s ease;}@keyframes slideUp{from{transform:translateY(20px);opacity:0;}to{transform:translateY(0);opacity:1;}}.chat-header{background-color:#1a1aff;color:white;padding:20px;font-size:18px;font-weight:600;border-top-left-radius:18px;border-top-right-radius:18px;}.chat-header span{display:block;font-size:14px;font-weight:400;margin-top:4px;}.chat-body{padding:12px 16px;min-height:240px;max-height:320px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;background:#fff;}.chat-message-bubble{background:#eef0ff;padding:10px 14px;border-radius:12px;max-width:75%;word-wrap:break-word;margin:10px 0;text-align:left;font-size:15px;color:#333;line-height:1.5;}.chat-message-user{background:#1a1aff;color:white;align-self:flex-end;margin-left:auto;font-size:15px;text-align:left;}.chat-message-bubble p{margin:6px 0;}.chat-message-bubble strong{font-weight:600;}.chat-message-bubble em{font-style:italic;}.chat-message-bubble ul,.chat-message-bubble ol{margin:6px 0 6px 18px;padding-left:16px;}.chat-message-bubble li{margin:3px 0;}.chat-message-bubble code{background:#f2f2f2;padding:2px 4px;border-radius:4px;font-family:monospace;}.chat-message-bubble a{color:#1a1aff;text-decoration:underline;word-break:break-all;}.typing-indicator{display:flex;align-items:center;gap:6px;padding:15px 10px;border-radius:12px;background:#eef0ff;max-width:20%;}.typing-dot{width:8px;height:8px;background:#999;border-radius:50%;animation:typing-bounce 1.2s infinite;opacity:0.6;}.typing-dot:nth-child(2){animation-delay:0.15s;}.typing-dot:nth-child(3){animation-delay:0.3s;}@keyframes typing-bounce{0%{transform:translateY(0);opacity:0.6;}30%{transform:translateY(-6px);opacity:1;}60%,100%{transform:translateY(0);opacity:0.6;}}.chat-input-box{display:flex;border-top:1px solid #eee;padding:8px;gap:8px;}.chat-input-box input{flex:1;padding:10px;font-size:14px;border:1px solid #ccc;border-radius:8px;outline:none;}.chat-input-box button{background:#1a1aff;color:white;border:none;border-radius:8px;padding:10px 14px;cursor:pointer;}.chat-powered{text-align:center;font-size:10px;color:#666;padding:6px 8px;background:#fafafa;}`;
        document.head.appendChild(style);

        // 🔹 UI Elements
        const floatBtn = document.createElement("button");
        floatBtn.id = "chatbot-float-btn";
        floatBtn.innerHTML = "💬";
        document.body.appendChild(floatBtn);

        const popup = document.createElement("div");
        popup.id = "chatbot-popup";
        popup.innerHTML = `<div class="chat-header">👋 Hi there<span>Welcome to our website. Ask us anything 🎉</span></div><div class="chat-body"><div id="chat-messages"></div></div><div class="chat-input-box"><input type="text" id="user-message" placeholder="Type your message..." /><button id="send-btn">Send</button></div><div class="chat-powered">Powered by Dotzerotech.com</div>`;
        document.body.appendChild(popup);

        const messageContainer = popup.querySelector("#chat-messages");
        const messageInput = popup.querySelector("#user-message");
        const sendBtn = popup.querySelector("#send-btn");

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

        function handleSend(e) {
            e?.preventDefault();
            const msg = messageInput.value.trim();
            if (!msg) return;

            const bubble = document.createElement("div");
            bubble.className = "chat-message-bubble chat-message-user";
            bubble.textContent = msg;
            messageContainer.appendChild(bubble);
            messageInput.value = "";
            autoScroll();
            showTyping();

            if (socket && socket.readyState === WebSocket.OPEN) {
                try {
                    chatId = generateChatId();
                    socket.send(JSON.stringify({type: "chat", message: msg}));
                } catch (err) {
                    socket.send(msg);
                }
            } else {
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

        // Fetch widget config on load
        fetchWidgetConfig();
    };
})();
