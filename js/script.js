<script>
    document.addEventListener("DOMContentLoaded", function () {
      // Theme toggle functionality
      const themeToggle = document.getElementById("themeToggle");
      const body = document.body;

      // Check for saved theme preference or default to light
      const savedTheme = localStorage.getItem("meme-theme") || "light";
      if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        themeToggle.checked = true;
      }

      themeToggle.addEventListener("change", function () {
        if (this.checked) {
          body.classList.add("dark-mode");
          localStorage.setItem("meme-theme", "dark");
        } else {
          body.classList.remove("dark-mode");
          localStorage.setItem("meme-theme", "light");
        }
      });

      // Canvas setup
      const canvas = document.getElementById("memeCanvas");
      const ctx = canvas.getContext("2d");

      // Input elements
      const imageUrlInput = document.getElementById("imageUrl");
      const loadImageBtn = document.getElementById("loadImageBtn");
      const loadBtnText = document.getElementById("loadBtnText");
      const loadBtnSpinner = document.getElementById("loadBtnSpinner");
      const topTextInput = document.getElementById("topText");
      const bottomTextInput = document.getElementById("bottomText");
      const textColorInput = document.getElementById("textColor");
      const fontSizeInput = document.getElementById("fontSize");
      const fontSizeValue = document.getElementById("fontSizeValue");
      const fontFamilyInput = document.getElementById("fontFamily");
      const textStrokeInput = document.getElementById("textStroke");
      const textStrokeValue = document.getElementById("textStrokeValue");
      const generateBtn = document.getElementById("generateBtn");
      const downloadBtn = document.getElementById("downloadBtn");
      const shareBtn = document.getElementById("shareBtn");
      const randomBtn = document.getElementById("randomBtn");
      const templateGallery = document.getElementById("templateGallery");
      const recentMemesContainer = document.getElementById("recentMemes");

      // State
      let currentImage = null;
      let recentMemes = JSON.parse(localStorage.getItem("recentMemes")) || [];

      // Initialize
      setupCanvas();
      loadTemplates();
      loadRecentMemes();

      // Event listeners
      loadImageBtn.addEventListener("click", loadImageFromUrl);
      generateBtn.addEventListener("click", generateMeme);
      downloadBtn.addEventListener("click", downloadMeme);
      shareBtn.addEventListener("click", shareMeme);
      randomBtn.addEventListener("click", generateRandomMeme);
      
      fontSizeInput.addEventListener("input", function () {
        fontSizeValue.textContent = `${this.value}px`;
        if (currentImage) drawMeme();
      });
      
      textStrokeInput.addEventListener("input", function () {
        textStrokeValue.textContent = `${this.value}px`;
        if (currentImage) drawMeme();
      });

      // Real-time updates for text and color changes
      topTextInput.addEventListener("input", function () {
        if (currentImage) drawMeme();
      });
      
      bottomTextInput.addEventListener("input", function () {
        if (currentImage) drawMeme();
      });
      
      textColorInput.addEventListener("input", function () {
        if (currentImage) drawMeme();
      });
      
      fontFamilyInput.addEventListener("change", function () {
        if (currentImage) drawMeme();
      });

      // Functions
      function setupCanvas() {
        // Set canvas size while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 500;

        canvas.width = Math.min(window.innerWidth - 40, maxWidth);
        canvas.height = Math.min(window.innerWidth * 0.6, maxHeight);

        // Draw placeholder
        ctx.fillStyle = body.classList.contains("dark-mode") ? "#374151" : "#f3f4f6";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = body.classList.contains("dark-mode") ? "#9ca3af" : "#6b7280";
        ctx.textAlign = "center";
        ctx.font = "20px Arial";
        ctx.fillText(
          "Your meme will appear here",
          canvas.width / 2,
          canvas.height / 2
        );
        
        // Draw a small icon
        ctx.font = "40px Arial";
        ctx.fillText("😄", canvas.width / 2, canvas.height / 2 - 50);
      }

      function loadImageFromUrl() {
        const imageUrl = imageUrlInput.value.trim();

        if (!imageUrl) {
          showAlert("Please enter an image URL", "warning");
          return;
        }

        // Show loading state
        loadBtnText.textContent = "Loading...";
        loadBtnSpinner.classList.remove("hidden");

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function () {
          currentImage = img;
          drawMeme();
          
          // Reset loading state
          loadBtnText.textContent = "Load";
          loadBtnSpinner.classList.add("hidden");
        };
        img.onerror = function () {
          showAlert("Failed to load image. Please check the URL and try again.", "error");
          
          // Reset loading state
          loadBtnText.textContent = "Load";
          loadBtnSpinner.classList.add("hidden");
        };
        img.src = imageUrl;
      }

      function drawMeme() {
        if (!currentImage) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Calculate dimensions to maintain aspect ratio
        const ratio = Math.min(
          canvas.width / currentImage.width,
          canvas.height / currentImage.height
        );

        const width = currentImage.width * ratio;
        const height = currentImage.height * ratio;
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;

        // Draw image
        ctx.drawImage(currentImage, x, y, width, height);

        // Text styles
        const fontSize = parseInt(fontSizeInput.value);
        const fontFamily = fontFamilyInput.value;
        const textColor = textColorInput.value;
        const strokeSize = parseInt(textStrokeInput.value);

        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = "black";
        ctx.fillStyle = textColor;

        // Draw top text
        const topText = topTextInput.value;
        if (topText) {
          ctx.strokeText(topText, canvas.width / 2, y + fontSize + 10);
          ctx.fillText(topText, canvas.width / 2, y + fontSize + 10);
        }

        // Draw bottom text
        const bottomText = bottomTextInput.value;
        if (bottomText) {
          ctx.strokeText(bottomText, canvas.width / 2, canvas.height - y - 10);
          ctx.fillText(bottomText, canvas.width / 2, canvas.height - y - 10);
        }

        // Add pulse animation
        canvas.classList.add("meme-pulse");
        setTimeout(() => {
          canvas.classList.remove("meme-pulse");
        }, 300);
      }

      function generateMeme() {
        if (!currentImage) {
          showAlert("Please load an image first", "warning");
          return;
        }

        drawMeme();
        saveRecentMeme();
        showAlert("Meme generated successfully!", "success");
      }

      function downloadMeme() {
        if (!currentImage) {
          showAlert("Please generate a meme first", "warning");
          return;
        }

        const link = document.createElement("a");
        link.download = `meme-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        
        showAlert("Meme downloaded!", "success");
      }

      function shareMeme() {
        if (!currentImage) {
          showAlert("Please generate a meme first", "warning");
          return;
        }

        canvas.toBlob(blob => {
          const file = new File([blob], "meme.png", { type: "image/png" });
          
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            navigator.share({
              files: [file],
              title: 'Check out this meme!',
              text: 'I created this meme using the Meme Generator!'
            });
          } else {
            // Fallback: Copy to clipboard or show modal
            const dataUrl = canvas.toDataURL("image/png");
            navigator.clipboard.writeText(dataUrl).then(() => {
              showAlert("Meme copied to clipboard!", "success");
            }).catch(() => {
              // Download as fallback
              downloadMeme();
            });
          }
        });
      }

      function generateRandomMeme() {
        const templates = [
          {
            name: "Distracted Boyfriend",
            url: "https://i.imgflip.com/1bij.jpg",
            topText: "Me ignoring my responsibilities",
            bottomText: "Me looking at memes"
          },
          {
            name: "Drake Hotline Bling",
            url: "https://i.imgflip.com/30b1gx.jpg",
            topText: "Doing work",
            bottomText: "Making memes"
          },
          {
            name: "Two Buttons",
            url: "https://i.imgflip.com/1g8my4.jpg",
            topText: "Make a normal meme",
            bottomText: "Add random nonsense"
          },
          {
            name: "Change My Mind",
            url: "https://i.imgflip.com/24y43o.jpg",
            topText: "This is the best meme generator",
            bottomText: "Change my mind"
          },
          {
            name: "Batman Slapping Robin",
            url: "https://i.imgflip.com/9ehk.jpg",
            topText: "When someone says",
            bottomText: "Memes aren't art"
          },
          {
            name: "Expanding Brain",
            url: "https://i.imgflip.com/1jwhww.jpg",
            topText: "Small brain: Using meme templates",
            bottomText: "Galaxy brain: Making your own"
          }
        ];

        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        imageUrlInput.value = randomTemplate.url;
        topTextInput.value = randomTemplate.topText;
        bottomTextInput.value = randomTemplate.bottomText;
        
        // Randomize text color
        const colors = ["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];
        textColorInput.value = colors[Math.floor(Math.random() * colors.length)];
        
        // Randomize font size
        fontSizeInput.value = Math.floor(Math.random() * 30) + 30;
        fontSizeValue.textContent = `${fontSizeInput.value}px`;
        
        loadImageFromUrl();
      }

      function loadTemplates() {
        const templates = [
          {
            name: "Distracted Boyfriend",
            url: "https://i.imgflip.com/1bij.jpg",
          },
          {
            name: "Drake Hotline Bling",
            url: "https://i.imgflip.com/30b1gx.jpg",
          },
          {
            name: "Two Buttons",
            url: "https://i.imgflip.com/1g8my4.jpg",
          },
          {
            name: "Change My Mind",
            url: "https://i.imgflip.com/24y43o.jpg",
          },
          {
            name: "Batman Slapping Robin",
            url: "https://i.imgflip.com/9ehk.jpg",
          },
          {
            name: "Woman Yelling at Cat",
            url: "https://i.imgflip.com/1h7in3.jpg",
          },
          {
            name: "Expanding Brain",
            url: "https://i.imgflip.com/1jwhww.jpg",
          },
          {
            name: "Surprised Pikachu",
            url: "https://i.imgflip.com/2kbn1e.jpg",
          },
        ];

        templateGallery.innerHTML = "";

        templates.forEach((template) => {
          const templateElement = document.createElement("div");
          templateElement.className = "cursor-pointer group";
          templateElement.innerHTML = `
                <div class="relative overflow-hidden rounded-lg aspect-square">
                    <img src="${template.url}" alt="${template.name}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200">
                    <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white font-medium text-sm text-center px-2">${template.name}</span>
                    </div>
                </div>
            `;
          templateElement.addEventListener("click", () => {
            imageUrlInput.value = template.url;
            loadImageFromUrl();

            // Add some funny default text based on template
            if (template.name === "Distracted Boyfriend") {
              topTextInput.value = "Me ignoring my responsibilities";
              bottomTextInput.value = "Me looking at memes";
            } else if (template.name === "Drake Hotline Bling") {
              topTextInput.value = "Doing work";
              bottomTextInput.value = "Making memes";
            } else if (template.name === "Surprised Pikachu") {
              topTextInput.value = "When you realize";
              bottomTextInput.value = "It's already Monday";
            }

            window.scrollTo({ top: 0, behavior: "smooth" });
          });

          templateGallery.appendChild(templateElement);
        });
      }

      function saveRecentMeme() {
        const memeData = {
          imageUrl: imageUrlInput.value,
          topText: topTextInput.value,
          bottomText: bottomTextInput.value,
          timestamp: new Date().toISOString(),
          dataUrl: canvas.toDataURL("image/png"),
        };

        // Add to beginning of array
        recentMemes.unshift(memeData);

        // Keep only last 6 memes
        if (recentMemes.length > 6) {
          recentMemes = recentMemes.slice(0, 6);
        }

        localStorage.setItem("recentMemes", JSON.stringify(recentMemes));
        loadRecentMemes();
      }

      function loadRecentMemes() {
        if (recentMemes.length === 0) {
          recentMemesContainer.innerHTML =
            '<p class="text-gray-500 col-span-full text-center py-4">No recent memes yet</p>';
          return;
        }

        recentMemesContainer.innerHTML = "";

        recentMemes.forEach((meme, index) => {
          const memeElement = document.createElement("div");
          memeElement.className = "cursor-pointer group";
          memeElement.innerHTML = `
                <div class="relative overflow-hidden rounded-lg aspect-square">
                    <img src="${meme.dataUrl}" alt="Recent meme ${index + 1}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200">
                    <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white font-medium text-sm text-center px-2">${meme.topText || ""
            } ${meme.bottomText || ""}</span>
                    </div>
                </div>
            `;

          memeElement.addEventListener("click", () => {
            imageUrlInput.value = meme.imageUrl;
            topTextInput.value = meme.topText;
            bottomTextInput.value = meme.bottomText;
            loadImageFromUrl();
            window.scrollTo({ top: 0, behavior: "smooth" });
          });

          recentMemesContainer.appendChild(memeElement);
        });
      }

      function showAlert(message, type) {
        // Remove any existing alert
        const existingAlert = document.querySelector(".custom-alert");
        if (existingAlert) existingAlert.remove();

        const alert = document.createElement("div");
        alert.className = `custom-alert fixed top-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 flex items-center ${
          type === "success" ? "bg-green-500" : 
          type === "error" ? "bg-red-500" : 
          "bg-yellow-500"
        } text-white`;
        
        alert.innerHTML = `
          <i class="fas ${
            type === "success" ? "fa-check-circle" : 
            type === "error" ? "fa-exclamation-circle" : 
            "fa-exclamation-triangle"
          } mr-2"></i>
          <span>${message}</span>
        `;

        document.body.appendChild(alert);

        // Remove alert after 3 seconds
        setTimeout(() => {
          alert.remove();
        }, 3000);
      }

      // Responsive adjustments
      window.addEventListener("resize", function () {
        setupCanvas();
        if (currentImage) {
          drawMeme();
        }
      });
    });
  </script>