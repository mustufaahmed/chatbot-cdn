(function () {
  const queryParams = new URLSearchParams(window.location.search);
  const secretKey = queryParams.get("key");
  const NODE_API_URL = "https://your-node-server.com/validate";
  const WS_URL = "wss://your-fastapi-server.com/ws/chat";

  if (!secretKey) return console.error("Chatbot: Secret key is missing.");

  // Validate the key
  fetch(`${NODE_API_URL}?key=${secretKey}`)
    .then((res) => {
      if (res.status !== 200) throw new Error("Unauthorized key");
      injectChatWidget();
    })
    .catch((err) => console.error("Chatbot init failed:", err));

  function injectChatWidget() {
    // Inject stylesheet
    const style = document.createElement("style");
    style.innerHTML = `
      #chat-float-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        padding: 14px 18px;
        cursor: pointer;
        font-size: 18px;
        z-index: 9999;
      }
      #chat-popup {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: white;
        border: 2px solid #007bff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        display: none;
      }
    `;
    document.head.appendChild(style);

    // Add floating button
    const btn = document.createElement("button");
    btn.id = "chat-float-btn";
    btn.innerText = "💬";
    document.body.appendChild(btn);

    // Add popup container
    const popup = document.createElement("div");
    popup.id = "chat-popup";
    document.body.appendChild(popup);

    // Load React + Render
    loadReact(() => {
      ReactDOM.render(
        React.createElement(ChatPopup, { wsUrl: WS_URL, keyToken: secretKey }),
        document.getElementById("chat-popup")
      );
    });

    // Toggle chat popup
    btn.onclick = () => {
      const chat = document.getElementById("chat-popup");
      chat.style.display = chat.style.display === "none" ? "block" : "none";
    };
  }

  function loadReact(callback) {
    const reactScript = document.createElement("script");
    reactScript.src = "https://unpkg.com/react@17/umd/react.development.js";
    const reactDOMScript = document.createElement("script");
    reactDOMScript.src = "https://unpkg.com/react-dom@17/umd/react-dom.development.js";

    reactDOMScript.onload = callback;
    document.head.appendChild(reactScript);
    document.head.appendChild(reactDOMScript);
  }

  // React component
  function ChatPopup(props) {
    const { wsUrl, keyToken } = props;
    const [email, setEmail] = React.useState("");
    const [started, setStarted] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    const [input, setInput] = React.useState("");
    const socketRef = React.useRef(null);

    const startChat = () => {
      socketRef.current = new WebSocket(`${wsUrl}?key=${keyToken}&email=${email}`);
      socketRef.current.onmessage = (event) => {
        setMessages((msgs) => [...msgs, { from: "bot", text: event.data }]);
      };
      setStarted(true);
    };

    const sendMessage = () => {
      if (input.trim() && socketRef.current?.readyState === 1) {
        socketRef.current.send(input);
        setMessages((msgs) => [...msgs, { from: "user", text: input }]);
        setInput("");
      }
    };

    return React.createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", height: "100%" } },
      React.createElement(
        "div",
        {
          style: {
            backgroundColor: "#007bff",
            color: "white",
            padding: "12px",
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            textAlign: "center",
          },
        },
        "Chat with Us"
      ),
      !started
        ? React.createElement(
            "div",
            { style: { padding: 20 } },
            React.createElement("input", {
              placeholder: "Enter your email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              style: { width: "100%", marginBottom: 10, padding: 8 },
            }),
            React.createElement(
              "button",
              {
                onClick: startChat,
                style: {
                  backgroundColor: "#007bff",
                  color: "white",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "6px",
                },
              },
              "Start Chat"
            )
          )
        : React.createElement(
            "div",
            { style: { flex: 1, padding: "10px", overflowY: "auto" } },
            messages.map((msg, idx) =>
              React.createElement(
                "div",
                {
                  key: idx,
                  style: {
                    textAlign: msg.from === "user" ? "right" : "left",
                    margin: "5px 0",
                  },
                },
                React.createElement(
                  "div",
                  {
                    style: {
                      background: msg.from === "user" ? "#e0f0ff" : "#f2f2f2",
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: "8px",
                    },
                  },
                  msg.text
                )
              )
            ),
            React.createElement("input", {
              value: input,
              onChange: (e) => setInput(e.target.value),
              style: { width: "80%", padding: 6 },
              onKeyDown: (e) => e.key === "Enter" && sendMessage(),
            }),
            React.createElement(
              "button",
              { onClick: sendMessage, style: { marginLeft: "5px" } },
              "Send"
            )
          )
    );
  }
})();
