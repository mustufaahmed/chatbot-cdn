(function () {
  console.log("✅ Chatbot script loaded!");

  // Inject styles
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
      font-size: 20px;
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
      overflow: hidden;
    }

    #chat-header {
      background-color: #007bff;
      color: white;
      padding: 12px;
      font-weight: bold;
      text-align: center;
    }

    #chat-body {
      padding: 12px;
      font-size: 14px;
    }

    #chat-email {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      border: 1px solid #ccc;
      border-radius: 6px;
    }

    #start-chat-btn {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  // Add floating button
  const floatBtn = document.createElement("button");
  floatBtn.id = "chat-float-btn";
  floatBtn.innerText = "💬";
  document.body.appendChild(floatBtn);

  // Add popup container
  const popup = document.createElement("div");
  popup.id = "chat-popup";
  popup.innerHTML = `
    <div id="chat-header">Chat with Us</div>
    <div id="chat-body">
      <input id="chat-email" placeholder="Enter your email" />
      <button id="start-chat-btn">Start Chat</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Toggle popup
  floatBtn.addEventListener("click", () => {
    const chat = document.getElementById("chat-popup");
    const isOpen = chat.style.display === "block";
    chat.style.display = isOpen ? "none" : "block";
    console.log("💬 Chat popup toggled:", isOpen ? "closed" : "opened");
  });

  // Handle start chat
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "start-chat-btn") {
      const email = document.getElementById("chat-email").value;
      console.log("📧 Email entered:", email);
      alert("Chat started (placeholder only)");
    }
  });
})();
