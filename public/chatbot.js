
(function () {
    // Load Marked.js for Markdown parsing
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
    document.head.appendChild(script);
    script.onload = function () {
        startChatbotWidget();
    };

    function startChatbotWidget() {
        // Configure Markdown
        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true });
        }

        // 🔹 Extract Parameters
        function getParams() {
            const scripts = document.getElementsByTagName("script");
            const current = Array.from(scripts).find((s) => s.src.includes("chatbot.js"));

            // Fallback defaults if script tag isn't found perfectly
            let key = null, website = window.location.hostname;

            if (current) {
                const qs = current.src.split("?")[1] || "";
                const urlParams = new URLSearchParams(qs);
                key = urlParams.get("key");

                const siteParam = urlParams.get("website");
                if (siteParam) {
                    website = siteParam.replace(/^https?:\/\//, '')
                                     .replace(/^www\./, '')
                                     .split('/')[0]
                                     .split(':')[0]
                                     .toLowerCase()
                                     .trim();
                }
            }
            
            return { key, website };
        }

        const { key: SECRET_KEY, website: WEBSITE } = getParams();
        
        // Backend URL Logic
        const getBackendUrl = () => {
            if (window.$chatbot_widget?.apiUrl) return window.$chatbot_widget.apiUrl;
            if (window.location.hostname === 'localhost') return "http://localhost:3000";
            return "https://dashboard.converzex.com";
        };
        const API_URL = getBackendUrl();
        const DOMAIN = window.location.origin;

        let widgetConfig = null;
        let widgetColor = '#4F46E5';
        let widgetIcon = null;
        let floatBtn = null;
        let popup = null;

        const CLOSE_FLOAT_ICON = `<span class="cb-float-icon"><svg class="cb-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>`;

        const DEFAULT_FLOAT_ICON = `<span class="cb-float-icon"><svg class="cb-icon-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3C7.03 3 3 6.58 3 11c0 2.39 1.06 4.54 2.76 6.04L5 21l4.2-2.1c.74.2 1.52.31 2.33.31 1.04 0 2.02-.2 2.91-.55.5.92 1.23 1.7 2.12 2.27.3.2.67.07.8-.26.14-.33-.02-.7-.35-.85-1.1-.55-1.95-1.45-2.45-2.55C18.8 16.46 21 13.92 21 11c0-4.42-4.03-8-9-8z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8.5" cy="11" r="1" fill="currentColor"/><circle cx="12" cy="11" r="1" fill="currentColor"/><circle cx="15.5" cy="11" r="1" fill="currentColor"/></svg></span>`;

        function renderFloatIcon(icon) {
            if (!icon) return DEFAULT_FLOAT_ICON;
            if (/^(https?:\/\/|\/|data:image)/i.test(icon)) {
                return `<span class="cb-float-icon"><img src="${icon}" alt="" /></span>`;
            }
            if (icon.trim().startsWith('<svg')) {
                return `<span class="cb-float-icon">${icon}</span>`;
            }
            if (icon.length <= 4) {
                return `<span class="cb-float-icon cb-float-emoji">${icon}</span>`;
            }
            return DEFAULT_FLOAT_ICON;
        }

        const HEADER_WAVE_ICON = `<svg class="cb-wave-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 13V8.5a1.5 1.5 0 0 1 3 0V12M11 12V7a1.5 1.5 0 0 1 3 0v5M14 12V8a1.5 1.5 0 0 1 3 0v3.5a6 6 0 0 1-12 0V9.5a1.5 1.5 0 0 1 3 0V12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 14.5c.6 2.2 2.8 4.5 8 4.5s7.4-2.3 8-4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

        function getHeaderAvatarHtml() {
            return HEADER_WAVE_ICON;
        }

        function getWelcomeSubtitle(companyName) {
            if (widgetConfig?.header_welcome_message) {
                return widgetConfig.header_welcome_message;
            }
            const name = companyName || widgetConfig?.company_name || 'our website';
            return `Welcome to ${name}, Ask anything.`;
        }

        function getBotAvatarHtml() {
            if (widgetConfig?.company_logo) {
                return `<img src="${widgetConfig.company_logo}" alt="" class="chat-avatar-img" />`;
            }
            const letter = widgetConfig?.company_name?.charAt(0)?.toUpperCase() || 'AI';
            return `<span class="chat-avatar-letter">${letter}</span>`;
        }

        // 🔥 CRITICAL: Fetch config FIRST before creating any elements
        async function fetchWidgetConfigSync() {
            const maxRetries = 3;
            let retryCount = 0;
            
            while (retryCount < maxRetries) {
                try {
                    const response = await fetch(`${API_URL}/api/widget-customize/public/${encodeURIComponent(WEBSITE)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    const data = await response.json();
                    if (data.success && data.data) {
                        widgetConfig = data.data;
                        // Set color immediately if config has it
                        if (widgetConfig.widget_header_color) {
                            widgetColor = widgetConfig.widget_header_color;
                        }
                        // Set icon if config has it
                        if (widgetConfig.widget_icon) {
                            widgetIcon = widgetConfig.widget_icon;
                        }
                        return true;
                    }
                } catch (error) {
                    retryCount++;
                    if (retryCount < maxRetries) {
                        // Wait before retry (exponential backoff)
                        await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
                        continue;
                    }
                    console.error("❌ Widget config error after retries:", error);
                }
            }
            return false;
        }

        function createStyles(color) {
            const rgb = hexToRgb(color);
            const softBg = rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},0.08)` : '#EEF2FF';
            return `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

