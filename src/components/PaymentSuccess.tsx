import { Link } from 'react-router-dom'; // Assuming you're using React Router for navigation

const PaymentSuccess = () => {
    return (
        <div className="payment-success">
            <h1>Payment Successful</h1>
            <p>Thank you for your payment. Your transaction has been completed, and a receipt for your purchase has been emailed to you.</p>
            
            {/* Optionally display more transaction details here */}

            <p>You may log into your account at www.paypal.com to view details of this transaction.</p>
            <Link to="/api">Return to Home</Link>
            {/* Replace '/' with the path to your desired home or landing page */}
        </div>
    );
};

export default PaymentSuccess;