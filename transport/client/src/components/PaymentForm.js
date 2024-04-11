// PaymentForm.js
import React, { useCallback, useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { toast } from 'react-hot-toast';
import { SavedCardsSelect } from './SavedCardsSelect';
import { Loader } from './Loader';

export default function PaymentForm({ amount }) {
    const stripe = useStripe();
    const elements = useElements();
    const { request } = useHttp();
    const { userId } = useContext(AuthContext);
    const [saveCard, setSaveCard] = useState(false);
    const [showCardElement, setShowCardElement] = useState(false);
    const [savedCards, setSavedCards] = useState([]);

    const getSavedCards = useCallback(async () => {
        try {
            const data = await request('/api/creditcards?' + new URLSearchParams({ userId }));
            setSavedCards(data);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request]);

    useEffect(() => {
        getSavedCards();
    }, []);

    const handleSelectCard = (cardToken) => {
        console.log('Selected card token:', cardToken);
        // Here you might set state or otherwise use the selected card token
    };

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();

            if (!stripe || !elements || !amount || !userId) {
                return;
            }
            // console.log('stripe', stripe);
            // console.log('elements', elements);
            // console.log('amount', amount);
            // console.log('userId', userId);
            const cardElement = elements.getElement(CardElement);

            const { token, error } = await stripe.createToken(cardElement);

            if (error) {
                console.log(error);
                return;
            }
            const response = await request('/api/creditcards/charge', 'POST', { token: token.id, saveCard, amount, userId })
            console.log(response);
        } catch (e) {
            toast.error(e.message);
        }
    };

    if (!stripe || !elements || !userId || !savedCards) {
        return <Loader />
    }

    return (
        <>
            <input
                id="another-card"
                type="checkbox"
                checked={showCardElement}
                onChange={(e) => setShowCardElement(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="another-card" className="ml-2 block text-sm text-gray-900">
                Pay with another card
            </label>
            {!showCardElement &&
                <>
                    <SavedCardsSelect savedCards={savedCards} onSelectCard={handleSelectCard} />
                    <div className="flex items-center">
                        <button
                            disabled={!stripe}
                            className={`inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!stripe ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                        >
                            Pay
                        </button>
                    </div>
                </>
            }
            {showCardElement &&
                <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
                    <div className="p-4 border border-gray-300 rounded-md">
                        <CardElement options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }} />
                    </div>
                    <div className="flex items-center">
                        <input
                            id="save-card"
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="save-card" className="ml-2 block text-sm text-gray-900">
                            Save card for future payments
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!stripe}
                        className={`inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${!stripe ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        Pay
                    </button>
                </form>}
        </>
    );
}