#chatbot-float-btn{
    position:fixed;bottom:28px;right:28px;width:60px;height:60px;
    background:linear-gradient(135deg,${color} 0%,${color}dd 100%);
    color:#fff;border:none;border-radius:50%;font-size:24px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 32px ${color}55,0 2px 8px rgba(0,0,0,0.12);
    cursor:pointer;z-index:2147483647;
    transition:transform .25s cubic-bezier(.4,0,.2,1),box-shadow .25s;
}
#chatbot-float-btn:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 12px 40px ${color}66,0 4px 12px rgba(0,0,0,0.15);}
#chatbot-float-btn .cb-float-icon{display:flex;align-items:center;justify-content:center;line-height:0;}
#chatbot-float-btn .cb-icon-svg{width:28px;height:28px;}
#chatbot-float-btn .cb-float-icon img{width:32px;height:32px;object-fit:contain;}
#chatbot-float-btn .cb-float-emoji{font-size:26px;line-height:1;}

#chatbot-popup{
    font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;
    position:fixed;bottom:100px;right:28px;width:400px;max-width:calc(100vw - 32px);
    background:#fff;border-radius:20px;
    box-shadow:0 24px 64px rgba(15,23,42,0.18),0 0 0 1px rgba(15,23,42,0.06);
    overflow:hidden;z-index:2147483647;display:none;
    animation:cbSlideUp .35s cubic-bezier(.4,0,.2,1);
}
@keyframes cbSlideUp{from{transform:translateY(16px) scale(.98);opacity:0;}to{transform:translateY(0) scale(1);opacity:1;}}

