// Razorpay Payment Integration
function initiateRazorpayPayment(amount) {
    console.log(`Attempting to create order for ₹${amount}`);
    
    fetch('/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => {
        console.log('Order creation response:', response);
        if (!response.ok) {
            throw new Error(`Order creation failed: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Order created successfully:', data);
        const options = {
            key: 'rzp_test_tkNtqrcihTQnwN', // Actual Razorpay Key ID from .env
            amount: data.amount,
            currency: data.currency,
            name: 'Appreciative Learning',
            description: 'Course Payment',
            order_id: data.id,
            handler: function (response) {
                console.log('Payment response:', response);
                fetch('/verify-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature
                    })
                })
                .then(verifyResponse => verifyResponse.json())
                .then(verifyData => {
                    console.log('Payment verification result:', verifyData);
                    if (verifyData.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Payment Successful!',
                            text: 'Your transaction was completed successfully.'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Failed',
                            text: 'There was an issue processing your payment. Please try again.'
                        });
                    }
                })
                .catch(error => {
                    console.error('Verification Error:', error);
                    Swal.fire({
                        icon: 'warning',
                        title: 'Payment Error',
                        text: 'An unexpected error occurred. Please contact support.'
                    });
                });
            },
            prefill: {
                name: '', // Dynamically populate
                email: '', // Dynamically populate
                contact: '' // Dynamically populate
            }
        };
        const rzp1 = new Razorpay(options);
        rzp1.open();
    })
    .catch(error => {
        console.error('Payment Initialization Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Payment Error',
            text: 'Could not initialize payment. Please try again.'
        });
    });
}

// Existing Course Modal Management Code
document.addEventListener('DOMContentLoaded', () => {
    const courseCards = document.querySelectorAll('.course-card');
    const courseModalOverlay = document.getElementById('courseModalOverlay');
    const courseModalCloseButton = document.getElementById('courseModalCloseButton');
    const courseModalImage = document.getElementById('courseModalImage');
    const courseModalTitle = document.getElementById('courseModalTitle');
    const courseModalDescription = document.getElementById('courseModalDescription');
    const courseModalPrice = document.getElementById('courseModalPrice');
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');

    let currentCourseDetails = {
        id: '',
        name: '',
        price: 0
    };

    function generateShortCourseCode(courseName) {
        // Create a short, meaningful code from course name
        const words = courseName.split(/\s+/);
        const shortCode = words
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 4);
        
        // Add a random 2-digit number for uniqueness
        const randomSuffix = Math.floor(10 + Math.random() * 90);
        return `${shortCode}${randomSuffix}`;
    }

    function openCourseModal(courseCard) {
        const courseName = courseCard.querySelector('.card-title').textContent;
        const coursePrice = courseCard.querySelector('.price').textContent;
        const courseImage = courseCard.querySelector('.img-cover').src;
        
        // Prefer data-course-id, otherwise generate a short code
        const courseId = courseCard.getAttribute('data-course-id') || 
                         generateShortCourseCode(courseName);
        
        // Enhanced course description extraction
        const courseDescription = courseCard.querySelector('.card-meta-list') ? 
            Array.from(courseCard.querySelector('.card-meta-list').children)
                .map(item => item.textContent.trim())
                .join(' | ') : 'Comprehensive course designed to help you excel in your career.';

        // Store current course details
        currentCourseDetails = {
            id: courseId,
            name: courseName,
            price: parseFloat(coursePrice.replace('₹', '').replace(',', ''))
        };

        // Create a very short, clean URL
        const newUrl = `${window.location.pathname}?c=${courseId}`;
        history.pushState(currentCourseDetails, courseName, newUrl);

        // Update modal content with enhanced details
        courseModalImage.src = courseImage;
        courseModalImage.alt = courseName;
        courseModalTitle.textContent = courseName;
        courseModalDescription.textContent = courseDescription;
        courseModalPrice.textContent = coursePrice;

        // Reset terms checkbox and checkout button
        termsCheckbox.checked = false;
        proceedToCheckoutBtn.disabled = true;

        // Show modal with CSS class and add subtle animation
        courseModalOverlay.classList.add('show');
        setTimeout(() => {
            courseModalOverlay.querySelector('.course-modal-container').style.transform = 'scale(1)';
        }, 50);

        console.log('Modal displayed with compact URL:', newUrl);
    }

    function closeCourseModal() {
        courseModalOverlay.classList.remove('show');
        
        // Revert URL to original page
        history.replaceState(null, '', window.location.pathname);
    }

    // Handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.name) {
            // Restore modal state if possible
            console.log('Restoring modal state:', event.state);
        } else {
            // Close modal if no state
            closeCourseModal();
        }
    });

    // Add event listeners to course cards
    courseCards.forEach(card => {
        card.addEventListener('click', (event) => {
            // Prevent opening modal if buy now button is clicked
            if (event.target.classList.contains('buy-now-btn')) {
                event.stopPropagation(); // Stop event from bubbling
                return;
            }
            
            openCourseModal(card);
        });
    });

    // Close modal button
    courseModalCloseButton.addEventListener('click', closeCourseModal);

    // Close modal when clicking outside
    courseModalOverlay.addEventListener('click', (event) => {
        if (event.target === courseModalOverlay) {
            closeCourseModal();
        }
    });

    // Check for initial URL parameters on page load
    const urlParams = new URLSearchParams(window.location.search);
    const courseParam = urlParams.get('c');

    if (courseParam) {
        const matchingCard = Array.from(courseCards).find(card => 
            card.getAttribute('data-course-id') === courseParam
        );

        if (matchingCard) {
            openCourseModal(matchingCard);
        }
    }

    // Terms checkbox event
    termsCheckbox.addEventListener('change', () => {
        console.log('Terms checkbox changed:', termsCheckbox.checked);
        proceedToCheckoutBtn.disabled = !termsCheckbox.checked;
    });

    // Proceed to checkout button
    proceedToCheckoutBtn.addEventListener('click', () => {
        console.log('Proceed to checkout clicked');
        if (termsCheckbox.checked) {
            console.log('Initiating payment for:', currentCourseDetails);
            initiateRazorpayPayment(currentCourseDetails.price);
        } else {
            console.log('Terms not accepted');
            Swal.fire({
                icon: 'warning',
                title: 'Terms Not Accepted',
                text: 'Please accept the terms and conditions before proceeding.'
            });
        }
    });

    // Buy Now buttons in course cards
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    console.log('Buy Now Buttons found:', buyNowButtons.length);
    
    buyNowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event from bubbling to parent card
            console.log('Buy Now button clicked', event.target);
            const courseCard = event.target.closest('.course-card');
            console.log('Opening modal for course card:', courseCard);
            openCourseModal(courseCard);
        });
    });
});
