// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Initial variable declarations
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    let originalImage = null;
    let initialUploadedImageDataUrl = null;
    let currentUserTier;

    // --- FUNCTION DEFINITIONS START ---

    function updatePremiumButtonStyles() {
        const premiumButtons = document.querySelectorAll('[data-premium="true"]');
        premiumButtons.forEach(button => {
            const requiredTier = button.getAttribute('data-tier');
            let canAccess = false;

            if (requiredTier === "Pro" && (currentUserTier === "Pro" || currentUserTier === "Max")) {
                canAccess = true;
            } else if (requiredTier === "Max" && currentUserTier === "Max") {
                canAccess = true;
            }

            if (canAccess) {
                button.classList.remove('premium-feature');
                button.classList.add('premium-unlocked');
                button.disabled = false; 
            } else {
                button.classList.add('premium-feature');
                button.classList.remove('premium-unlocked');
                // button.disabled = true; // Keeping buttons enabled but visually distinct
            }
        });
    }

    function loadMembershipStatus() {
        const storedTier = localStorage.getItem('userMembershipTier');
        if (!storedTier) {
            currentUserTier = "Free";
            localStorage.setItem('userMembershipTier', currentUserTier);
            console.log('No membership status found in localStorage. Defaulting to Free.');
        } else {
            currentUserTier = storedTier;
            console.log(`Membership status loaded from localStorage: ${currentUserTier}`);
        }

        const userTierTextEl = document.getElementById('userTierText');
        if (userTierTextEl) {
            userTierTextEl.textContent = currentUserTier;
        }
        updatePremiumButtonStyles(); // Now this call is safe
    }

    function updateMembershipStatus(newTier) {
        currentUserTier = newTier;
        localStorage.setItem('userMembershipTier', currentUserTier);
        console.log(`Membership status updated to: ${currentUserTier}`);
        
        const userTierTextEl = document.getElementById('userTierText');
        if (userTierTextEl) {
            userTierTextEl.textContent = currentUserTier;
        }
        updatePremiumButtonStyles(); // Ensure this is called to reflect changes
        // window.dispatchEvent(new CustomEvent('membershipChanged', { detail: { newTier: currentUserTier } }));
    }
    
    // Image Operation Function Definitions
    function applyGrayscale() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Applying grayscale filter...');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg; data[i + 1] = avg; data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Grayscale filter applied.');
    }

    function adjustBrightness(value) {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log(`Adjusting brightness by ${value}...`);
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const brightnessValue = parseInt(value);
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] + brightnessValue));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessValue));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessValue));
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Brightness adjusted.');
    }

    function applyDownscale(factor, isPremium, requiredTier) {
        if (!initialUploadedImageDataUrl) {
            alert('Please upload an image first.');
            return;
        }
        console.log(`Attempting to downscale by ${factor}x. Premium: ${isPremium}, Required Tier: ${requiredTier}`);
        if (isPremium) {
            let canAccess = false;
            if (requiredTier === "Pro" && (currentUserTier === "Pro" || currentUserTier === "Max")) canAccess = true;
            else if (requiredTier === "Max" && currentUserTier === "Max") canAccess = true;
            if (!canAccess) {
                alert(`The ${factor}x downscale option requires a ${requiredTier} membership. Please upgrade your plan.`);
                return;
            }
        }
        console.log(`Proceeding with canvas downscale for ${factor}x.`);
        const tempImage = new Image();
        tempImage.onload = () => {
            const newWidth = Math.round(tempImage.width / factor);
            const newHeight = Math.round(tempImage.height / factor);
            if (newWidth < 1 || newHeight < 1) {
                alert('Downscaled image would be too small (less than 1 pixel). Operation cancelled.');
                return;
            }
            canvas.width = newWidth; canvas.height = newHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(tempImage, 0, 0, newWidth, newHeight);
            console.log(`Image downscaled to ${newWidth}x${newHeight} on canvas.`);
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => console.log('Downscaled image loaded into originalImage object.');
            originalImage.src = dataURL;
        };
        tempImage.src = initialUploadedImageDataUrl;
    }

    function applyUpscale(factor, isPremium, requiredTier) {
        if (!originalImage) { // Check originalImage here, but use initialUploadedImageDataUrl for source dimensions
            alert('Please upload an image first.');
            return;
        }
        console.log(`Attempting to upscale by ${factor}x. Premium: ${isPremium}, Required Tier: ${requiredTier}`);
        if (isPremium) {
            let canAccess = false;
            if (requiredTier === "Pro" && (currentUserTier === "Pro" || currentUserTier === "Max")) canAccess = true;
            else if (requiredTier === "Max" && currentUserTier === "Max") canAccess = true;
            if (!canAccess) {
                alert(`The ${factor}x upscale option requires a ${requiredTier} membership. Please upgrade your plan.`);
                return;
            }
        }
        console.log(`Proceeding with basic canvas upscale for ${factor}x.`);
        const tempImage = new Image();
        tempImage.onload = () => {
            const newWidth = tempImage.width * factor;
            const newHeight = tempImage.height * factor;
            canvas.width = newWidth; canvas.height = newHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.imageSmoothingEnabled = true;
            ctx.drawImage(tempImage, 0, 0, newWidth, newHeight);
            console.log(`Image upscaled to ${newWidth}x${newHeight} on canvas.`);
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => console.log('Upscaled image loaded into originalImage object.');
            originalImage.src = dataURL;
        };
        tempImage.src = initialUploadedImageDataUrl;
    }

    function applyInvert() {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log('Applying Invert filter...');
        canvas.width = originalImage.width; canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i]; data[i + 1] = 255 - data[i + 1]; data[i + 2] = 255 - data[i + 2];
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Invert filter applied.');
    }

    function applySepia() {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log('Applying Sepia filter...');
        canvas.width = originalImage.width; canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Sepia filter applied.');
    }

    function adjustContrast(value) {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log(`Adjusting contrast by ${value}...`);
        canvas.width = originalImage.width; canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const factor = parseInt(value) / 100.0; // Assuming value is 0-200, factor 0.0-2.0
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, (data[i] - 128) * factor + 128));
            data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * factor + 128));
            data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * factor + 128));
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Contrast adjusted.');
    }

    function rotateImage90CW() {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log('Rotating image 90° CW...');
        const imgToRotate = new Image();
        imgToRotate.onload = () => {
            canvas.width = imgToRotate.height; canvas.height = imgToRotate.width;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(imgToRotate, -imgToRotate.width / 2, -imgToRotate.height / 2);
            ctx.restore();
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => console.log('Rotated image loaded into originalImage object.');
            originalImage.src = dataURL;
        };
        imgToRotate.src = originalImage.src;
    }

    function flipImageHorizontal() {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log('Flipping image horizontally...');
        const imgToFlip = new Image();
        imgToFlip.onload = () => {
            canvas.width = imgToFlip.width; canvas.height = imgToFlip.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
            ctx.drawImage(imgToFlip, 0, 0);
            ctx.restore();
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => console.log('Horizontally flipped image loaded into originalImage object.');
            originalImage.src = dataURL;
        };
        imgToFlip.src = originalImage.src;
    }

    function flipImageVertical() {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log('Flipping image vertically...');
        const imgToFlip = new Image();
        imgToFlip.onload = () => {
            canvas.width = imgToFlip.width; canvas.height = imgToFlip.height;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(0, canvas.height); ctx.scale(1, -1);
            ctx.drawImage(imgToFlip, 0, 0);
            ctx.restore();
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => console.log('Vertically flipped image loaded into originalImage object.');
            originalImage.src = dataURL;
        };
        imgToFlip.src = originalImage.src;
    }

    function downloadImage() {
        if (!originalImage) { alert('Please upload an image first.'); return; }
        console.log('Preparing image for download...');
        const canvasToDownload = document.getElementById('imageCanvas');
        if (!canvasToDownload) { console.error('Canvas element not found!'); alert('Error: Canvas not found.'); return; }
        const link = document.createElement('a');
        link.download = 'processed-image.png';
        link.href = canvasToDownload.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('Download initiated.');
    }

    // --- FUNCTION DEFINITIONS END ---


    // --- MAIN SCRIPT LOGIC START ---
    loadMembershipStatus(); // Initialize the user's tier status

    // Image Upload Input handling
    const imageUploadInput = document.createElement('input');
    imageUploadInput.setAttribute('type', 'file');
    imageUploadInput.setAttribute('accept', 'image/*');
    imageUploadInput.setAttribute('id', 'imageUpload');
    
    const imageUploadArea = document.getElementById('image-upload-area');
    if (imageUploadArea) {
        imageUploadArea.appendChild(imageUploadInput);
    } else {
        console.error('Image upload area not found.');
    }

    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => {
                    canvas.width = originalImage.width;
                    canvas.height = originalImage.height;
                    ctx.drawImage(originalImage, 0, 0);
                    console.log('Image loaded and drawn to canvas.');
                };
                originalImage.src = e.target.result;
                initialUploadedImageDataUrl = e.target.result;
                console.log('Initial image data URL stored.'); 
            };
            reader.readAsDataURL(file);
        }
    });

    // Get image controls area and create controls
    const imageControlsArea = document.getElementById('image-controls-area');
    if (imageControlsArea) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-grid';

        // Grayscale Button
        const grayscaleButton = document.createElement('button');
        grayscaleButton.textContent = 'Apply Grayscale';
        grayscaleButton.addEventListener('click', applyGrayscale);
        controlsContainer.appendChild(grayscaleButton);

        // Brightness Slider
        const brightnessLabel = document.createElement('label');
        brightnessLabel.setAttribute('for', 'brightnessSlider');
        brightnessLabel.textContent = 'Brightness:';
        controlsContainer.appendChild(brightnessLabel);
        const brightnessSlider = document.createElement('input');
        brightnessSlider.setAttribute('type', 'range');
        brightnessSlider.setAttribute('id', 'brightnessSlider');
        brightnessSlider.setAttribute('min', '-100');
        brightnessSlider.setAttribute('max', '100');
        brightnessSlider.setAttribute('value', '0');
        brightnessSlider.addEventListener('input', (event) => adjustBrightness(event.target.value));
        controlsContainer.appendChild(brightnessSlider);

        // Contrast Slider
        const contrastLabel = document.createElement('label');
        contrastLabel.setAttribute('for', 'contrastSlider');
        contrastLabel.textContent = 'Contrast:';
        controlsContainer.appendChild(contrastLabel);
        const contrastSlider = document.createElement('input');
        contrastSlider.setAttribute('type', 'range');
        contrastSlider.setAttribute('id', 'contrastSlider');
        contrastSlider.setAttribute('min', '0'); // Was 0-200, value 100
        contrastSlider.setAttribute('max', '200');
        contrastSlider.setAttribute('value', '100');
        contrastSlider.addEventListener('input', (event) => adjustContrast(event.target.value));
        controlsContainer.appendChild(contrastSlider);

        // Sepia Button
        const sepiaButton = document.createElement('button');
        sepiaButton.textContent = 'Apply Sepia';
        sepiaButton.addEventListener('click', applySepia);
        controlsContainer.appendChild(sepiaButton);

        // Invert Button
        const invertButton = document.createElement('button');
        invertButton.textContent = 'Invert Colors';
        invertButton.addEventListener('click', applyInvert);
        controlsContainer.appendChild(invertButton);

        // Rotate Button
        const rotateButton = document.createElement('button');
        rotateButton.textContent = 'Rotate 90° CW';
        rotateButton.addEventListener('click', rotateImage90CW);
        controlsContainer.appendChild(rotateButton);

        // Flip Horizontal Button
        const flipHorizontalButton = document.createElement('button');
        flipHorizontalButton.textContent = 'Flip Horizontal';
        flipHorizontalButton.addEventListener('click', flipImageHorizontal);
        controlsContainer.appendChild(flipHorizontalButton);

        // Flip Vertical Button
        const flipVerticalButton = document.createElement('button');
        flipVerticalButton.textContent = 'Flip Vertical';
        flipVerticalButton.addEventListener('click', flipImageVertical);
        controlsContainer.appendChild(flipVerticalButton);

        // Download Button
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download Image';
        downloadButton.addEventListener('click', downloadImage);
        controlsContainer.appendChild(downloadButton);

        // Upscale Section
        const upscaleHeading = document.createElement('h4');
        upscaleHeading.textContent = 'Image Upscaling';
        upscaleHeading.style.gridColumn = '1 / -1';
        upscaleHeading.style.textAlign = 'center';
        upscaleHeading.style.marginTop = '20px';
        controlsContainer.appendChild(upscaleHeading);
        const upscaleFactors = [
            { factor: 2, label: '2x', premium: false }, { factor: 4, label: '4x', premium: false },
            { factor: 6, label: '6x (Pro)', premium: true, requiredTier: 'Pro' },
            { factor: 8, label: '8x (Pro)', premium: true, requiredTier: 'Pro' },
            { factor: 16, label: '16x (Max)', premium: true, requiredTier: 'Max' }
        ];
        upscaleFactors.forEach(item => {
            const upscaleButton = document.createElement('button');
            upscaleButton.textContent = item.label;
            upscaleButton.setAttribute('data-factor', item.factor);
            if (item.premium) {
                upscaleButton.setAttribute('data-premium', 'true');
                upscaleButton.setAttribute('data-tier', item.requiredTier);
                upscaleButton.classList.add('premium-feature'); 
            }
            upscaleButton.addEventListener('click', (event) => {
                const factor = parseInt(event.currentTarget.getAttribute('data-factor'));
                const isPremium = event.currentTarget.getAttribute('data-premium') === 'true';
                const requiredTier = event.currentTarget.getAttribute('data-tier');
                applyUpscale(factor, isPremium, requiredTier); 
            });
            controlsContainer.appendChild(upscaleButton);
        });
        const upscaleDescription = document.createElement('p');
        upscaleDescription.innerHTML = '<strong>AI-Powered Upscaling:</strong> Our advanced upscaling technology utilizes AI to intelligently enhance image details, allowing for significantly larger images while maintaining remarkable clarity and sharpness, especially with our Pro and Max tier options. Basic upscaling for lower magnifications uses standard interpolation methods.';
        upscaleDescription.style.gridColumn = '1 / -1';
        upscaleDescription.style.textAlign = 'center';
        upscaleDescription.style.fontSize = '0.85em';
        upscaleDescription.style.color = '#555';
        upscaleDescription.style.marginTop = '10px';
        upscaleDescription.style.marginBottom = '15px';
        controlsContainer.appendChild(upscaleDescription);

        // Downscale Section
        const downscaleHeading = document.createElement('h4');
        downscaleHeading.textContent = 'Image Downscaling';
        downscaleHeading.style.gridColumn = '1 / -1';
        downscaleHeading.style.textAlign = 'center';
        downscaleHeading.style.marginTop = '20px';
        controlsContainer.appendChild(downscaleHeading);
        const downscaleFactors = [
            { factor: 2, label: '2x', premium: false }, { factor: 4, label: '4x', premium: false },
            { factor: 6, label: '6x (Pro)', premium: true, requiredTier: 'Pro' },
            { factor: 8, label: '8x (Pro)', premium: true, requiredTier: 'Pro' },
            { factor: 16, label: '16x (Max)', premium: true, requiredTier: 'Max' }
        ];
        downscaleFactors.forEach(item => {
            const downscaleButton = document.createElement('button');
            downscaleButton.textContent = item.label;
            downscaleButton.setAttribute('data-factor', item.factor);
            if (item.premium) {
                downscaleButton.setAttribute('data-premium', 'true');
                downscaleButton.setAttribute('data-tier', item.requiredTier);
                downscaleButton.classList.add('premium-feature');
            }
            downscaleButton.addEventListener('click', (event) => {
                const factor = parseInt(event.currentTarget.getAttribute('data-factor'));
                const isPremium = event.currentTarget.getAttribute('data-premium') === 'true';
                const requiredTier = event.currentTarget.getAttribute('data-tier');
                applyDownscale(factor, isPremium, requiredTier);
            });
            controlsContainer.appendChild(downscaleButton);
        });
        
        updatePremiumButtonStyles(); // Style all premium buttons after they are added

        imageControlsArea.appendChild(controlsContainer);
    } else {
        console.error('Image controls area not found.');
    }
});
