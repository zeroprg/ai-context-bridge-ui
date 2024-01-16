import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { FaPaypal } from 'react-icons/fa'; // Import icons
import axios from 'axios';
import { useUser } from './UserContext';
import { API_URLS } from '../apiConstants';

const stripePromise = loadStripe('pk_live_51OHy1KFJuJWNHOtRRihaRzzV7ofa1AQIhhbPbbXt3h9FmuYWvS4ahPopRKdO995MldQc7LiV23VV6HSq3Z7kbREc00d0dQLZ2L');

interface StripePaymentComponentProps {
    amount: number; // Amount in dollars
}

const StripePaymentComponent: React.FC<StripePaymentComponentProps> = ({ amount }) => {
    const { user } = useUser();

    const redirectToCheckout = async () => {
        try {
            const stripe = await stripePromise;

            // Include the userId in the request
            const userId = user?.id; // This should be dynamically set based on logged-in user
            const response = await axios.post(API_URLS.StripeCheckout, { amount, userId });

            const { error } = await stripe!.redirectToCheckout({
                sessionId: response.data.id,
            });

            if (error) {
                console.error(`Error redirecting to checkout: ${error.message}`);
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
        }
    };

    return (
        <div>
            <FaPaypal className="delete-file-icon" onClick={redirectToCheckout} title={`Pay ${amount}$ with Stripe`} />
        </div>
    );
};

export default StripePaymentComponent;