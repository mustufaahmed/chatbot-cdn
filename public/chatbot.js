(function () {
  console.log("✅ Fancy Chatbot loaded!");

  // Add styles
  const style = document.createElement("style");
  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

    #chat-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #4e54c8, #8f94fb);
      color: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 8px 16px rgba(0,0,0,0.3);
      font-size: 26px;
      cursor: pointer;
      z-index: 9999;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #chat-float-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 12px 24px rgba(0,0,0,0.35);
    }

    #chat-popup {
      font-family: 'Inter', sans-serif;
      position: fixed;
      bottom: 100px;
      right: 24px;
      width: 360px;
      max-width: 90%;
      height: 520px;
      background-color: #fff;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 9999;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    #chat-header {
      background: linear-gradient(135deg, #4e54c8, #8f94fb);
      color: white;
      padding: 16px;
      font-weight: 600;
      font-size: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #chat-close {
      background: transparent;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    }

    #chat-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    #chat-email {
      padding: 12px;
      font-size: 14px;
      border: 1px solid #ccc;
      border-radius: 10px;
      margin-bottom: 16px;
    }

    #start-chat-btn {
      padding: 12px;
      background: linear-gradient(135deg, #4e54c8, #8f94fb);
      color: white;
      font-size: 14px;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    #start-chat-btn:hover {
      background: linear-gradient(135deg, #3b3fbb, #7d82fa);
    }
  `;
  document.head.appendChild(style);

  // Create floating button
  const floatBtn = document.createElement("button");
  floatBtn.id = "chat-float-btn";
  floatBtn.title = "Chat with us";
  floatBtn.innerHTML = "💬";
  document.body.appendChild(floatBtn);

  // Create chat popup
  const popup = document.createElement("div");
  popup.id = "chat-popup";
  popup.innerHTML = `
    <div id="chat-header">
      <span>💬 Live Chat</span>
      <button id="chat-close" title="Close">✖</button>
    </div>
    <div id="chat-body">
      <input type="email" id="chat-email" placeholder="Enter your email" />
      <button id="start-chat-btn">Start Chat</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Toggle popup on button click
  floatBtn.addEventListener("click", () => {
    popup.style.display = "flex";
  });

  // Close popup
  document.getElementById("chat-close").addEventListener("click", () => {
    popup.style.display = "none";
  });

  // Start chat logic
  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "start-chat-btn") {
      const email = document.getElementById("chat-email").value.trim();
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email address.");
        return;
      }
      alert("Chat started! (Placeholder)");
      console.log("📨 Email:", email);
    }
  });
})();
