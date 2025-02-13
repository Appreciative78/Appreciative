document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Fully Loaded');

    const courseModalOverlay = document.getElementById('courseModalOverlay');
    const courseModalContainer = courseModalOverlay.querySelector('.course-modal-container');
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');

    console.log('Modal Overlay:', courseModalOverlay);
    console.log('Modal Container:', courseModalContainer);
    console.log('Modal Overlay Classes:', courseModalOverlay.classList);

    // Add debug styles to make modal visibility clear
    courseModalOverlay.style.border = '5px solid red';
    courseModalContainer.style.border = '5px solid green';

    function openCourseModal(courseCard) {
        console.log('Attempting to open modal for:', courseCard);
        
        // Comprehensive logging
        console.log('Modal Overlay Before:', {
            display: courseModalOverlay.style.display,
            classList: Array.from(courseModalOverlay.classList),
            visibility: window.getComputedStyle(courseModalOverlay).visibility
        });

        // Force show modal with multiple methods
        courseModalOverlay.style.display = 'flex';
        courseModalOverlay.style.opacity = '1';
        courseModalOverlay.style.visibility = 'visible';
        courseModalOverlay.classList.add('show', 'active');

        // Detailed modal content logging
        try {
            const courseName = courseCard.querySelector('.card-title').textContent.trim();
            const coursePrice = courseCard.querySelector('.price span').textContent;
            const courseImage = courseCard.querySelector('.img-cover').src;
            
            document.getElementById('courseModalImage').src = courseImage;
            document.getElementById('courseModalTitle').textContent = courseName;
            document.getElementById('courseModalPrice').textContent = coursePrice;
        } catch (error) {
            console.error('Error setting modal content:', error);
        }

        // Log modal state after opening
        console.log('Modal Overlay After:', {
            display: courseModalOverlay.style.display,
            classList: Array.from(courseModalOverlay.classList),
            visibility: window.getComputedStyle(courseModalOverlay).visibility
        });
    }

    // Attach event listeners with comprehensive logging
    buyNowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            console.log('Buy Now Button Clicked:', {
                button: button,
                event: event,
                courseCard: button.closest('.course-card')
            });

            const courseCard = button.closest('.course-card');
            if (courseCard) {
                openCourseModal(courseCard);
            } else {
                console.error('No course card found for this button');
            }
        });
    });

    // Fallback global click listener
    document.body.addEventListener('click', (event) => {
        const buyNowButton = event.target.closest('.buy-now-btn');
        if (buyNowButton) {
            const courseCard = buyNowButton.closest('.course-card');
            if (courseCard) {
                openCourseModal(courseCard);
            }
        }
    });

    // Close modal functionality
    const closeModalButton = document.getElementById('courseModalCloseButton');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            courseModalOverlay.style.display = 'none';
            courseModalOverlay.classList.remove('show', 'active');
        });
    }

    // Close modal when clicking outside
    courseModalOverlay.addEventListener('click', (event) => {
        if (event.target === courseModalOverlay) {
            courseModalOverlay.style.display = 'none';
            courseModalOverlay.classList.remove('show', 'active');
        }
    });
});
