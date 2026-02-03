<script>
    document.addEventListener("DOMContentLoaded", function () {
      // Enhanced theme toggle
      const themeToggle = document.getElementById("themeToggle");
      const body = document.body;
      
      // Enhanced theme detection
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      const savedTheme = localStorage.getItem("meme-theme") || 
                        (prefersDark.matches ? "dark" : "light");
      
      if (savedTheme === "dark") {
        body.classList.add("dark-mode");
        themeToggle.checked = true;
      }
      
      themeToggle.addEventListener("change", function () {
        body.classList.toggle("dark-mode");
        localStorage.setItem("meme-theme", this.checked ? "dark" : "light");
        
        // Update canvas placeholder
        updateCanvasPlaceholder();
      });

      // Canvas setup
      const canvas = document.getElementById("memeCanvas");
      const ctx = canvas.getContext("2d");
      
      // Set initial canvas size
      function setupCanvas() {
        const container = canvas.parentElement;
        const padding = 20;
        canvas.width = container.clientWidth - padding * 2;
        canvas.height = Math.min(500, canvas.width * 0.75);
        drawPlaceholder();
      }

      function drawPlaceholder() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Gradient background
        const gradient = body.classList.contains("dark-mode") 
          ? ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
          : ctx.createLinearGradient(0, 0, canvas.width, 0);
        
        if (body.classList.contains("dark-mode")) {
          gradient.addColorStop(0, "#1e293b");
          gradient.addColorStop(1, "#0f172a");
        } else {
          gradient.addColorStop(0, "#f3f4f6");
          gradient.addColorStop(1, "#e5e7eb");
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw dashed border
        ctx.setLineDash([10, 5]);
        ctx.lineWidth = 2;
        ctx.strokeStyle = body.classList.contains("dark-mode") ? "#4b5563" : "#9ca3af";
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.setLineDash([]);
        
        // Icon and text
        ctx.font = "bold 30px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const icon = "😄";
        const text = "Your Meme Here";
        const subtext = "Add image and text to begin";
        
        ctx.fillStyle = body.classList.contains("dark-mode") ? "#9ca3af" : "#6b7280";
        ctx.fillText(icon, canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.font = "bold 24px Arial";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        
        ctx.font = "16px Arial";
        ctx.fillStyle = body.classList.contains("dark-mode") ? "#6b7280" : "#9ca3af";
        ctx.fillText(subtext, canvas.width / 2, canvas.height / 2 + 40);
      }

      function updateCanvasPlaceholder() {
        if (!currentImage) {
          drawPlaceholder();
        }
      }

      // State variables
      let currentImage = null;
      let recentMemes = JSON.parse(localStorage.getItem("recentMemes")) || [];
      let memeCount = parseInt(localStorage.getItem("memeCount")) || 0;

      // Update meme counter
      function updateMemeCounter() {
        document.getElementById("memeCount").textContent = memeCount;
        document.getElementById("memeCount").classList.add("count-up");
        setTimeout(() => {
          document.getElementById("memeCount").classList.remove("count-up");
        }, 500);
      }

      // DOM Elements
      const elements = {
        imageUrl: document.getElementById("imageUrl"),
        loadImageBtn: document.getElementById("loadImageBtn"),
        loadBtnText: document.getElementById("loadBtnText"),
        loadBtnSpinner: document.getElementById("loadBtnSpinner"),
        uploadBtn: document.getElementById("uploadBtn"),
        fileInput: document.getElementById("fileInput"),
        topText: document.getElementById("topText"),
        bottomText: document.getElementById("bottomText"),
        textColor: document.getElementById("textColor"),
        fontSize: document.getElementById("fontSize"),
        fontSizeValue: document.getElementById("fontSizeValue"),
        fontFamily: document.getElementById("fontFamily"),
        textStroke: document.getElementById("textStroke"),
        textStrokeValue: document.getElementById("textStrokeValue"),
        generateBtn: document.getElementById("generateBtn"),
        downloadBtn: document.getElementById("downloadBtn"),
        shareBtn: document.getElementById("shareBtn"),
        copyBtn: document.getElementById("copyBtn"),
        randomBtn: document.getElementById("randomBtn"),
        randomColor: document.getElementById("randomColor"),
        templateGallery: document.querySelector(".glass-card .grid"),
        recentMemesContainer: document.querySelectorAll(".glass-card .grid")[1],
        clearHistory: document.getElementById("clearHistory"),
        quickHelp: document.getElementById("quickHelp"),
        toggleAdvanced: document.getElementById("toggleAdvanced"),
        advancedOptions: document.getElementById("advancedOptions"),
        topTextCounter: document.getElementById("topTextCounter"),
        bottomTextCounter: document.getElementById("bottomTextCounter")
      };

      // Initialize
      setupCanvas();
      loadTemplates();
      loadRecentMemes();
      updateMemeCounter();

      // Event Listeners
      elements.loadImageBtn.addEventListener("click", loadImageFromUrl);
      elements.uploadBtn.addEventListener("click", () => elements.fileInput.click());
      elements.fileInput.addEventListener("change", handleFileUpload);
      elements.generateBtn.addEventListener("click", generateMeme);
      elements.downloadBtn.addEventListener("click", downloadMeme);
      elements.shareBtn.addEventListener("click", shareMeme);
      elements.copyBtn.addEventListener("click", copyToClipboard);
      elements.randomBtn.addEventListener("click", generateRandomMeme);
      elements.randomColor.addEventListener("click", generateRandomColor);
      elements.clearHistory.addEventListener("click", clearHistory);
      elements.quickHelp.addEventListener("click", showQuickHelp);
      elements.toggleAdvanced.addEventListener("click", toggleAdvancedOptions);

      // Text input character counters
      elements.topText.addEventListener("input", function() {
        elements.topTextCounter.textContent = `${this.value.length}/50`;
      });

      elements.bottomText.addEventListener("input", function() {
        elements.bottomTextCounter.textContent = `${this.value.length}/50`;
      });

      // Real-time updates
      elements.fontSize.addEventListener("input", function() {
        elements.fontSizeValue.textContent = `${this.value}px`;
        if (currentImage) drawMeme();
      });

      elements.textStroke.addEventListener("input", function() {
        elements.textStrokeValue.textContent = `${this.value}px`;
        if (currentImage) drawMeme();
      });

      elements.topText.addEventListener("input", debounce(() => {
        if (currentImage) drawMeme();
      }, 300));

      elements.bottomText.addEventListener("input", debounce(() => {
        if (currentImage) drawMeme();
      }, 300));

      elements.textColor.addEventListener("input", function() {
        if (currentImage) drawMeme();
      });

      elements.fontFamily.addEventListener("change", function() {
        if (currentImage) drawMeme();
      });

      // Functions
      function showToast(title, message, type = "success") {
        const toast = document.getElementById("toast");
        const toastIcon = document.getElementById("toastIcon");
        const toastTitle = document.getElementById("toastTitle");
        const toastMessage = document.getElementById("toastMessage");
        
        // Set icon based on type
        const icons = {
          success: "fa-check-circle",
          error: "fa-exclamation-circle",
          warning: "fa-exclamation-triangle",
          info: "fa-info-circle"
        };
        
        const colors = {
          success: "text-green-500",
          error: "text-red-500",
          warning: "text-yellow-500",
          info: "text-blue-500"
        };
        
        toastIcon.className = `fas ${icons[type]} text-2xl ${colors[type]}`;
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        toast.classList.remove("hidden");
        toast.classList.add("animate__animated", "animate__fadeInRight");
        
        setTimeout(() => {
          toast.classList.remove("animate__fadeInRight");
          toast.classList.add("animate__fadeOutRight");
          setTimeout(() => {
            toast.classList.add("hidden");
            toast.classList.remove("animate__fadeOutRight");
          }, 500);
        }, 3000);
      }

      function showProgress(show) {
        const progressBar = document.getElementById("progressBar");
        const progressFill = document.getElementById("progressFill");
        
        if (show) {
          progressBar.classList.remove("hidden");
          let width = 0;
          const interval = setInterval(() => {
            width += 10;
            progressFill.style.width = `${width}%`;
            if (width >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                progressBar.classList.add("hidden");
                progressFill.style.width = "0%";
              }, 500);
            }
          }, 100);
        } else {
          progressBar.classList.add("hidden");
          progressFill.style.width = "0%";
        }
      }

      async function loadImageFromUrl() {
        const imageUrl = elements.imageUrl.value.trim();
        
        if (!imageUrl) {
          showToast("Oops!", "Please enter an image URL", "warning");
          return;
        }

        // Show loading state
        elements.loadBtnText.textContent = "Loading...";
        elements.loadBtnSpinner.classList.remove("hidden");
        elements.loadImageBtn.disabled = true;
        
        showProgress(true);

        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        try {
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl + (imageUrl.includes('?') ? '&' : '?') + 't=' + Date.now();
          });
          
          currentImage = img;
          drawMeme();
          
          // Hide canvas placeholder
          document.getElementById("canvasPlaceholder").style.display = "none";
          
          showToast("Success!", "Image loaded successfully!", "success");
        } catch (error) {
          showToast("Error!", "Failed to load image. Please check the URL.", "error");
          console.error("Image loading error:", error);
        } finally {
          // Reset loading state
          elements.loadBtnText.textContent = "Load";
          elements.loadBtnSpinner.classList.add("hidden");
          elements.loadImageBtn.disabled = false;
          showProgress(false);
        }
      }

      function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
          showToast("Invalid File", "Please select an image file", "error");
          return;
        }
        
        showProgress(true);
        
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            currentImage = img;
            elements.imageUrl.value = e.target.result;
            drawMeme();
            document.getElementById("canvasPlaceholder").style.display = "none";
            showProgress(false);
            showToast("Success!", "Image uploaded successfully!", "success");
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      function drawMeme() {
        if (!currentImage) return;
        
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate image dimensions while maintaining aspect ratio
        const imgRatio = currentImage.width / currentImage.height;
        const canvasRatio = width / height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imgRatio > canvasRatio) {
          drawWidth = width;
          drawHeight = width / imgRatio;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        } else {
          drawHeight = height;
          drawWidth = height * imgRatio;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        }
        
        // Draw image
        ctx.drawImage(currentImage, offsetX, offsetY, drawWidth, drawHeight);
        
        // Text styles
        const fontSize = parseInt(elements.fontSize.value);
        const fontFamily = elements.fontFamily.value;
        const textColor = elements.textColor.value;
        const strokeSize = parseInt(elements.textStroke.value);
        
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = strokeSize > 0 ? "black" : "transparent";
        ctx.fillStyle = textColor;
        ctx.lineJoin = "round";
        
        // Draw top text with shadow
        const topText = elements.topText.value;
        if (topText) {
          const textY = offsetY + fontSize + 20;
          if (strokeSize > 0) {
            ctx.strokeText(topText, width / 2, textY);
          }
          ctx.fillText(topText, width / 2, textY);
        }
        
        // Draw bottom text with shadow
        const bottomText = elements.bottomText.value;
        if (bottomText) {
          const textY = height - offsetY - 20;
          if (strokeSize > 0) {
            ctx.strokeText(bottomText, width / 2, textY);
          }
          ctx.fillText(bottomText, width / 2, textY);
        }
        
        // Add pulse animation
        canvas.classList.add("pulse-effect");
        setTimeout(() => canvas.classList.remove("pulse-effect"), 2000);
      }

      function generateMeme() {
        if (!currentImage) {
          showToast("No Image", "Please load an image first", "warning");
          return;
        }
        
        showProgress(true);
        
        setTimeout(() => {
          drawMeme();
          saveRecentMeme();
          memeCount++;
          localStorage.setItem("memeCount", memeCount);
          updateMemeCounter();
          showProgress(false);
          showToast("Awesome!", "Meme generated successfully!", "success");
        }, 800);
      }

      function downloadMeme() {
        if (!currentImage) {
          showToast("No Meme", "Please generate a meme first", "warning");
          return;
        }
        
        const link = document.createElement("a");
        link.download = `meme-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("Downloaded!", "Meme saved to your device", "success");
      }

      async function shareMeme() {
        if (!currentImage) {
          showToast("No Meme", "Please generate a meme first", "warning");
          return;
        }
        
        if (navigator.share) {
          try {
            canvas.toBlob(async (blob) => {
              const file = new File([blob], "meme.png", { type: "image/png" });
              
              await navigator.share({
                files: [file],
                title: "Check out this meme!",
                text: "I created this hilarious meme using Meme Generator Pro!"
              });
              
              showToast("Shared!", "Meme shared successfully!", "success");
            });
          } catch (error) {
            console.log("Sharing cancelled:", error);
          }
        } else {
          copyToClipboard();
        }
      }

      async function copyToClipboard() {
        if (!currentImage) {
          showToast("No Meme", "Please generate a meme first", "warning");
          return;
        }
        
        try {
          canvas.toBlob((blob) => {
            const item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]);
            showToast("Copied!", "Meme copied to clipboard!", "success");
          });
        } catch (error) {
          const dataUrl = canvas.toDataURL("image/png");
          navigator.clipboard.writeText(dataUrl)
            .then(() => showToast("Copied!", "Image URL copied to clipboard!", "success"))
            .catch(() => showToast("Error", "Failed to copy to clipboard", "error"));
        }
      }

      function generateRandomMeme() {
        const templates = [
          {
            name: "Distracted Boyfriend",
            url: "https://i.imgflip.com/1bij.jpg",
            topText: "My responsibilities",
            bottomText: "Me scrolling through memes",
          },
          {
            name: "Drake Hotline Bling",
            url: "https://i.imgflip.com/30b1gx.jpg",
            topText: "Doing actual work",
            bottomText: "Making memes instead",
          },
          {
            name: "Two Buttons",
            url: "https://i.imgflip.com/1g8my4.jpg",
            topText: "Be productive",
            bottomText: "Make another meme",
          },
          {
            name: "Change My Mind",
            url: "https://i.imgflip.com/24y43o.jpg",
            topText: "This is the best meme generator",
            bottomText: "Change my mind",
          },
          {
            name: "Batman Slapping Robin",
            url: "https://i.imgflip.com/9ehk.jpg",
            topText: "When someone says",
            bottomText: "'Memes aren't art'",
          },
          {
            name: "Woman Yelling at Cat",
            url: "https://i.imgflip.com/1h7in3.jpg",
            topText: "My brain telling me to sleep",
            bottomText: "Me at 3 AM making memes",
          },
        ];
        
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        
        // Update form with random values
        elements.imageUrl.value = randomTemplate.url;
        elements.topText.value = randomTemplate.topText;
        elements.bottomText.value = randomTemplate.bottomText;
        
        // Randomize text color
        generateRandomColor();
        
        // Random font size between 30-60
        const randomFontSize = Math.floor(Math.random() * 31) + 30;
        elements.fontSize.value = randomFontSize;
        elements.fontSizeValue.textContent = `${randomFontSize}px`;
        
        // Random outline
        elements.textStroke.value = Math.floor(Math.random() * 5);
        elements.textStrokeValue.textContent = `${elements.textStroke.value}px`;
        
        // Load the image
        loadImageFromUrl();
        
        showToast("Random!", "Random meme generated!", "info");
      }

      function generateRandomColor() {
        const colors = [
          "#ffffff", "#ff0000", "#00ff00", "#0000ff", 
          "#ffff00", "#ff00ff", "#00ffff", "#ff8800",
          "#8800ff", "#ff0088", "#88ff00", "#0088ff"
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        elements.textColor.value = randomColor;
        if (currentImage) drawMeme();
      }

      function loadTemplates() {
        const templates = [
          {
            name: "Distracted Boyfriend",
            url: "https://i.imgflip.com/1bij.jpg",
            color: "from-red-500 to-orange-500"
          },
          {
            name: "Drake Hotline Bling",
            url: "https://i.imgflip.com/30b1gx.jpg",
            color: "from-purple-500 to-pink-500"
          },
          {
            name: "Two Buttons",
            url: "https://i.imgflip.com/1g8my4.jpg",
            color: "from-blue-500 to-cyan-500"
          },
          {
            name: "Change My Mind",
            url: "https://i.imgflip.com/24y43o.jpg",
            color: "from-green-500 to-emerald-500"
          },
          {
            name: "Batman Slapping Robin",
            url: "https://i.imgflip.com/9ehk.jpg",
            color: "from-yellow-500 to-orange-500"
          },
          {
            name: "Woman Yelling at Cat",
            url: "https://i.imgflip.com/1h7in3.jpg",
            color: "from-pink-500 to-rose-500"
          },
          {
            name: "Expanding Brain",
            url: "https://i.imgflip.com/1jwhww.jpg",
            color: "from-indigo-500 to-purple-500"
          },
          {
            name: "Surprised Pikachu",
            url: "https://i.imgflip.com/2kbn1e.jpg",
            color: "from-yellow-400 to-yellow-600"
          }
        ];
        
        elements.templateGallery.innerHTML = "";
        
        templates.forEach((template, index) => {
          const templateElement = document.createElement("div");
          templateElement.className = "template-card cursor-pointer";
          templateElement.innerHTML = `
            <div class="relative overflow-hidden rounded-xl aspect-square group">
              <div class="absolute inset-0 bg-gradient-to-br ${template.color} opacity-20"></div>
              <img src="${template.url}" alt="${template.name}" 
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                          flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="text-white">
                  <p class="font-bold">${template.name}</p>
                  <p class="text-xs opacity-75">Click to use</p>
                </div>
              </div>
              <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 
                          flex items-center justify-center text-xs font-bold">
                ${index + 1}
              </div>
            </div>
          `;
          
          templateElement.addEventListener("click", () => {
            elements.imageUrl.value = template.url;
            elements.topText.value = "";
            elements.bottomText.value = "";
            loadImageFromUrl();
            
            // Smooth scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            showToast("Template Loaded", `${template.name} template selected`, "info");
          });
          
          elements.templateGallery.appendChild(templateElement);
        });
      }

      function saveRecentMeme() {
        const memeData = {
          id: Date.now(),
          imageUrl: elements.imageUrl.value,
          topText: elements.topText.value,
          bottomText: elements.bottomText.value,
          timestamp: new Date().toISOString(),
          dataUrl: canvas.toDataURL("image/png")
        };
        
        recentMemes.unshift(memeData);
        
        if (recentMemes.length > 6) {
          recentMemes = recentMemes.slice(0, 6);
        }
        
        localStorage.setItem("recentMemes", JSON.stringify(recentMemes));
        loadRecentMemes();
      }

      function loadRecentMemes() {
        const container = elements.recentMemesContainer;
        
        if (recentMemes.length === 0) {
          container.innerHTML = `
            <div class="col-span-full text-center py-8">
              <i class="fas fa-ghost text-4xl text-gray-400 mb-3"></i>
              <p class="text-gray-500">No memes yet</p>
              <p class="text-sm text-gray-400 mt-1">Your creations will appear here</p>
            </div>
          `;
          return;
        }
        
        container.innerHTML = "";
        
        recentMemes.forEach((meme, index) => {
          const memeElement = document.createElement("div");
          memeElement.className = "template-card cursor-pointer";
          memeElement.innerHTML = `
            <div class="relative overflow-hidden rounded-xl aspect-square group">
              <img src="${meme.dataUrl}" alt="Recent meme ${index + 1}" 
                   class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent 
                          flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="text-white">
                  <p class="text-xs font-medium truncate">${meme.topText || "No text"}</p>
                  <p class="text-[10px] opacity-75">${new Date(meme.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div class="absolute top-2 left-2 w-6 h-6 rounded-full bg-purple-500 
                          flex items-center justify-center text-xs font-bold text-white">
                <i class="fas fa-history"></i>
              </div>
            </div>
          `;
          
          memeElement.addEventListener("click", () => {
            elements.imageUrl.value = meme.imageUrl;
            elements.topText.value = meme.topText;
            elements.bottomText.value = meme.bottomText;
            loadImageFromUrl();
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showToast("Loaded", "Previous meme loaded", "info");
          });
          
          container.appendChild(memeElement);
        });
      }

      function clearHistory() {
        if (confirm("Are you sure you want to clear all recent memes?")) {
          recentMemes = [];
          localStorage.removeItem("recentMemes");
          loadRecentMemes();
          showToast("Cleared", "Recent memes cleared", "info");
        }
      }

      function showQuickHelp() {
        showToast("Quick Tips", 
          "• Click templates for auto-fill\n• Use random button for surprises\n• Share your creations!", 
          "info"
        );
      }

      function toggleAdvancedOptions() {
        const icon = elements.toggleAdvanced.querySelector("i");
        const options = elements.advancedOptions;
        
        if (options.classList.contains("hidden")) {
          options.classList.remove("hidden");
          icon.className = "fas fa-chevron-up mr-1";
        } else {
          options.classList.add("hidden");
          icon.className = "fas fa-chevron-down mr-1";
        }
      }

      // Utility function for debouncing
      function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }

      // Add CSS animations
      const style = document.createElement('style');
      style.textContent = `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        
        .animate__animated { animation-duration: 0.5s; }
        .animate__fadeInRight { animation-name: fadeInRight; }
        .animate__fadeOutRight { animation-name: fadeOutRight; }
        
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fadeOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(30px); }
        }
      `;
      document.head.appendChild(style);

      // Window resize handling
      window.addEventListener("resize", debounce(() => {
        setupCanvas();
        if (currentImage) drawMeme();
      }, 250));

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "g") {
          e.preventDefault();
          generateMeme();
        }
        if (e.ctrlKey && e.key === "s") {
          e.preventDefault();
          downloadMeme();
        }
        if (e.ctrlKey && e.key === "r") {
          e.preventDefault();
          generateRandomMeme();
        }
      });

      // Add keyboard shortcut hint
      showToast("Pro Tip", "Use Ctrl+G to generate, Ctrl+S to save, Ctrl+R for random!", "info");
      setTimeout(() => {
        const quickStats = document.querySelectorAll('.glass-card');
        quickStats.forEach(card => {
          card.classList.add('animate__animated', 'animate__fadeInUp');
        });
      }, 100);
    });
  </script>