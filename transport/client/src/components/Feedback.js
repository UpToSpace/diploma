import React, { useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import { AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import { Loader } from './Loader';

export const Feedback = ({ setShowFeedback, route, getTickets, getUserReviews }) => {
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
            await getTickets();
            await getUserReviews();
            setShowFeedback(false);
        } catch (e) {
            console.log(e);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-3xl w-full mx-auto p-4 border shadow-lg border-primary rounded-3xl">
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
                                {index <= rating ? <img width="50" height="50" src="https://img.icons8.com/ios-filled/50/FFD43A/bus2.png" alt="bus2" />
                                    : <img width="50" height="50" src="https://img.icons8.com/ios/50/000000/bus2.png" alt="bus2" />}
                            </button>
                        );
                    })}
                </div>
                <textarea
                    className="w-full p-2 border rounded-md min-h-11 max-h-48"
                    placeholder="Введите текст..."
                    value={comment}
                    onChange={handleCommentChange}
                    rows={4}
                    maxLength={500}
                />
                <div className="mt-4 flex justify-center">
                    <button
                        className="border border-octonary hover:bg-octonary hover:text-white text-octonary duration-300 transition-all font-bold py-2 px-4 rounded mr-4"
                        onClick={() => setShowFeedback(false)}>
                        Отменить
                    </button>
                    <button
                        type="submit"
                        className="border border-septenary hover:bg-septenary hover:text-white text-septenary duration-300 transition-all font-bold py-2 px-4 rounded">
                        Отправить
                    </button>
                </div>
            </form>
        </div>
    );
};
