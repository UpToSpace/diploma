import React, { useState } from 'react';
import bus from '../styles/images/bus.png'
import fullbus from '../styles/images/fullbus.png'
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Loader } from './Loader';

export const Feedback = ({ setShowFeedback, route }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const { request, loading } = useHttp();
    const auth = useContext(AuthContext);
    const userId = auth.userId;

    const handleRatingChange = (rate) => {
        setRating(rate);
    };

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const submitFeedback = async (event) => {
        event.preventDefault();
        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }
        if (comment.trim().length < 10) {
            alert('Please enter a comment with at least 10 characters.');
            return;
        }
        try {
        const data = await request('/api/reviews', 'POST', { user: userId, rating, text: comment, route });
        setShowFeedback(false);
        } catch (e) {
            console.log(e);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-2xl w-full mx-auto p-4 border shadow-lg rounded-md">
            <h2 className="text-xl font-semibold text-center mb-1">Ваш отзыв</h2>
            <form onSubmit={submitFeedback}>
                <div className="flex justify-center mb-1">
                    {[...Array(5)].map((star, index) => {
                        index += 1;
                        return (
                            <button
                                key={index}
                                className={`w-8 rounded-full mr-1 `}
                                onClick={() => handleRatingChange(index)}
                                type="button"
                            >
                                {index <= rating ? <img src={fullbus} /> : <img src={bus} />}
                            </button>
                        );
                    })}
                </div>
                <textarea
                    className="w-full p-2 border rounded-md min-h-11 max-h-48"
                    placeholder="Введите текст..."
                    value={comment}
                    onChange={handleCommentChange}
                    rows="4"
                />
                <div className="mt-4 flex justify-center">
                    <button 
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-4"
                    onClick={() => setShowFeedback(false)}>
                        Отменить
                    </button>
                    <button 
                    type="submit" 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                        Отправить
                    </button>
                </div>
            </form>
        </div>
    );
};
