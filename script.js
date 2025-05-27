// script.js

document.addEventListener('DOMContentLoaded', () => {
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

    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    let originalImage = null;
    let initialUploadedImageDataUrl = null; // Variable to store the initial data URL
    let currentUserTier; // Variable to store current membership tier

    // Function to load membership status from localStorage
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

        // Update the visual display for membership status
        const userTierTextEl = document.getElementById('userTierText');
        if (userTierTextEl) {
            userTierTextEl.textContent = currentUserTier;
        }
        updatePremiumButtonStyles(); // Call to update button styles
    }

    // Function to update membership status
    function updateMembershipStatus(newTier) {
        currentUserTier = newTier;
        localStorage.setItem('userMembershipTier', currentUserTier);
        console.log(`Membership status updated to: ${currentUserTier}`);
        
        // Update the visual display
        const userTierTextEl = document.getElementById('userTierText');
        if (userTierTextEl) {
            userTierTextEl.textContent = currentUserTier;
        }
        // Optional: dispatch an event to notify other parts of the UI
        // window.dispatchEvent(new CustomEvent('membershipChanged', { detail: { newTier: currentUserTier } }));
    }

    // Initialize the user's tier status on page load
    loadMembershipStatus();

    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                originalImage = new Image();
                originalImage.onload = () => { // Corrected an underscore to ()
                    // Display the original image (or a version of it) on the canvas
                    canvas.width = originalImage.width;
                    canvas.height = originalImage.height;
                    ctx.drawImage(originalImage, 0, 0);
                    console.log('Image loaded and drawn to canvas.');
                };
                originalImage.src = e.target.result;
                initialUploadedImageDataUrl = e.target.result; // Store the initial data URL
                console.log('Initial image data URL stored.'); 
            };
            reader.readAsDataURL(file);
        }
    });

    // Stub functions for image operations
    function applyGrayscale() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Applying grayscale filter...');
        // Ensure the original image is drawn to the canvas before applying the filter
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            // Calculate grayscale value (average method)
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i]     = avg; // red
            data[i + 1] = avg; // green
            data[i + 2] = avg; // blue
            // data[i + 3] is the alpha channel, leave it as is
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
        // Ensure the original image is drawn to the canvas first
        // This allows resetting to original before applying brightness or stacking with other non-pixel-manipulating transforms
        // However, for brightness, we usually want to apply it to the *current* canvas state if chaining,
        // or to the original image if it's a fresh adjustment.
        // For simplicity now, let's always apply to the original image.
        // A more advanced implementation would manage effect layering.
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const brightnessValue = parseInt(value); // Value from slider is -100 to 100

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] + brightnessValue));     // red
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessValue)); // green
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessValue)); // blue
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Brightness adjusted.');
    }

    // Example: Add a button for grayscale (can be moved to HTML later)
    const grayscaleButton = document.createElement('button');
    grayscaleButton.textContent = 'Apply Grayscale';
    grayscaleButton.addEventListener('click', applyGrayscale);
    
    const imageControlsArea = document.getElementById('image-controls-area');
    if (imageControlsArea) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-grid';

        controlsContainer.appendChild(grayscaleButton);

        // Create brightness slider
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
        brightnessSlider.addEventListener('input', (event) => { // 'input' for real-time feedback
            adjustBrightness(event.target.value);
        });
        controlsContainer.appendChild(brightnessSlider);

        // Create contrast slider
        const contrastLabel = document.createElement('label');
        contrastLabel.setAttribute('for', 'contrastSlider');
        contrastLabel.textContent = 'Contrast:';
        controlsContainer.appendChild(contrastLabel);

        const contrastSlider = document.createElement('input');
        contrastSlider.setAttribute('type', 'range');
        contrastSlider.setAttribute('id', 'contrastSlider');
        contrastSlider.setAttribute('min', '0');
        contrastSlider.setAttribute('max', '200');
        contrastSlider.setAttribute('value', '100'); // Default to normal contrast (factor 1.0)
        contrastSlider.addEventListener('input', (event) => {
            adjustContrast(event.target.value);
        });
        controlsContainer.appendChild(contrastSlider);

        // Create Sepia button
        const sepiaButton = document.createElement('button');
        sepiaButton.setAttribute('id', 'sepiaButton');
        sepiaButton.textContent = 'Apply Sepia';
        sepiaButton.addEventListener('click', applySepia);
        controlsContainer.appendChild(sepiaButton);

        // Create Invert button
        const invertButton = document.createElement('button');
        invertButton.setAttribute('id', 'invertButton');
        invertButton.textContent = 'Invert Colors';
        invertButton.addEventListener('click', applyInvert);
        controlsContainer.appendChild(invertButton);

        // Create Rotate button
        const rotateButton = document.createElement('button');
        rotateButton.setAttribute('id', 'rotateButton');
        rotateButton.textContent = 'Rotate 90° CW';
        rotateButton.addEventListener('click', rotateImage90CW);
        controlsContainer.appendChild(rotateButton);

        // Create Flip Horizontal button
        const flipHorizontalButton = document.createElement('button');
        flipHorizontalButton.setAttribute('id', 'flipHorizontalButton');
        flipHorizontalButton.textContent = 'Flip Horizontal';
        flipHorizontalButton.addEventListener('click', flipImageHorizontal);
        controlsContainer.appendChild(flipHorizontalButton);

        // Create Flip Vertical button
        const flipVerticalButton = document.createElement('button');
        flipVerticalButton.setAttribute('id', 'flipVerticalButton');
        flipVerticalButton.textContent = 'Flip Vertical';
        flipVerticalButton.addEventListener('click', flipImageVertical);
        controlsContainer.appendChild(flipVerticalButton);

        // Create Download button
        const downloadButton = document.createElement('button');
        downloadButton.setAttribute('id', 'downloadButton');
        downloadButton.textContent = 'Download Image';
        downloadButton.addEventListener('click', downloadImage);
        controlsContainer.appendChild(downloadButton);

        // Create a heading for the upscale section (optional, but good for grouping)
        const upscaleHeading = document.createElement('h4'); // Or h3, adjust as per design
        upscaleHeading.textContent = 'Image Upscaling';
        upscaleHeading.style.gridColumn = '1 / -1'; // Make heading span all columns in the grid
        upscaleHeading.style.textAlign = 'center';
        upscaleHeading.style.marginTop = '20px';
        controlsContainer.appendChild(upscaleHeading);

        const upscaleFactors = [
            { factor: 2, label: '2x', premium: false },
            { factor: 4, label: '4x', premium: false },
            { factor: 6, label: '6x (Pro)', premium: true, requiredTier: 'Pro' }, // Tentative
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
                // Optionally add a class for styling premium buttons differently
                upscaleButton.classList.add('premium-feature'); 
            }
            upscaleButton.addEventListener('click', (event) => {
                const buttonElement = event.currentTarget; // Use currentTarget for reliability
                const factor = parseInt(buttonElement.getAttribute('data-factor'));
                const isPremium = buttonElement.getAttribute('data-premium') === 'true';
                const requiredTier = buttonElement.getAttribute('data-tier');
                applyUpscale(factor, isPremium, requiredTier); 
            });
            controlsContainer.appendChild(upscaleButton);
        });

        // This code should be placed after the upscaleFactors.forEach loop
    
        const upscaleDescription = document.createElement('p');
        upscaleDescription.innerHTML = '<strong>AI-Powered Upscaling:</strong> Our advanced upscaling technology utilizes AI to intelligently enhance image details, allowing for significantly larger images while maintaining remarkable clarity and sharpness, especially with our Pro and Max tier options. Basic upscaling for lower magnifications uses standard interpolation methods.';
        upscaleDescription.style.gridColumn = '1 / -1'; // Make description span all columns
        upscaleDescription.style.textAlign = 'center';
        upscaleDescription.style.fontSize = '0.85em';
        upscaleDescription.style.color = '#555';
        upscaleDescription.style.marginTop = '10px'; // Space above the description
        upscaleDescription.style.marginBottom = '15px'; // Space below the description
        
        controlsContainer.appendChild(upscaleDescription);

        // Create a heading for the Downscale section
        const downscaleHeading = document.createElement('h4');
        downscaleHeading.textContent = 'Image Downscaling';
        downscaleHeading.style.gridColumn = '1 / -1'; // Make heading span all columns
        downscaleHeading.style.textAlign = 'center';
        downscaleHeading.style.marginTop = '20px';
        controlsContainer.appendChild(downscaleHeading);

        const downscaleFactors = [
            { factor: 2, label: '2x', premium: false },
            { factor: 4, label: '4x', premium: false },
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
                downscaleButton.classList.add('premium-feature'); // Default to locked style
            }
            downscaleButton.addEventListener('click', (event) => {
                const buttonElement = event.currentTarget;
                const factor = parseInt(buttonElement.getAttribute('data-factor'));
                const isPremium = buttonElement.getAttribute('data-premium') === 'true';
                const requiredTier = buttonElement.getAttribute('data-tier');
                
                // applyDownscale(factor, isPremium, requiredTier); // Placeholder for now
                // console.log(`Downscale ${factor}x clicked. Premium: ${isPremium}, Tier: ${requiredTier || 'Free'}`);
                // The actual applyDownscale function will be implemented in the next step
                applyDownscale(factor, isPremium, requiredTier); // Call the actual function
            });
            controlsContainer.appendChild(downscaleButton);
        });
        
        updatePremiumButtonStyles(); // Explicitly call to style newly added downscale buttons
        // Note: updatePremiumButtonStyles() will also be called by loadMembershipStatus()
        // and updateMembershipStatus(), which should cover these new buttons as well if tier changes later.

        imageControlsArea.appendChild(controlsContainer);
    } else {
        console.error('Image controls area not found.');
    }

    // You can add more stubs for other functions like:
    // applySepia, applyInvert, rotateImage, flipImage, cropImage etc.

    function applyDownscale(factor, isPremium, requiredTier) {
        if (!initialUploadedImageDataUrl) { // Check if an initial image was ever loaded
            alert('Please upload an image first.');
            return;
        }

        console.log(`Attempting to downscale by ${factor}x. Premium: ${isPremium}, Required Tier: ${requiredTier}`);

        // --- Tier Access Logic ---
        // Uses the global currentUserTier which is loaded from localStorage
        if (isPremium) {
            let canAccess = false;
            if (requiredTier === "Pro" && (currentUserTier === "Pro" || currentUserTier === "Max")) {
                canAccess = true;
            } else if (requiredTier === "Max" && currentUserTier === "Max") {
                canAccess = true;
            }

            if (!canAccess) {
                alert(`The ${factor}x downscale option requires a ${requiredTier} membership. Please upgrade your plan.`);
                return;
            }
        }
        
        // --- Actual Downscaling Logic ---
        console.log(`Proceeding with canvas downscale for ${factor}x.`);

        const tempImage = new Image();
        tempImage.onload = () => {
            // Calculate new dimensions based on the original uploaded image's dimensions
            const newWidth = Math.round(tempImage.width / factor);
            const newHeight = Math.round(tempImage.height / factor);

            if (newWidth < 1 || newHeight < 1) {
                alert('Downscaled image would be too small (less than 1 pixel). Operation cancelled.');
                return;
            }

            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Image smoothing is generally good for downscaling
            ctx.imageSmoothingEnabled = true; 
            ctx.imageSmoothingQuality = 'high'; // Prefer quality for downscaling
            ctx.drawImage(tempImage, 0, 0, newWidth, newHeight);
            
            console.log(`Image downscaled to ${newWidth}x${newHeight} on canvas.`);

            // Update originalImage to this new downscaled version
            // This makes the downscale persistent for subsequent non-scaling operations
            const dataURL = canvas.toDataURL();
            originalImage = new Image(); 
            originalImage.onload = () => {
                console.log('Downscaled image loaded into originalImage object for subsequent operations.');
            };
            originalImage.src = dataURL;
        };
        // Always use the initial uploaded image data as the source for downscaling
        tempImage.src = initialUploadedImageDataUrl; 
    }

    function applyUpscale(factor, isPremium, requiredTier) {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }

        console.log(`Attempting to upscale by ${factor}x. Premium: ${isPremium}, Required Tier: ${requiredTier}`);

        // --- Tier Access Logic (Placeholder) ---
        // In a real application, you'd check the actual user's subscription level.
        // For now, we use the global currentUserTier which is loaded from localStorage.
        // const currentUserTier = "Free"; // Simulate current user tier. This would come from backend/auth. // This line is now replaced by the global

        if (isPremium) {
            let canAccess = false;
            if (requiredTier === "Pro" && (currentUserTier === "Pro" || currentUserTier === "Max")) {
                canAccess = true;
            } else if (requiredTier === "Max" && currentUserTier === "Max") {
                canAccess = true;
            }

            if (!canAccess) {
                alert(`The ${factor}x upscale option requires a ${requiredTier} membership. Please upgrade your plan.`);
                return;
            }
        }
        
        // --- Actual Upscaling Logic ---
        // For "Free" tiers (2x, 4x based on current assumption) or if a premium user has access:
        // Use basic canvas upscaling. This is NOT AI-enhanced.
        // For premium tiers that are accessed, this basic method will also be used as a placeholder.
        // True AI upscaling would require backend processing.

        console.log(`Proceeding with basic canvas upscale for ${factor}x.`);

        const currentCanvas = document.getElementById('imageCanvas');
        const tempImage = new Image();
        tempImage.onload = () => {
            const newWidth = tempImage.width * factor;
            const newHeight = tempImage.height * factor;

            // Optional: Add a check for maximum canvas dimensions to prevent browser crashes
            // For example: if (newWidth > 8000 || newHeight > 8000) { alert('Upscaled image too large.'); return; }

            canvas.width = newWidth;
            canvas.height = newHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // The drawImage with more arguments can control smoothing.
            // Default browser behavior usually includes some form of interpolation (e.g., bicubic).
            // For sharper, pixelated upscale (less common for photos):
            // ctx.imageSmoothingEnabled = false; 
            // For smoother (default):
            ctx.imageSmoothingEnabled = true; 
            ctx.drawImage(tempImage, 0, 0, newWidth, newHeight);
            
            console.log(`Image upscaled to ${newWidth}x${newHeight} on canvas.`);

            // Update originalImage to this new upscaled version for consistency with other ops
            const dataURL = canvas.toDataURL();
            originalImage = new Image(); // Create a new Image object
            originalImage.onload = () => {
                console.log('Upscaled image loaded into originalImage object for subsequent operations.');
            };
            originalImage.src = dataURL;
        };
        // Use the current canvas content as the source for upscaling,
        // as other filters/transformations might have been applied.
        // tempImage.src = currentCanvas.toDataURL(); // OLD LINE
        tempImage.src = initialUploadedImageDataUrl; // USE THE STORED INITIAL IMAGE DATA
    }

    function applyInvert() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Applying Invert filter...');
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i]     = 255 - data[i];     // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
            // Alpha channel (data[i + 3]) remains unchanged
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Invert filter applied.');
    }

    function applySepia() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Applying Sepia filter...');
        // Redraw the original image to ensure we're applying to a fresh state.
        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i]     = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189); // red
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168); // green
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131); // blue
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Sepia filter applied.');
    }

    function adjustContrast(value) {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        const contrastLevel = parseInt(value); // value from 0 to 200
        const factor = contrastLevel / 100.0; // factor from 0.0 to 2.0
        console.log(`Adjusting contrast with factor ${factor}...`);

        canvas.width = originalImage.width;
        canvas.height = originalImage.height;
        ctx.drawImage(originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i]     = Math.max(0, Math.min(255, (data[i] - 128) * factor + 128));
            data[i + 1] = Math.max(0, Math.min(255, (data[i + 1] - 128) * factor + 128));
            data[i + 2] = Math.max(0, Math.min(255, (data[i + 2] - 128) * factor + 128));
        }
        ctx.putImageData(imageData, 0, 0);
        console.log('Contrast adjusted.');
    }

    function rotateImage90CW() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Rotating image 90° CW...');
        
        const imgToRotate = new Image();
        imgToRotate.onload = () => {
            const newCanvasWidth = imgToRotate.height;
            const newCanvasHeight = imgToRotate.width;

            canvas.width = newCanvasWidth;
            canvas.height = newCanvasHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear existing content
            ctx.save(); // Save current state
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(imgToRotate, -imgToRotate.width / 2, -imgToRotate.height / 2);
            ctx.restore(); // Restore to prevent further rotations on context

            const dataURL = canvas.toDataURL();
            originalImage = new Image(); 
            originalImage.onload = () => {
                console.log('Rotated image loaded into originalImage object.');
            };
            originalImage.src = dataURL;
        };
        imgToRotate.src = originalImage.src; 

        console.log('Rotate 90° CW function called.');
    }

    function flipImageHorizontal() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Flipping image horizontally...');

        const imgToFlip = new Image();
        imgToFlip.onload = () => {
            canvas.width = imgToFlip.width;
            canvas.height = imgToFlip.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            // Translate to the right edge of the image (canvas.width)
            ctx.translate(canvas.width, 0);
            // Scale horizontally by -1 to flip
            ctx.scale(-1, 1);
            // Draw the image at (0,0) in the new, flipped coordinate system
            ctx.drawImage(imgToFlip, 0, 0);
            ctx.restore();

            // Update originalImage to this new flipped version
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => {
                console.log('Horizontally flipped image loaded into originalImage object.');
            };
            originalImage.src = dataURL;
        };
        imgToFlip.src = originalImage.src; // Use current originalImage state
    }

    function flipImageVertical() {
        if (!originalImage) {
            alert('Please upload an image first.');
            return;
        }
        console.log('Flipping image vertically...');

        const imgToFlip = new Image();
        imgToFlip.onload = () => {
            canvas.width = imgToFlip.width;
            canvas.height = imgToFlip.height;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            // Translate to the bottom edge of the image (canvas.height)
            ctx.translate(0, canvas.height);
            // Scale vertically by -1 to flip
            ctx.scale(1, -1);
            // Draw the image at (0,0) in the new, flipped coordinate system
            ctx.drawImage(imgToFlip, 0, 0);
            ctx.restore();

            // Update originalImage to this new flipped version
            const dataURL = canvas.toDataURL();
            originalImage = new Image();
            originalImage.onload = () => {
                console.log('Vertically flipped image loaded into originalImage object.');
            };
            originalImage.src = dataURL;
        };
        imgToFlip.src = originalImage.src; // Use current originalImage state
    }

    function downloadImage() {
        if (!originalImage) {
            alert('Please upload an image first. There is nothing to download.');
            return;
        }
        console.log('Preparing image for download...');

        // Get the canvas element
        const canvasToDownload = document.getElementById('imageCanvas');
        if (!canvasToDownload) {
            console.error('Canvas element not found for download!');
            alert('Error: Canvas not found.');
            return;
        }

        // Create a temporary link element
        const link = document.createElement('a');
        
        // Set filename (user can change it in the download dialog)
        link.download = 'processed-image.png'; 
        
        // Convert canvas content to data URL (PNG format by default)
        // For JPG, use 'image/jpeg'. For quality, use a second param: canvas.toDataURL('image/jpeg', 0.9);
        link.href = canvasToDownload.toDataURL('image/png'); 
        
        // Append link to the body, click it, then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Download initiated.');
    }
});
