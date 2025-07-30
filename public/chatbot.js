(function () {
  console.log("✅ Chatbot script loaded!");

  // Inject CSS styles
  const style = document.createElement("style");
  style.innerHTML = `
    #chat-float-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #0d6efd;
      color: #fff;
      border: none;
      border-radius: 50%;
      width: 56px;
      height: 56px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      transition: background-color 0.3s ease;
      z-index: 10000;
    }

    #chat-float-btn:hover {
      background-color: #0b5ed7;
    }

    #chat-popup {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 360px;
      max-width: 90%;
      height: 520px;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 10000;
    }

    #chat-header {
      background-color: #0d6efd;
      color: white;
      padding: 16px;
      font-size: 16px;
      font-weight: 600;
      text-align: center;
    }

    #chat-body {
      padding: 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    #chat-email {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 8px;
      margin-bottom: 12px;
      font-size: 14px;
    }

    #start-chat-btn {
      padding: 10px;
      background-color: #0d6efd;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    #start-chat-btn:hover {
      background-color: #0b5ed7;
    }
  `;
  document.head.appendChild(style);

  // Floating button
  const floatBtn = document.createElement("button");
  floatBtn.id = "chat-float-btn";
  floatBtn.title = "Chat with us";
  floatBtn.innerHTML = "💬";
  document.body.appendChild(floatBtn);

  // Popup HTML
  const popup = document.createElement("div");
  popup.id = "chat-popup";
  popup.innerHTML = `
    <div id="chat-header">💬 Chat with Us</div>
    <div id="chat-body">
      <input type="email" id="chat-email" placeholder="Enter your email" />
      <button id="start-chat-btn">Start Chat</button>
    </div>
  `;
  document.body.appendChild(popup);

  // Show/hide popup
  floatBtn.addEventListener("click", () => {
    const chatPopup = document.getElementById("chat-popup");
    const isVisible = chatPopup.style.display === "block";
    chatPopup.style.display = isVisible ? "none" : "block";
  });

  // Handle chat start
  document.addEventListener("click", function (e) {
    if (e.target && e.target.id === "start-chat-btn") {
      const email = document.getElementById("chat-email").value.trim();
      if (!email || !email.includes("@")) {
        alert("Please enter a valid email.");
        return;
      }

      console.log("📧 Email:", email);
      alert("Chat started! (This is just a placeholder)");
      // You can now trigger your actual chat logic
    }
  });
})();
