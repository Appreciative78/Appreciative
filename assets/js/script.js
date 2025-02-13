document.addEventListener('DOMContentLoaded', () => {
    const courseModalOverlay = document.getElementById('courseModalOverlay');
    const courseModalCloseButton = document.getElementById('courseModalCloseButton');
    const courseModalImage = document.getElementById('courseModalImage');
    const courseModalTitle = document.getElementById('courseModalTitle');
    const courseModalDescription = document.getElementById('courseModalDescription');
    const courseModalPrice = document.getElementById('courseModalPrice');
    const proceedToCheckoutBtn = document.getElementById('proceedToCheckoutBtn');
    const termsCheckbox = document.getElementById('termsCheckbox');

    console.log('Modal Elements:', {
        overlay: courseModalOverlay,
        closeButton: courseModalCloseButton,
        image: courseModalImage,
        title: courseModalTitle,
        description: courseModalDescription,
        price: courseModalPrice,
        checkoutBtn: proceedToCheckoutBtn,
        termsCheckbox: termsCheckbox
    });

    let currentCourseDetails = {
        id: '',
        name: '',
        price: 0
    };

    function openCourseModal(courseCard) {
        console.log('Opening modal for course card:', courseCard);

        const courseName = courseCard.querySelector('.card-title').textContent.trim();
        const coursePrice = courseCard.querySelector('.price span').textContent;
        const courseImage = courseCard.querySelector('.img-cover').src;
        
        const courseId = courseCard.getAttribute('data-course-id');
        
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
        courseModalOverlay.classList.add('show', 'active');
    }

    // Buy Now buttons event listeners
    const buyNowButtons = document.querySelectorAll('.buy-now-btn');
    console.log('Buy Now Buttons:', buyNowButtons.length);
    
    buyNowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            
            const courseCard = button.closest('.course-card');
            if (courseCard) {
                openCourseModal(courseCard);
            } else {
                console.error('No course card found for this button');
            }
        });
    });

    // Terms checkbox event with detailed logging
    termsCheckbox.addEventListener('change', (event) => {
        console.log('Terms Checkbox Changed:', {
            checked: termsCheckbox.checked,
            event: event
        });

        // Enable/disable checkout button based on checkbox
        proceedToCheckoutBtn.disabled = !termsCheckbox.checked;

        // Visual feedback
        if (termsCheckbox.checked) {
            proceedToCheckoutBtn.classList.remove('disabled');
            proceedToCheckoutBtn.style.opacity = '1';
        } else {
            proceedToCheckoutBtn.classList.add('disabled');
            proceedToCheckoutBtn.style.opacity = '0.5';
        }
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

    // Close modal button
    courseModalCloseButton.addEventListener('click', () => {
        courseModalOverlay.classList.remove('show', 'active');
    });

    // Close modal when clicking outside
    courseModalOverlay.addEventListener('click', (event) => {
        if (event.target === courseModalOverlay) {
            courseModalOverlay.classList.remove('show', 'active');
        }
    });
});

function initiateRazorpayPayment(amount) {
    console.log(`Attempting to create order for ₹${amount}`);
    
    fetch('https://www.appreciativelearning.in/api/payment/create-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => {
        if (!response.ok) {
            console.error('Response status:', response.status);
            console.error('Response text:', response.statusText);
            return response.text().then(text => {
                throw new Error(`Order creation failed: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        const options = {
            key: 'rzp_test_tkNtqrcihTQnwN',
            amount: data.amount,
            currency: data.currency,
            name: 'Appreciative Learning',
            description: 'Course Purchase',
            order_id: data.id,
            handler: function (response) {
                fetch('https://www.appreciativelearning.in/api/payment/verify-payment', {
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
