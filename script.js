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
        imageControlsArea.appendChild(grayscaleButton);

        // Create brightness slider
        const brightnessLabel = document.createElement('label');
        brightnessLabel.setAttribute('for', 'brightnessSlider');
        brightnessLabel.textContent = 'Brightness:';
        imageControlsArea.appendChild(brightnessLabel);

        const brightnessSlider = document.createElement('input');
        brightnessSlider.setAttribute('type', 'range');
        brightnessSlider.setAttribute('id', 'brightnessSlider');
        brightnessSlider.setAttribute('min', '-100');
        brightnessSlider.setAttribute('max', '100');
        brightnessSlider.setAttribute('value', '0');
        brightnessSlider.addEventListener('input', (event) => { // 'input' for real-time feedback
            adjustBrightness(event.target.value);
        });
        imageControlsArea.appendChild(brightnessSlider);

        // Create contrast slider
        const contrastLabel = document.createElement('label');
        contrastLabel.setAttribute('for', 'contrastSlider');
        contrastLabel.textContent = 'Contrast:';
        imageControlsArea.appendChild(contrastLabel);

        const contrastSlider = document.createElement('input');
        contrastSlider.setAttribute('type', 'range');
        contrastSlider.setAttribute('id', 'contrastSlider');
        contrastSlider.setAttribute('min', '0');
        contrastSlider.setAttribute('max', '200');
        contrastSlider.setAttribute('value', '100'); // Default to normal contrast (factor 1.0)
        contrastSlider.addEventListener('input', (event) => {
            adjustContrast(event.target.value);
        });
        imageControlsArea.appendChild(contrastSlider);

        // Create Sepia button
        const sepiaButton = document.createElement('button');
        sepiaButton.setAttribute('id', 'sepiaButton');
        sepiaButton.textContent = 'Apply Sepia';
        sepiaButton.addEventListener('click', applySepia);
        imageControlsArea.appendChild(sepiaButton);

        // Create Invert button
        const invertButton = document.createElement('button');
        invertButton.setAttribute('id', 'invertButton');
        invertButton.textContent = 'Invert Colors';
        invertButton.addEventListener('click', applyInvert);
        imageControlsArea.appendChild(invertButton);

        // Create Rotate button
        const rotateButton = document.createElement('button');
        rotateButton.setAttribute('id', 'rotateButton');
        rotateButton.textContent = 'Rotate 90° CW';
        rotateButton.addEventListener('click', rotateImage90CW);
        imageControlsArea.appendChild(rotateButton);

        // Create Flip Horizontal button
        const flipHorizontalButton = document.createElement('button');
        flipHorizontalButton.setAttribute('id', 'flipHorizontalButton');
        flipHorizontalButton.textContent = 'Flip Horizontal';
        flipHorizontalButton.addEventListener('click', flipImageHorizontal);
        imageControlsArea.appendChild(flipHorizontalButton);

        // Create Flip Vertical button
        const flipVerticalButton = document.createElement('button');
        flipVerticalButton.setAttribute('id', 'flipVerticalButton');
        flipVerticalButton.textContent = 'Flip Vertical';
        flipVerticalButton.addEventListener('click', flipImageVertical);
        imageControlsArea.appendChild(flipVerticalButton);

    } else {
        console.error('Image controls area not found.');
    }

    // You can add more stubs for other functions like:
    // applySepia, applyInvert, rotateImage, flipImage, cropImage etc.

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
});
