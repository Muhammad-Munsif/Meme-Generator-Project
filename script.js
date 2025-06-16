document.addEventListener('DOMContentLoaded', function() {
    // Canvas setup
    const canvas = document.getElementById('memeCanvas');
    const ctx = canvas.getContext('2d');
    
    // Input elements
    const imageUrlInput = document.getElementById('imageUrl');
    const loadImageBtn = document.getElementById('loadImageBtn');
    const topTextInput = document.getElementById('topText');
    const bottomTextInput = document.getElementById('bottomText');
    const textColorInput = document.getElementById('textColor');
    const fontSizeInput = document.getElementById('fontSize');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const fontFamilyInput = document.getElementById('fontFamily');
    const textStrokeInput = document.getElementById('textStroke');
    const textStrokeValue = document.getElementById('textStrokeValue');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const templateGallery = document.getElementById('templateGallery');
    const recentMemesContainer = document.getElementById('recentMemes');
    
    // State
    let currentImage = null;
    let recentMemes = JSON.parse(localStorage.getItem('recentMemes')) || [];
    
    // Initialize
    setupCanvas();
    loadTemplates();
    loadRecentMemes();
    
    // Event listeners
    loadImageBtn.addEventListener('click', loadImageFromUrl);
    generateBtn.addEventListener('click', generateMeme);
    downloadBtn.addEventListener('click', downloadMeme);
    
    fontSizeInput.addEventListener('input', function() {
        fontSizeValue.textContent = `${this.value}px`;
    });
    
    textStrokeInput.addEventListener('input', function() {
        textStrokeValue.textContent = `${this.value}px`;
    });
    
    // Functions
    function setupCanvas() {
        // Set canvas size while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 500;
        
        canvas.width = Math.min(window.innerWidth - 40, maxWidth);
        canvas.height = Math.min(window.innerWidth * 0.6, maxHeight);
        
        // Draw placeholder
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#9ca3af';
        ctx.textAlign = 'center';
        ctx.font = '20px Arial';
        ctx.fillText('Your meme will appear here', canvas.width / 2, canvas.height / 2);
    }
    
    function loadImageFromUrl() {
        const imageUrl = imageUrlInput.value.trim();
        
        if (!imageUrl) {
            alert('Please enter an image URL');
            return;
        }
        
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = function() {
            currentImage = img;
            drawMeme();
        };
        img.onerror = function() {
            alert('Failed to load image. Please check the URL and try again.');
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
        ctx.textAlign = 'center';
        ctx.lineWidth = strokeSize;
        ctx.strokeStyle = 'black';
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
        canvas.classList.add('meme-pulse');
        setTimeout(() => {
            canvas.classList.remove('meme-pulse');
        }, 300);
    }
    
    function generateMeme() {
        if (!currentImage) {
            alert('Please load an image first');
            return;
        }
        
        drawMeme();
        saveRecentMeme();
    }
    
    function downloadMeme() {
        if (!currentImage) {
            alert('Please generate a meme first');
            return;
        }
        
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    function loadTemplates() {
        const templates = [
            {
                name: 'Distracted Boyfriend',
                url: 'https://i.imgflip.com/1bij.jpg'
            },
            {
                name: 'Drake Hotline Bling',
                url: 'https://i.imgflip.com/30b1gx.jpg'
            },
            {
                name: 'Two Buttons',
                url: 'https://i.imgflip.com/1g8my4.jpg'
            },
            {
                name: 'Change My Mind',
                url: 'https://i.imgflip.com/24y43o.jpg'
            },
            {
                name: 'Batman Slapping Robin',
                url: 'https://i.imgflip.com/9ehk.jpg'
            },
            {
                name: 'Woman Yelling at Cat',
                url: 'https://i.imgflip.com/1h7in3.jpg'
            },
            {
                name: 'Expanding Brain',
                url: 'https://i.imgflip.com/1jwhww.jpg'
            },
            {
                name: 'Surprised Pikachu',
                url: 'https://i.imgflip.com/2kbn1e.jpg'
            }
        ];
        
        templateGallery.innerHTML = '';
        
        templates.forEach(template => {
            const templateElement = document.createElement('div');
            templateElement.className = 'cursor-pointer group';
            templateElement.innerHTML = `
                <div class="relative overflow-hidden rounded-lg aspect-square">
                    <img src="${template.url}" alt="${template.name}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200">
                    <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white font-medium text-sm text-center px-2">${template.name}</span>
                    </div>
                </div>
            `;
            
            templateElement.addEventListener('click', () => {
                imageUrlInput.value = template.url;
                loadImageFromUrl();
                
                // Add some funny default text based on template
                if (template.name === 'Distracted Boyfriend') {
                    topTextInput.value = 'Me ignoring my responsibilities';
                    bottomTextInput.value = 'Me looking at memes';
                } else if (template.name === 'Drake Hotline Bling') {
                    topTextInput.value = 'Doing work';
                    bottomTextInput.value = 'Making memes';
                }
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
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
            dataUrl: canvas.toDataURL('image/png')
        };
        
        // Add to beginning of array
        recentMemes.unshift(memeData);
        
        // Keep only last 6 memes
        if (recentMemes.length > 6) {
            recentMemes = recentMemes.slice(0, 6);
        }
        
        localStorage.setItem('recentMemes', JSON.stringify(recentMemes));
        loadRecentMemes();
    }
    
    function loadRecentMemes() {
        if (recentMemes.length === 0) {
            recentMemesContainer.innerHTML = '<p class="text-gray-500 col-span-full text-center py-4">No recent memes yet</p>';
            return;
        }
        
        recentMemesContainer.innerHTML = '';
        
        recentMemes.forEach((meme, index) => {
            const memeElement = document.createElement('div');
            memeElement.className = 'cursor-pointer group';
            memeElement.innerHTML = `
                <div class="relative overflow-hidden rounded-lg aspect-square">
                    <img src="${meme.dataUrl}" alt="Recent meme ${index + 1}" 
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200">
                    <div class="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-white font-medium text-sm text-center px-2">${meme.topText || ''} ${meme.bottomText || ''}</span>
                    </div>
                </div>
            `;
            
            memeElement.addEventListener('click', () => {
                imageUrlInput.value = meme.imageUrl;
                topTextInput.value = meme.topText;
                bottomTextInput.value = meme.bottomText;
                loadImageFromUrl();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            
            recentMemesContainer.appendChild(memeElement);
        });
    }
    
    // Responsive adjustments
    window.addEventListener('resize', function() {
        setupCanvas();
        if (currentImage) {
            drawMeme();
        }
    });
});