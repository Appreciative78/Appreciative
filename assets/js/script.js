function initiateRazorpayPayment(amount) {
    console.log(`Attempting to create order for ₹${amount}`);
    
    // Update fetch URL to match backend route
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
            key: 'rzp_test_tkNtqrcihTQnwN', // Your Razorpay Key ID
            amount: data.amount,
            currency: data.currency,
            name: 'Appreciative Learning',
            description: 'UPPSC P/M/I Exam Preparation Course',
            order_id: data.id,
            handler: function (response) {
                // Verify payment with backend
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
                        // Additional logic for course access
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
                name: '', // You can dynamically populate
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
