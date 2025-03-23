// ✅ Final script.js for Kisaan GPT – 

// DOM ready

document.addEventListener("DOMContentLoaded", function () {
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");
  const chatMessages = document.getElementById("chat-messages");
  const weatherButton = document.getElementById("weatherButton");

  // ✅ Auto-location-based weather fetch using API Ninjas
  async function updateWeather() {
    if (!navigator.geolocation) {
      document.getElementById("weatherDescription").textContent = "GPS उपलब्ध नहीं";
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const apiKey = "d404bc3b32msh0c92cb8f3ea7cfap1d6e84jsn3ed1ad9bde9e"; // optional: replace

      const url = `https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?lat=${lat}&lon=${lon}`;
      const options = {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "weather-by-api-ninjas.p.rapidapi.com"
        }
      };

      try {
        const res = await fetch(url, options);
        const data = await res.json();

        document.getElementById("temperature").textContent = `${data.temp}°C`;
        document.getElementById("humidity").textContent = `आर्द्रता: ${data.humidity}%`;
        document.getElementById("weatherDescription").textContent = "ताज़ा जानकारी";
      } catch (err) {
        console.error("Weather error:", err);
        document.getElementById("weatherDescription").textContent = "डेटा नहीं मिला";
      }
    });
  }

  updateWeather(); // 🔄 Call on page load

  // ✅ Chat reply logic
  function addMessage(role, text) {
    const msg = document.createElement("div");
    msg.className = role;
    msg.innerHTML = `<div class="bubble">${text}</div>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function fetchReply(prompt) {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userPrompt: prompt,
          metadata: {
            user_name: "Ramesh",
            user_location: "Lucknow",
            farming_type: "Wheat"
          }
        })
      });
      const data = await res.json();
      addMessage("assistant", data.reply?.run_id || "Response received.");
    } catch (err) {
      console.error("Chat API error:", err);
      addMessage("assistant", "क्षमा करें, उत्तर प्राप्त नहीं हुआ।");
    }
  }

  // ✅ Send via button click
  sendButton.addEventListener("click", () => {
    const prompt = userInput.value.trim();
    if (prompt) {
      addMessage("user", prompt);
      fetchReply(prompt);
      userInput.value = "";
    }
  });

  // ✅ Send on Enter
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendButton.click();
    }
  });

  // ✅ Weather Button – manually re-fetch
  weatherButton?.addEventListener("click", () => {
    updateWeather();
    addMessage("user", "मौसम की जानकारी दिखाओ");
  });
});