.chat-header{
    background:linear-gradient(135deg,${color} 0%,${color}cc 100%);
    color:#fff;padding:18px 20px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;
    transition:background .3s;
}
.chat-header-info{display:flex;align-items:center;gap:12px;flex:1;min-width:0;}
.chat-header-btn{
    width:32px;height:32px;min-width:32px;border:none;border-radius:8px;
    background:rgba(255,255,255,0.15);color:#fff;cursor:pointer;
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    transition:background .2s,transform .2s;
}
.chat-header-btn:hover{background:rgba(255,255,255,0.28);}
.chat-header-btn:active{transform:scale(.95);}
.chat-header-btn svg{width:18px;height:18px;}
.chat-header-actions{display:flex;align-items:center;gap:6px;flex-shrink:0;}
#speaker-btn.cb-muted{background:rgba(255,255,255,0.08);opacity:.65;}
#speaker-btn.cb-speaking{background:rgba(255,255,255,0.32);animation:cbSpeakPulse 1.4s ease-in-out infinite;}
@keyframes cbSpeakPulse{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.45);}50%{box-shadow:0 0 0 5px rgba(255,255,255,0);}}
.chat-message-bubble .cb-w{border-radius:4px;padding:1px 1px;margin:0 -1px;transition:background-color .12s ease,color .12s ease;}
.chat-message-bubble .cb-w.cb-said{background:${color}1f;}
.chat-message-bubble .cb-w.cb-reading{background:${color};color:#fff;}
.chat-message-bubble .cb-w.cb-reading *{color:#fff !important;}
.chat-header-avatar{
    width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.2);
    display:flex;align-items:center;justify-content:center;flex-shrink:0;
    border:2px solid rgba(255,255,255,0.35);overflow:hidden;
}
.chat-header-avatar .chat-avatar-img{width:100%;height:100%;object-fit:cover;}
.chat-header-avatar .chat-avatar-letter{font-size:13px;font-weight:700;letter-spacing:.5px;}
.chat-header-avatar .cb-wave-icon{width:26px;height:26px;animation:cbWave 2.5s ease-in-out infinite;transform-origin:70% 80%;}
@keyframes cbWave{0%,100%{transform:rotate(0deg);}10%{transform:rotate(14deg);}20%{transform:rotate(-8deg);}30%{transform:rotate(14deg);}40%{transform:rotate(-4deg);}50%,100%{transform:rotate(0deg);}}
.chat-header-text{min-width:0;}
.chat-header-title{font-size:16px;font-weight:700;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.chat-header-subtitle{font-size:12.5px;font-weight:400;opacity:.9;margin-top:2px;line-height:1.4;}
.chat-header-status{display:flex;align-items:center;gap:6px;font-size:11px;font-weight:500;opacity:.85;margin-top:4px;}
.chat-header-status .status-dot{width:7px;height:7px;background:#4ade80;border-radius:50%;box-shadow:0 0 0 2px rgba(74,222,128,0.35);animation:cbPulse 2s infinite;}
@keyframes cbPulse{0%,100%{opacity:1;}50%{opacity:.6;}}

.chat-body{
    padding:16px;min-height:280px;max-height:380px;overflow-y:auto;
    display:flex;flex-direction:column;gap:4px;
    background:linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%);
    scroll-behavior:smooth;
}
.chat-body::-webkit-scrollbar{width:5px;}
.chat-body::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}

#chat-messages{display:flex;flex-direction:column;gap:12px;}

.chat-message-row{display:flex;align-items:flex-end;gap:10px;animation:cbMsgIn .3s ease;}
.chat-message-row-user{justify-content:flex-end;}
@keyframes cbMsgIn{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

.chat-avatar{
    width:32px;height:32px;border-radius:50%;flex-shrink:0;
    background:${softBg};color:${color};
    display:flex;align-items:center;justify-content:center;
    font-size:11px;font-weight:700;border:1px solid ${color}22;overflow:hidden;
}
.chat-avatar .chat-avatar-img{width:100%;height:100%;object-fit:cover;}
.chat-avatar .chat-avatar-letter{font-size:10px;font-weight:700;}

.chat-message-bubble{
    background:#fff;padding:12px 16px;border-radius:18px 18px 18px 4px;
    max-width:78%;word-wrap:break-word;font-size:14px;color:#1e293b;line-height:1.55;
    box-shadow:0 1px 3px rgba(15,23,42,0.08);border:1px solid #e2e8f0;
}
.chat-message-user{
    background:linear-gradient(135deg,${color} 0%,${color}dd 100%);
    color:#fff;border-radius:18px 18px 4px 18px;border:none;
    box-shadow:0 2px 8px ${color}44;
}
.chat-message-system{
    background:#fef3c7;color:#92400e;border:1px solid #fde68a;
    border-radius:12px;font-size:13px;text-align:center;max-width:100%;align-self:center;
}
.chat-message-bubble p{margin:4px 0;}
.chat-message-bubble p:first-child{margin-top:0;}
.chat-message-bubble p:last-child{margin-bottom:0;}
.chat-message-bubble code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-family:ui-monospace,monospace;font-size:13px;}
.chat-message-bubble a{color:${color};}

.typing-row{align-items:flex-end;}
.typing-indicator{
    display:flex;align-items:center;gap:10px;
    background:#fff;padding:12px 16px;border-radius:18px 18px 18px 4px;
    border:1px solid #e2e8f0;box-shadow:0 1px 3px rgba(15,23,42,0.06);
    animation:cbMsgIn .3s ease;
}
.typing-label{font-size:13px;font-weight:500;color:#64748b;letter-spacing:.2px;}
.typing-dots{display:inline-flex;align-items:center;gap:4px;margin-left:2px;}
.typing-dots span{
    width:5px;height:5px;background:${color};border-radius:50%;
    animation:cbTypingDot 1.4s infinite ease-in-out;opacity:.4;
}
.typing-dots span:nth-child(1){animation-delay:0s;}
.typing-dots span:nth-child(2){animation-delay:.2s;}
.typing-dots span:nth-child(3){animation-delay:.4s;}
@keyframes cbTypingDot{0%,60%,100%{transform:translateY(0);opacity:.35;}30%{transform:translateY(-5px);opacity:1;}}

.chat-input-box{
    display:flex;align-items:flex-end;border-top:1px solid #e2e8f0;
    padding:12px 14px;gap:10px;background:#fff;
}
.chat-input-box textarea{
    flex:1;box-sizing:border-box;padding:11px 14px;font-size:14px;font-family:inherit;line-height:1.35;
    border:1.5px solid #e2e8f0;border-radius:12px;outline:none;resize:none;
    height:44px;min-height:44px;max-height:120px;overflow-y:hidden;
    background:#f8fafc;color:#1e293b;transition:border-color .2s,box-shadow .2s,background .2s;
}
.chat-input-box textarea::placeholder{color:#94a3b8;}
.chat-input-box textarea:focus{border-color:${color};background:#fff;box-shadow:0 0 0 3px ${color}22;}
.chat-input-box button{
    width:44px;height:44px;min-width:44px;
    background:linear-gradient(135deg,${color} 0%,${color}dd 100%);
    color:#fff;border:none;border-radius:12px;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:transform .2s,box-shadow .2s;box-shadow:0 2px 8px ${color}44;
}
.chat-input-box button:hover{transform:scale(1.05);box-shadow:0 4px 12px ${color}55;}
.chat-input-box button:active{transform:scale(.97);}
.chat-input-box button svg{width:18px;height:18px;}

.chat-powered{
    text-align:center;font-size:10px;color:#94a3b8;
    padding:8px 12px;background:#f8fafc;border-top:1px solid #f1f5f9;
    letter-spacing:.3px;
}`;
        }

        function hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        function injectWidget() {
            // Safety check: if already exists, stop
            if (document.getElementById('chatbot-float-btn')) return;
            if (!document.body) return;

            // Create styles with fetched color
            const styleTag = document.createElement("style");
            styleTag.id = "chatbot-widget-styles";
            styleTag.innerHTML = createStyles(widgetColor);
            document.head.appendChild(styleTag);

            // Create button with correct color and icon
            floatBtn = document.createElement("button");
            floatBtn.id = "chatbot-float-btn";
            floatBtn.innerHTML = renderFloatIcon(widgetIcon);
            floatBtn.style.backgroundColor = widgetColor; // Inline style for immediate application

            popup = document.createElement("div");
            popup.id = "chatbot-popup";
            popup.innerHTML = `
                <div class="chat-header">
                    <div class="chat-header-info">
                        <div class="chat-header-avatar">${HEADER_WAVE_ICON}</div>
                        <div class="chat-header-text">
                            <div class="chat-header-title">Hi There</div>
                            <div class="chat-header-subtitle">Welcome to our website, Ask anything.</div>
                            <div class="chat-header-status"><span class="status-dot"></span> Online</div>
                        </div>
                    </div>
                    <div class="chat-header-actions">
                        <button id="speaker-btn" class="chat-header-btn" type="button" aria-label="Read replies aloud" title="Read replies aloud"></button>
                        <button id="minimize-btn" class="chat-header-btn" type="button" aria-label="Minimize chat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        </button>
                    </div>
                </div>
                <div class="chat-body">
                    <div id="chat-messages"></div>
                </div>
                <div class="chat-input-box">
                    <textarea id="user-message" placeholder="Type your message..." autocomplete="off"></textarea>
                    <button id="send-btn" aria-label="Send message">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    </button>
                </div>
                <div class="chat-powered">Powered by Dotzerotech</div>
            `;

            document.body.appendChild(floatBtn);
            document.body.appendChild(popup);

            // Apply config if fetched
            if (widgetConfig) {
                applyWidgetConfig();
            }
            // Initialize Event Listeners
            initEventListeners();
        }

        //Fetch config FIRST, then inject widget
        async function initializeWidget() {
            // Wait for body to be ready
            const waitForBody = () => {
                return new Promise((resolve) => {
                    if (document.body) {
                        resolve();
                    } else {
                        const interval = setInterval(() => {
                            if (document.body) {
                                clearInterval(interval);
                                resolve();
            }
        }, 50);}
                });
            };

            await waitForBody();

            // Fetch config with timeout (max 5 seconds wait) - increased for slow networks
            const configPromise = fetchWidgetConfigSync();
            const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(false), 5000));
            const configLoaded = await Promise.race([configPromise, timeoutPromise]);

            // Now inject widget with correct color and icon
            injectWidget();

            // If config didn't load in time, continue fetching in background and apply when ready
            if (!configLoaded) {
                // Continue fetching in background (no timeout for retry)
                fetchWidgetConfigSync().then((success) => {
                    if (success && widgetConfig) {
                        // Config loaded late, update widget now
                        applyWidgetConfig();
                        // Also update styles if color changed
                        if (widgetConfig.widget_header_color && widgetColor !== widgetConfig.widget_header_color) {
                            const styleTag = document.getElementById('chatbot-widget-styles');
                            if (styleTag) {
                                styleTag.innerHTML = createStyles(widgetConfig.widget_header_color);
                            }
                        }
                    }
                }).catch(err => {
                    console.warn("Background config fetch failed:", err);
                });
            }
        }

        // Start initialization
        initializeWidget();

        let socket;
        let chatId = generateChatId();
        const SOCKET_URL = `${API_URL.replace('http', 'ws')}/api/ws/chat`;

        // Generate ID
        function generateChatId() {
            const SESSION_DURATION = 5 * 60 * 1000;
            const IDLE_TIMEOUT = 5 * 60 * 1000;
            const now = Date.now();

            let storedId = sessionStorage.getItem("chat_id");
            let lastActivity = parseInt(sessionStorage.getItem("last_activity_time")) || 0;
            let expiryTime = parseInt(sessionStorage.getItem("session_expiry_time")) || 0;

            const formatDateTime = (date) => {
                const d = new Date(date);
                return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
            };

            const createNewSession = () => {
                const current = Date.now();
                const hash = btoa(navigator.userAgent).slice(0, 6);
                const newChatId = `${formatDateTime(current)}${hash}`;
                const newExpiry = current + SESSION_DURATION;

                sessionStorage.clear();
                sessionStorage.setItem("chat_id", newChatId);
                sessionStorage.setItem("last_activity_time", current.toString());
                sessionStorage.setItem("session_expiry_time", newExpiry.toString());
                return newChatId;
            };

            if (!storedId || now > expiryTime || (now - lastActivity) > IDLE_TIMEOUT) {
                return createNewSession();
            }

            // Extend session
            sessionStorage.setItem("last_activity_time", now.toString());
            sessionStorage.setItem("session_expiry_time", (now + SESSION_DURATION).toString());
            return storedId;
        }

        // Fetch Config (for re-fetching if needed, but usually config is already fetched)
        async function fetchWidgetConfig() {
            // Config already fetched in initializeWidget, just apply it
            if (widgetConfig) {
                applyWidgetConfig();
            } else {
                // Fallback: fetch again if somehow config wasn't fetched
                try {
                    const response = await fetch(`${API_URL}/api/widget-customize/public/${encodeURIComponent(WEBSITE)}`);
                    const data = await response.json();
                    if (data.success && data.data) {
                        widgetConfig = data.data;
                        if (widgetConfig.widget_header_color) {
                            widgetColor = widgetConfig.widget_header_color;
                        }
                        if (widgetConfig.widget_icon) {
                            widgetIcon = widgetConfig.widget_icon;
                        }
                        applyWidgetConfig();
                    }
                } catch (error) {
                    console.error("❌ Widget config error:", error);
                }
            }
        }

        function applyWidgetConfig() {
            if (!widgetConfig) return;

            // Apply Colors
            if (widgetConfig.widget_header_color) {
                const header = popup.querySelector('.chat-header');
                const sendBtn = popup.querySelector('#send-btn');

                if (header) header.style.backgroundColor = widgetConfig.widget_header_color;
                if (floatBtn) {
                    floatBtn.style.backgroundColor = widgetConfig.widget_header_color;
                }
                if (sendBtn) {
                    sendBtn.style.backgroundColor = widgetConfig.widget_header_color;
                    sendBtn.style.borderColor = widgetConfig.widget_header_color;
                }
                
                widgetColor = widgetConfig.widget_header_color;
                const styleTag = document.getElementById('chatbot-widget-styles');
                if (styleTag) styleTag.innerHTML = createStyles(widgetColor);
            }

            // Apply Widget Icon
            if (widgetConfig.widget_icon && floatBtn) {
                widgetIcon = widgetConfig.widget_icon;
                // Only update icon if chat is closed (not showing X)
                if (!isOpen) {
                    floatBtn.innerHTML = renderFloatIcon(widgetIcon);
                }
            }

            const headerAvatar = popup.querySelector('.chat-header-avatar');
            const headerTitle = popup.querySelector('.chat-header-title');
            const headerSubtitle = popup.querySelector('.chat-header-subtitle');

            if (headerAvatar) {
                headerAvatar.innerHTML = getHeaderAvatarHtml();
            }
            if (headerTitle) {
                headerTitle.textContent = 'Hi There';
            }
            if (headerSubtitle) {
                headerSubtitle.textContent = getWelcomeSubtitle(widgetConfig.company_name);
            }

            // Placement
            if (widgetConfig.widget_placement === 'Left') {
                floatBtn.style.right = 'auto'; floatBtn.style.left = '24px';
                popup.style.right = 'auto'; popup.style.left = '24px';
            }

            // Default State
            if (widgetConfig.default_state === 'Open') {
                toggleChat(true);
            }

             // Powered By Visibility and Custom Text
             const poweredByElement = popup.querySelector('.chat-powered');
             if (poweredByElement) {
                 const poweredByValue = widgetConfig.powered_by || widgetConfig.show_powered_by;
                 
                 // Check if should hide
                 if (poweredByValue && (poweredByValue.toLowerCase() === 'hide' || poweredByValue === false)) {
                     poweredByElement.style.display = 'none';
                 } else {
                     // Show the element
                     poweredByElement.style.display = 'block';
                     
                     // Get custom text - check powered_by_custom_name first (primary field)
                     const customText = widgetConfig.powered_by_custom_name || 
                                       widgetConfig.powered_by_text || 
                                       widgetConfig.powered_by_label || 
                                       widgetConfig.custom_powered_by ||
                                       widgetConfig.powered_by_custom_text ||
                                       widgetConfig.powered_by_custom;
                     
                     // Update text if custom text is provided
                     if (customText && customText.trim()) {
                         poweredByElement.textContent = customText.trim();
                     }
                     // Otherwise keep default "Powered by Dotzerotech.com"
                 }
             }
        }

        // Socket Connection
        function connectSocket() {
            if (!SECRET_KEY) return;
            // Close existing if open
            if (socket && socket.readyState === WebSocket.OPEN) socket.close();

            const url = `${SOCKET_URL}?token=${SECRET_KEY}&domain=${DOMAIN}&chatId=${chatId}&type=chat`;
            socket = new WebSocket(url);

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    // Handle Errors
                    if (data.type === "error" && data.status === 4003) {
                        hideTyping();
                        appendMessage("system", "⚠️ Subscription limit reached.");
                        document.getElementById("user-message").disabled = true;
                        return;
                    }

                    // Handle Typing
                    if (data.type === "typing") {
                        data.status === "start" ? showTyping() : hideTyping();
                        return;
                    }

                    // Handle Message
                    if (data.type === "chat" && data.message) {
                        hideTyping();
                        const botBubble = appendMessage("bot", data.message);
                        speak(data.message, botBubble);
                        return;
                    }

                    // Handle reset signal (lead saved) → after the farewell is shown,
                    // wipe this chat and rotate to a brand-new session so the next
                    // conversation is captured as a new lead.
                    if (data.type === "reset") {
                        setTimeout(() => {
                            const container = document.getElementById("chat-messages");
                            if (container) container.innerHTML = "";

                            sessionStorage.clear();
                            chatId = generateChatId();

                            const input = document.getElementById("user-message");
                            if (input) input.disabled = false;

                            // Detach the old auto-reconnect so we don't spawn a duplicate
                            // socket, then reconnect with the new chatId. The server sends
                            // a fresh greeting because the new chatId has no history.
                            if (socket) {
                                socket.onclose = null;
                                try { socket.close(); } catch (e) { /* noop */ }
                            }
                            connectSocket();
                        }, 3000);
                        return;
                    }
                } catch (err) { console.warn(err); }
            };

            socket.onclose = (e) => {
                if (e.code !== 4003) setTimeout(connectSocket, 3000);
            };
        }

        // Chat UI Logic
        function initEventListeners() {
            const messageInput = document.getElementById("user-message");
            const sendBtn = document.getElementById("send-btn");

            floatBtn.addEventListener("click", () => toggleChat());

            renderSpeakerBtn();
            const speakerBtn = document.getElementById("speaker-btn");
            if (speakerBtn) {
                speakerBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleSpeaker();
                });
            }

            const minimizeBtn = document.getElementById("minimize-btn");
            if (minimizeBtn) {
                minimizeBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    toggleChat(false);
                });
            }

            sendBtn.addEventListener("click", handleSend);
            messageInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter" && !e.shiftKey) handleSend(e);
            });
            messageInput.addEventListener("input", () => resizeMessageInput(messageInput));
        }

        function resizeMessageInput(el) {
            el.style.height = "44px";
            const next = Math.min(el.scrollHeight, 120);
            el.style.height = next + "px";
            el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
        }

        let isOpen = false;
        function toggleChat(forceOpen = null) {
            isOpen = forceOpen !== null ? forceOpen : !isOpen;
            popup.style.display = isOpen ? "block" : "none";
            floatBtn.classList.toggle("cb-open", isOpen);
            floatBtn.innerHTML = isOpen ? CLOSE_FLOAT_ICON : renderFloatIcon(widgetIcon);

            if (isOpen) {
                if (!socket || socket.readyState !== 1) connectSocket();
                fetchChatHistory();
                autoScroll();
            } else {
                stopSpeaking();
            }
        }

        function handleSend(e) {
            e?.preventDefault();
            const input = document.getElementById("user-message");
            const msg = input.value.trim();
            if (!msg) return;

            appendMessage("user", msg);
            input.value = "";
            input.style.height = "44px";
            input.style.overflowY = "hidden";
            showTyping();

            if (socket && socket.readyState === WebSocket.OPEN) {
                chatId = generateChatId(); // Refresh session activity
                socket.send(JSON.stringify({ type: "chat", message: msg }));
            } else {
                // Offline fallback logic could go here
                try { socket.send(msg); } catch(e) {}
            }
        }

        function fetchChatHistory() {
            const container = document.getElementById("chat-messages");
            if(!container) return;

            fetch(`${API_URL}/api/chatbot/chat-history/${chatId}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data) && data.length > 0) {
                        container.innerHTML = ""; // Clear duplicates
                        data.forEach(item => {
                            const role = item.sender === "Client" ? "user" : "bot";
                            appendMessage(role, item.message, false);
                        });
                        autoScroll();
                    }
                })
                .catch(err => console.error(err));
        }

        /* ------------------------------------------------------------------
         * Text-to-speech (Web Speech API - free, built into every browser).
         * When the speaker is ON, each NEW assistant reply is read aloud.
         * History replays and system notices are never spoken.
         * ---------------------------------------------------------------- */
        const SPEECH_SUPPORTED =
            typeof window !== "undefined" &&
            "speechSynthesis" in window &&
            typeof window.SpeechSynthesisUtterance === "function";

        const SPEAK_STORAGE_KEY = "chatbot_speak_enabled";

        const SPEAKER_ON_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M18.36 5.64a9 9 0 0 1 0 12.73"/></svg>';
        const SPEAKER_OFF_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>';

        // Default is OFF so a visitor is never surprised by sound.
        // A site can start it ON with window.$chatbot_widget.autoSpeak = true
        function readStoredSpeak() {
            try {
                const stored = localStorage.getItem(SPEAK_STORAGE_KEY);
                if (stored === "1") return true;
                if (stored === "0") return false;
            } catch (e) { /* storage blocked - fall through */ }
            return !!(window.$chatbot_widget && window.$chatbot_widget.autoSpeak === true);
        }

        let speakEnabled = SPEECH_SUPPORTED ? readStoredSpeak() : false;
        let voicesCache = [];

        function loadVoices() {
            if (!SPEECH_SUPPORTED) return;
            voicesCache = window.speechSynthesis.getVoices() || [];
        }

        if (SPEECH_SUPPORTED) {
            loadVoices();                                   // voices load asynchronously
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        function pickVoice() {
            if (!voicesCache.length) loadVoices();
            if (!voicesCache.length) return null;
            const wanted = (window.$chatbot_widget && window.$chatbot_widget.voiceName) || "";
            if (wanted) {
                const exact = voicesCache.find(v => v.name === wanted);
                if (exact) return exact;
            }
            const lang = navigator.language || "en-US";
            const base = lang.split("-")[0];
            return voicesCache.find(v => v.lang === lang && v.localService)
                || voicesCache.find(v => v.lang === lang)
                || voicesCache.find(v => v.lang && v.lang.indexOf(base) === 0)
                || voicesCache[0]
                || null;
        }

        // Strip markdown/HTML so the voice does not read "asterisk asterisk".
        function toSpeakableText(markdown) {
            if (!markdown) return "";
            let t = String(markdown);
            t = t.replace(/```[\s\S]*?```/g, " ");     // fenced code blocks
            t = t.replace(/`([^`]*)`/g, "$1");           // inline code
            t = t.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");        // images
            t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");      // links -> label only
            t = t.replace(/^\s{0,3}#{1,6}\s+/gm, "");          // headings
            t = t.replace(/^\s{0,3}>\s?/gm, "");               // blockquotes
            t = t.replace(/^\s*[-*+]\s+/gm, "");               // bullets
            t = t.replace(/(\*\*|__|\*|_|~~)/g, "");            // emphasis marks
            t = t.replace(/<[^>]+>/g, " ");                   // any raw html
            t = t.replace(/https?:\/\/\S+/g, " ");             // bare urls
            t = t.replace(/&nbsp;/gi, " ");
            try { t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, " "); } catch (e) {}
            return t.replace(/\s+/g, " ").trim();
        }

        function markSpeaking(on) {
            const btn = document.getElementById("speaker-btn");
            if (btn) btn.classList.toggle("cb-speaking", !!on);
        }

        function stopSpeaking() {
            if (!SPEECH_SUPPORTED) return;
            try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
            clearHighlight();
            markSpeaking(false);
        }

        // Split into speakable chunks without ever losing a character.
        // split() with a capturing group keeps the terminators, so
        // re-joining the parts reproduces the input exactly.
        function chunkForSpeech(text, max) {
            const parts = text.split(/([.!?]+)/);
            const sentences = [];
            for (let i = 0; i < parts.length; i += 2) {
                const sentence = (parts[i] || "") + (parts[i + 1] || "");
                if (sentence.trim()) sentences.push(sentence.trim());
            }
            if (!sentences.length) return [text];

            const out = [];
            let buf = "";
            sentences.forEach((sentence) => {
                let rest = sentence;
                while (rest.length > max) {          // a single over-long sentence
                    let cut = rest.lastIndexOf(" ", max);
                    if (cut <= 0) cut = max;         // no space to break on
                    if (buf) { out.push(buf); buf = ""; }
                    out.push(rest.slice(0, cut).trim());
                    rest = rest.slice(cut).trim();
                }
                if (!rest) return;
                const merged = buf ? buf + " " + rest : rest;
                if (merged.length <= max) { buf = merged; }
                else { if (buf) out.push(buf); buf = rest; }
            });
            if (buf) out.push(buf);
            return out.filter(function (c) { return c && c.trim(); });
        }

        /* ---- word highlighting while speaking -------------------------
         * The words that get spoken are read back OUT OF THE RENDERED
         * BUBBLE, not out of the markdown. That guarantees every spoken
         * word has exactly one element on screen to highlight.
         * -------------------------------------------------------------- */
        let currentWordEl = null;
        let highlightedEls = [];

        function isSpeakableWord(w) {
            let t = w;
            try { t = t.replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, ""); } catch (e) {}
            t = t.trim();
            if (!t) return "";
            if (/^(https?:\/\/|www\.)/i.test(t)) return "";   // do not read out URLs
            return t;
        }

        // Wrap each visible word of a bubble in its own span.
        // Returns [{el, text}] in reading order. Code blocks are skipped.
        function wrapWords(bubble) {
            const textNodes = [];
            const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT, {
                acceptNode: function (node) {
                    if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
                    let p = node.parentElement;
                    while (p && p !== bubble) {
                        const tag = p.tagName;
                        if (tag === "CODE" || tag === "PRE" || tag === "SCRIPT" || tag === "STYLE") {
                            return NodeFilter.FILTER_REJECT;
                        }
                        if (p.classList && p.classList.contains("cb-w")) return NodeFilter.FILTER_REJECT;
                        p = p.parentElement;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            });
            let node;
            while ((node = walker.nextNode())) textNodes.push(node);

            const words = [];
            textNodes.forEach((tn) => {
                const frag = document.createDocumentFragment();
                tn.nodeValue.split(/(\s+)/).forEach((part) => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                    const span = document.createElement("span");
                    span.className = "cb-w";
                    span.textContent = part;
                    frag.appendChild(span);
                    const clean = isSpeakableWord(part);
                    if (clean) words.push({ el: span, text: clean });
                });
                if (tn.parentNode) tn.parentNode.replaceChild(frag, tn);
            });
            return words;
        }

        // Pack words into utterance-sized chunks, remembering where each
        // word starts and ends inside its chunk so onboundary can find it.
        function chunkWords(words, max) {
            const chunks = [];
            let cur = { text: "", marks: [] };
            words.forEach((w) => {
                const gap = cur.text ? 1 : 0;
                if (cur.text && cur.text.length + gap + w.text.length > max) {
                    chunks.push(cur);
                    cur = { text: "", marks: [] };
                }
                const start = cur.text.length + (cur.text ? 1 : 0);
                cur.text += (cur.text ? " " : "") + w.text;
                cur.marks.push({ start: start, end: start + w.text.length, el: w.el });
                // prefer to break after a sentence so the voice sounds natural
                if (/[.!?]["')\]]?$/.test(w.text) && cur.text.length > max / 2) {
                    chunks.push(cur);
                    cur = { text: "", marks: [] };
                }
            });
            if (cur.text) chunks.push(cur);
            return chunks;
        }

        // Keep the word being read visible without scrolling the host page.
        function keepWordInView(el) {
            const body = document.querySelector(".chat-body");
            if (!body) return;
            const b = body.getBoundingClientRect();
            const r = el.getBoundingClientRect();
            if (r.bottom > b.bottom - 8) body.scrollTop += r.bottom - b.bottom + 8;
            else if (r.top < b.top + 8) body.scrollTop -= b.top + 8 - r.top;
        }

        function highlightAt(marks, charIndex) {
            let hit = null;
            for (let i = 0; i < marks.length; i++) {
                if (charIndex < marks[i].end) { hit = marks[i]; break; }
            }
            if (!hit || hit.el === currentWordEl) return;
            if (currentWordEl) {
                currentWordEl.classList.remove("cb-reading");
                currentWordEl.classList.add("cb-said");
            }
            hit.el.classList.add("cb-reading");
            if (highlightedEls.indexOf(hit.el) === -1) highlightedEls.push(hit.el);
            currentWordEl = hit.el;
            keepWordInView(hit.el);
        }

        function clearHighlight() {
            highlightedEls.forEach((el) => el.classList.remove("cb-reading", "cb-said"));
            highlightedEls = [];
            currentWordEl = null;
            const stragglers = document.querySelectorAll("#chatbot-popup .cb-w.cb-reading, #chatbot-popup .cb-w.cb-said");
            Array.prototype.forEach.call(stragglers, (el) => el.classList.remove("cb-reading", "cb-said"));
        }

        function speak(text, bubble) {
            if (!SPEECH_SUPPORTED || !speakEnabled) return;

            stopSpeaking();   // never let two replies overlap

            // Preferred path: take the words straight off the rendered bubble
            // so each spoken word maps to one element we can highlight.
            let chunks = [];
            if (bubble) {
                try {
                    const words = wrapWords(bubble);
                    if (words.length) chunks = chunkWords(words, 180);
                } catch (e) { chunks = []; }
            }
            // Fallback (no bubble, or wrapping failed): speak without highlighting.
            if (!chunks.length) {
                const clean = toSpeakableText(text);
                if (!clean) return;
                chunks = chunkForSpeech(clean, 180).map((t) => ({ text: t, marks: [] }));
            }

            const voice = pickVoice();
            const rate = Number(window.$chatbot_widget && window.$chatbot_widget.speechRate) || 1;
            let sawBoundary = false;   // Firefox/older Safari may never fire onboundary

            chunks.forEach((chunk, i) => {
                const part = chunk.text.trim();
                if (!part) return;
                const marks = chunk.marks;
                const u = new SpeechSynthesisUtterance(part);
                if (voice) { u.voice = voice; u.lang = voice.lang; }
                u.rate = rate;
                u.pitch = 1;

                let fallbackTimer = null;
                u.onstart = () => {
                    markSpeaking(true);
                    if (!marks.length) return;
                    // If no word boundaries arrive, light up the whole chunk
                    // so the reader still sees where the voice is.
                    fallbackTimer = setTimeout(() => {
                        if (sawBoundary) return;
                        marks.forEach((m) => {
                            m.el.classList.add("cb-reading");
                            if (highlightedEls.indexOf(m.el) === -1) highlightedEls.push(m.el);
                        });
                        keepWordInView(marks[marks.length - 1].el);
                    }, 700);
                };
                u.onboundary = (e) => {
                    if (e.name && e.name !== "word") return;
                    if (!marks.length) return;
                    sawBoundary = true;
                    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                    highlightAt(marks, e.charIndex);
                };
                u.onend = () => {
                    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
                    if (i === chunks.length - 1) clearHighlight();
                    if (!window.speechSynthesis.pending && !window.speechSynthesis.speaking) markSpeaking(false);
                };
                u.onerror = () => { clearHighlight(); markSpeaking(false); };
                window.speechSynthesis.speak(u);
            });
        }

        function renderSpeakerBtn() {
            const btn = document.getElementById("speaker-btn");
            if (!btn) return;
            if (!SPEECH_SUPPORTED) { btn.style.display = "none"; return; }
            btn.innerHTML = speakEnabled ? SPEAKER_ON_ICON : SPEAKER_OFF_ICON;
            btn.classList.toggle("cb-muted", !speakEnabled);
            const label = speakEnabled ? "Mute replies" : "Read replies aloud";
            btn.setAttribute("aria-label", label);
            btn.setAttribute("title", label);
            btn.setAttribute("aria-pressed", speakEnabled ? "true" : "false");
        }

        function toggleSpeaker() {
            speakEnabled = !speakEnabled;
            try { localStorage.setItem(SPEAK_STORAGE_KEY, speakEnabled ? "1" : "0"); } catch (e) { /* ignore */ }
            if (!speakEnabled) stopSpeaking();
            renderSpeakerBtn();
        }

        function appendMessage(role, text, shouldScroll = true) {
            const container = document.getElementById("chat-messages");
            if (!container) return;

            const row = document.createElement("div");
            row.className = `chat-message-row ${role === 'user' ? 'chat-message-row-user' : ''}`;

            if (role === 'bot' || role === 'system') {
                const avatar = document.createElement("div");
                avatar.className = "chat-avatar";
                avatar.innerHTML = getBotAvatarHtml();
                row.appendChild(avatar);
            }

            const bubble = document.createElement("div");
            bubble.className = `chat-message-bubble ${
                role === 'user' ? 'chat-message-user' : role === 'system' ? 'chat-message-system' : ''
            }`;
            bubble.innerHTML = marked.parse(text || "");
            row.appendChild(bubble);
            container.appendChild(row);
            if (shouldScroll) autoScroll();
            return bubble;
        }

        function showTyping() {
            const container = document.getElementById("chat-messages");
            if (container.querySelector(".typing-row")) return;

            const row = document.createElement("div");
            row.className = "chat-message-row typing-row";
            row.innerHTML = `
                <div class="chat-avatar">${getBotAvatarHtml()}</div>
                <div class="typing-indicator">
                    <span class="typing-label">Typing</span>
                    <span class="typing-dots"><span></span><span></span><span></span></span>
                </div>
            `;
            container.appendChild(row);
            autoScroll();
        }

        function hideTyping() {
            const el = document.querySelector(".typing-row");
            if (el) el.remove();
        }

        function autoScroll() {
            const body = document.querySelector(".chat-body");
            if (body) setTimeout(() => body.scrollTop = body.scrollHeight, 50);
        }
    }
})();



