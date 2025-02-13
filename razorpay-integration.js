document.addEventListener('DOMContentLoaded', () => {
  const buyButtons = document.querySelectorAll('.proceed-checkout-btn');
  
  buyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const courseId = e.target.dataset.courseId;
      
      try {
        // Create order with backend
        const response = await fetch('/api/payment/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ courseId: 'uppsc_pmi_course' })
        });
        
        const order = await response.json();
        
        // Razorpay checkout options
        const options = {
          key: 'rzp_test_tkNtqrcihTQnwN', // Your Razorpay Key ID
          amount: order.amount,
          currency: 'INR',
          name: 'Appreciative Learning',
          description: 'UPPSC P/M/I Exam Preparation Course',
          order_id: order.id,
          handler: async function (response) {
            // Verify payment with backend
            const verifyResponse = await fetch('/api/payment/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            
            const verificationResult = await verifyResponse.json();
            
            if (verificationResult.status === 'success') {
              alert('Payment successful! Access your course now.');
              // Redirect or grant course access
            } else {
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: '', // Add customer name if available
            email: '', // Add customer email if available
            contact: '' // Add customer phone if available
          },
          notes: {
            course_id: courseId
          },
          theme: {
            color: '#3498db'
          }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
        
      } catch (error) {
        console.error('Payment error:', error);
        alert('There was an error processing your payment.');
      }
    });
  });
});