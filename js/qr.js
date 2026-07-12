 
// QR Code generation for MaintainIQ

const QR = {
    // Generate QR code
    generate(element, text, options = {}) {
        try {
            if (typeof QRCode === 'undefined') {
                console.error('QRCode library not loaded');
                return null;
            }
            
            // Clear previous QR code
            element.innerHTML = '';
            
            const qrOptions = {
                width: options.width || 150,
                height: options.height || 150,
                colorDark: options.colorDark || '#1e293b',
                colorLight: options.colorLight || '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            };
            
            const qr = new QRCode(element, {
                text: text,
                width: qrOptions.width,
                height: qrOptions.height,
                colorDark: qrOptions.colorDark,
                colorLight: qrOptions.colorLight,
                correctLevel: qrOptions.correctLevel
            });
            
            return qr;
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    },
    
    // Generate QR for asset
    generateAssetQR(element, asset) {
        const url = `${window.location.origin}/public-asset.html?id=${asset.id}`;
        return this.generate(element, url, {
            width: 150,
            height: 150,
            colorDark: '#1e293b',
            colorLight: '#ffffff'
        });
    },
    
    // Get asset public URL
    getAssetUrl(asset) {
        return `${window.location.origin}/public-asset.html?id=${asset.id}`;
    },
    
    // Download QR code as image
    downloadQR(element, filename = 'qrcode.png') {
        try {
            const canvas = element.querySelector('canvas');
            if (!canvas) {
                throw new Error('No canvas found in element');
            }
            
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            Utils.showToast('Failed to download QR code', 'error');
        }
    },
    
    // Bulk generate QR labels
    generateBulkQR(assets) {
        const container = document.createElement('div');
        container.className = 'bulk-qr-container';
        container.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; padding: 20px;';
        
        assets.forEach(asset => {
            const item = document.createElement('div');
            item.className = 'qr-item';
            item.style.cssText = 'text-align: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; background: white;';
            
            const qrDiv = document.createElement('div');
            qrDiv.id = `qr-${asset.id}`;
            qrDiv.style.cssText = 'display: flex; justify-content: center;';
            
            const label = document.createElement('p');
            label.textContent = `${asset.name} (${asset.code})`;
            label.style.cssText = 'margin-top: 10px; font-weight: 500; font-size: 0.9rem;';
            
            item.appendChild(qrDiv);
            item.appendChild(label);
            container.appendChild(item);
            
            // Generate QR
            setTimeout(() => {
                this.generateAssetQR(document.getElementById(qrDiv.id), asset);
            }, 100);
        });
        
        return container;
    }
};

// Export for browser
window.QR = QR;