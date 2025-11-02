// Gallery modal functionality - Facebook style
document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.item');
    const contentContainer = document.querySelector('.content-container');
    const closeBtn = document.querySelector('.close-btn');
    
    // Get wrapper to append gallery inside it
    const wrapper = document.querySelector('.wrapper');
    if (!wrapper) {
        console.error('Wrapper not found!');
        return;
    }
    
    // Create gallery modal structure
    const galleryModal = document.createElement('div');
    galleryModal.className = 'gallery-modal';
    galleryModal.innerHTML = `
        <div class="gallery-overlay"></div>
        <div class="gallery-content">
            <button class="gallery-close">&times;</button>
            <div class="gallery-layout">
                <div class="gallery-images">
                    <div class="gallery-image-sidebar">
                        <!-- Sidebar images will be populated by JS -->
                    </div>
                    <div class="gallery-main-image">
                        <img id="galleryMainImg" src="" alt="">
                    </div>
                </div>
                <div class="gallery-context">
                    <div id="galleryContext" class="gallery-context-content">
                        <!-- Context will be populated by JS -->
                    </div>
                </div>
            </div>
        </div>
    `;
    // Append to wrapper, not body
    wrapper.appendChild(galleryModal);
    
    // Get all image URLs and content
    const imageData = Array.from(items).map((item, index) => {
        const bgImage = window.getComputedStyle(item).backgroundImage;
        const urlMatch = bgImage.match(/url\(["']?([^"']+)["']?\)/);
        const imageUrl = urlMatch ? urlMatch[1] : '';
        const contentId = item.getAttribute('data-content-id');
        const content = document.getElementById(contentId);
        
        return {
            imageUrl: imageUrl,
            content: content ? content.innerHTML : '',
            index: index
        };
    });
    
    // Populate sidebar images
    const sidebarContainer = galleryModal.querySelector('.gallery-image-sidebar');
    imageData.forEach((data, index) => {
        const sidebarImg = document.createElement('div');
        sidebarImg.className = 'gallery-sidebar-image';
        sidebarImg.style.backgroundImage = `url(${data.imageUrl})`;
        sidebarImg.dataset.index = index;
        sidebarImg.addEventListener('click', () => {
            openGallery(index);
        });
        sidebarContainer.appendChild(sidebarImg);
    });
    
    let currentIndex = 0;
    
    function openGallery(index) {
        currentIndex = index;
        const data = imageData[index];
        const clickedItem = items[index];
        
        // Get clicked item's position and size
        const itemRect = clickedItem.getBoundingClientRect();
        const itemCenterX = itemRect.left + itemRect.width / 2;
        const itemCenterY = itemRect.top + itemRect.height / 2;
        
        // Get viewport center (final position)
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        
        // Calculate transform values
        const translateX = viewportCenterX - itemCenterX;
        const translateY = viewportCenterY - itemCenterY;
        
        // Get scale values
        const itemWidth = itemRect.width;
        const itemHeight = itemRect.height;
        const galleryLayout = galleryModal.querySelector('.gallery-layout');
        const finalWidth = galleryLayout.offsetWidth || 1400;
        const finalHeight = galleryLayout.offsetHeight || 900;
        const scaleX = itemWidth / finalWidth;
        const scaleY = itemHeight / finalHeight;
        const initialScale = Math.max(scaleX, scaleY) * 0.8; // Slightly smaller for smooth transition
        
        // Set main image
        const mainImg = galleryModal.querySelector('#galleryMainImg');
        mainImg.src = '';
        
        // Load image first
        const img = new Image();
        img.onload = function() {
            mainImg.src = data.imageUrl;
            mainImg.style.display = 'block';
            mainImg.style.margin = 'auto';
        };
        img.onerror = function() {
            mainImg.src = data.imageUrl;
        };
        img.src = data.imageUrl;
        
        // Set context
        const contextDiv = galleryModal.querySelector('#galleryContext');
        contextDiv.innerHTML = data.content;
        contextDiv.scrollTop = 0;
        
        // Update active sidebar image
        const sidebarImages = galleryModal.querySelectorAll('.gallery-sidebar-image');
        sidebarImages.forEach((img, i) => {
            img.classList.toggle('active', i === index);
        });
        
        // Set initial transform state (start from clicked item position)
        const galleryLayoutEl = galleryModal.querySelector('.gallery-layout');
        const overlay = galleryModal.querySelector('.gallery-overlay');
        
        // Show modal IMMEDIATELY first
        galleryModal.classList.add('active');
        galleryModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset any previous transforms
        galleryLayoutEl.style.transition = 'none';
        overlay.style.transition = 'none';
        
        // Initial state - positioned at clicked item (relative to viewport center)
        galleryLayoutEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${initialScale})`;
        galleryLayoutEl.style.opacity = '0';
        overlay.style.opacity = '0';
        
        // Force reflow to ensure initial state is applied
        void galleryLayoutEl.offsetHeight;
        
        // Animate to final position - use setTimeout to ensure initial state is rendered
        setTimeout(() => {
            galleryLayoutEl.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
            galleryLayoutEl.style.transform = 'translate(0, 0) scale(1)';
            galleryLayoutEl.style.opacity = '1';
            overlay.style.transition = 'opacity 0.4s ease';
            overlay.style.opacity = '1';
        }, 10);
        
        // Scroll active image into view after animation
        setTimeout(() => {
            if (sidebarImages[index]) {
                sidebarImages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    }
    
    function closeGallery() {
        const galleryLayout = galleryModal.querySelector('.gallery-layout');
        const overlay = galleryModal.querySelector('.gallery-overlay');
        const clickedItem = items[currentIndex];
        
        // Get clicked item's position for reverse animation
        const itemRect = clickedItem.getBoundingClientRect();
        const itemCenterX = itemRect.left + itemRect.width / 2;
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const translateX = itemCenterX - viewportCenterX;
        const translateY = itemCenterY - viewportCenterY;
        
        const finalWidth = galleryLayout.offsetWidth || 1400;
        const finalHeight = galleryLayout.offsetHeight || 900;
        const scaleX = itemRect.width / finalWidth;
        const scaleY = itemRect.height / finalHeight;
        const finalScale = Math.max(scaleX, scaleY) * 0.8;
        
        // Animate back to item position
        galleryLayout.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
        galleryLayout.style.transform = `translate(${translateX}px, ${translateY}px) scale(${finalScale})`;
        galleryLayout.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';
        overlay.style.opacity = '0';
        
        // Remove modal after animation
        setTimeout(() => {
            galleryModal.classList.remove('active');
            galleryModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Reset transforms for next open
            galleryLayout.style.transform = '';
            galleryLayout.style.transition = '';
            galleryLayout.style.opacity = '';
            overlay.style.transition = '';
            overlay.style.opacity = '';
        }, 400);
    }
    
    // Event listeners
    items.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openGallery(index);
        });
    });
    
    // Close button
    const galleryCloseBtn = galleryModal.querySelector('.gallery-close');
    galleryCloseBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        closeGallery();
    });
    
    // Close on overlay click (background đen)
    const overlay = galleryModal.querySelector('.gallery-overlay');
    overlay.addEventListener('click', function(e) {
        e.stopPropagation();
        closeGallery();
    });
    
    // Prevent closing when clicking inside gallery content
    const galleryLayout = galleryModal.querySelector('.gallery-layout');
    if (galleryLayout) {
        galleryLayout.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!galleryModal.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeGallery();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            openGallery(currentIndex - 1);
        } else if (e.key === 'ArrowRight' && currentIndex < imageData.length - 1) {
            openGallery(currentIndex + 1);
        }
    });
    
    // Hide original content container by default and when gallery is open
    if (contentContainer) {
        contentContainer.style.display = 'none';
    }
    
    // Update when gallery opens/closes
    const observer = new MutationObserver(function(mutations) {
        if (galleryModal.classList.contains('active')) {
            if (contentContainer) {
                contentContainer.style.display = 'none';
            }
        }
    });
    
    observer.observe(galleryModal, { attributes: true, attributeFilter: ['class'] });
});

