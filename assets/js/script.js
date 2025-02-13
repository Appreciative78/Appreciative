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
        const words = courseName.split(/\s+/);
        const shortCode = words
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 4);
        
        const randomSuffix = Math.floor(10 + Math.random() * 90);
        return `${shortCode}${randomSuffix}`;
    }

    function openCourseModal(courseCard) {
        console.log('Attempting to open modal for:', courseCard);
        
        if (!courseModalOverlay) {
            console.error('Course modal overlay not found!');
            return;
        }

        const courseName = courseCard.querySelector('.card-title').textContent;
        const coursePrice = courseCard.querySelector('.price').textContent;
        const courseImage = courseCard.querySelector('.img-cover').src;
        
        const courseId = courseCard.getAttribute('data-course-id') || 
                         generateShortCourseCode(courseName);
        
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

        // Update modal content
        courseModalImage.src = courseImage;
        courseModalImage.alt = courseName;
        courseModalTitle.textContent = courseName;
        courseModalDescription.textContent = courseDescription;
        courseModalPrice.textContent = coursePrice;

        // Reset terms checkbox and checkout button
        termsCheckbox.checked = false;
        proceedToCheckoutBtn.disabled = true;

        // Show modal
        courseModalOverlay.classList.add('show');
        
        // Staggered animation for modal content
        const modalElements = courseModalOverlay.querySelectorAll('.modal-content > *');
        modalElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });

        console.log('Modal displayed with course details:', currentCourseDetails);
    }

    // Buy Now buttons event listeners
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    console.log('Buy Now Buttons found:', buyNowButtons.length);
    
    buyNowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            console.log('Buy Now button clicked', event.target);
            
            const courseCard = event.target.closest('.course-card');
            if (courseCard) {
                console.log('Opening modal for course card:', courseCard);
                openCourseModal(courseCard);
            } else {
                console.error('No course card found for this button');
            }
        });
    });

    // Close modal button
    courseModalCloseButton.addEventListener('click', () => {
        courseModalOverlay.classList.remove('show');
    });

    // Close modal when clicking outside
    courseModalOverlay.addEventListener('click', (event) => {
        if (event.target === courseModalOverlay) {
            courseModalOverlay.classList.remove('show');
        }
    });

    // Terms checkbox event
    termsCheckbox.addEventListener('change', () => {
        proceedToCheckoutBtn.disabled = !termsCheckbox.checked;
    });

    // Proceed to checkout button
    proceedToCheckoutBtn.addEventListener('click', () => {
        if (termsCheckbox.checked) {
            console.log('Initiating payment for:', currentCourseDetails);
            initiateRazorpayPayment(currentCourseDetails.price);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Terms Not Accepted',
                text: 'Please accept the terms and conditions before proceeding.'
            });
        }
    });
});

// Existing Razorpay payment function (with previous modifications)
function initiateRazorpayPayment(amount) {
    console.log(`Attempting to create order for ₹${amount}`);
    
    fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Order creation failed: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const options = {
            key: 'rzp_test_tkNtqrcihTQnwN',
            amount: data.amount,
            currency: data.currency,
            name: 'Appreciative Learning',
            description: 'UPPSC P/M/I Exam Preparation Course',
            order_id: data.id,
            handler: function (response) {
                fetch('/api/payment/verify-payment', {
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
                    if (verifyData.status === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Payment Successful!',
                            text: 'Your course access has been granted.'
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Payment Failed',
                            text: 'There was an issue processing your payment.'
                        });
                    }
                })
                .catch(error => {
                    console.error('Verification Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Payment Error',
                        text: 'An unexpected error occurred.'
                    });
                });
            },
            prefill: {
                name: '',
                email: '', 
                contact: ''
            },
            theme: {
                color: '#3498db'
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
