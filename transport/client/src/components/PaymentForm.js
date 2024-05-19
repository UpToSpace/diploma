// PaymentForm.js
import React, { useCallback, useEffect, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { toast } from 'react-hot-toast';
import { SavedCardsSelect } from './SavedCardsSelect';
import { Loader } from './Loader';

export default function PaymentForm({ amount, seats, routeId }) {
    const stripe = useStripe();
    const elements = useElements();
    const { request, loading } = useHttp();
    const { userId } = useContext(AuthContext);
    const [saveCard, setSaveCard] = useState(false);
    const [showCardElement, setShowCardElement] = useState(false);
    const [savedCards, setSavedCards] = useState([]);
    const [cardToPay, setCardToPay] = useState(null);   
    const [payButtonDisabled, setPayButtonDisabled] = useState(false);

    const getSavedCards = useCallback(async () => {
        try {
            const data = await request('/api/creditcards?' + new URLSearchParams({ userId }));
            setSavedCards(data);
            if (data.length !== 0) {
                setCardToPay(data[0]._id);
            }
            if (data.length === 0) setShowCardElement(true);
        } catch (e) {
            toast.error(e.message);
        }
    }, [request]);

    useEffect(() => {
        getSavedCards();
    }, []);

    const handleSelectCard = async (cardId) => {
        setPayButtonDisabled(true);
        if (!cardId || !amount || !routeId || !seats || !userId) {
            return toast.error('Заполните все поля');
        }
        try {
            const data = await request('/api/creditcards/charge/saved', 'POST', { cardId, amount, routeId, seats, userId });
            console.log(data);
            if (data) window.location.reload();
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();

            if (!stripe || !elements || !amount || !userId) {
                return toast.error('Заполните все поля');
            }
            setPayButtonDisabled(true);
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
            const response = await request('/api/creditcards/charge', 'POST', { token: token.id, saveCard, amount, userId, seats, routeId })
            console.log(response);
            window.location.reload();
        } catch (e) {
            toast.error(e.message);
        }
    };

    if (!stripe || !elements || !userId || !savedCards || loading) {
        return <Loader />
    }

    return (
        <div className="flex flex-col items-center w-full max-w-96">
            {savedCards.length !== 0  && <div className="w-full pb-1">
                <input
                    id="another-card"
                    type="checkbox"
                    checked={showCardElement}
                    onChange={(e) => setShowCardElement(e.target.checked)}
                    className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="another-card" className="ml-3 text-sm font-medium text-gray-900 w-full">
                    Оплатить другой картой
                </label>
            </div>}

            {!showCardElement && savedCards.length !== 0 && (
                <div className="space-y-4 w-full">
                    <SavedCardsSelect savedCards={savedCards} onSelectCard={setCardToPay} className="w-full" />
                    <button
                        disabled={!stripe || !cardToPay || loading || payButtonDisabled}
                        className={`px-6 py-2 w-full text-sm font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${!stripe ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleSelectCard(cardToPay)}
                    >
                        Оплатить
                    </button>
                </div>
            )}

            {showCardElement && (
                <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    <div className="p-4 bg-gray-50 border border-gray-300 rounded-md w-full">
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
                                }
                            },
                        }} />
                    </div>
                    <div className="w-full">
                        <input
                            id="save-card"
                            type="checkbox"
                            checked={saveCard}
                            onChange={(e) => setSaveCard(e.target.checked)}
                            className="w-6 h-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="save-card" className="ml-3 text-sm text-gray-900 w-full">
                            Сохранить карту
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!stripe || loading || payButtonDisabled}
                        className={`w-full px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out ${!stripe ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Оплатить
                    </button>
                </form>
            )}
        </div>
    );
}
