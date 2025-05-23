
import React, { useState } from 'react';
import { motion } from 'framer-motion';
const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const validateEmail = () => {
        if (!email.trim()) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format';
        return '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const emailError = validateEmail();
        if (emailError) {
            setError(emailError);
            return;
        }
        alert(`Subscribed with ${email}! (Placeholder for actual subscription)`);
        setEmail('');
        setError('');
    };

    return (
        <motion.section
            className="py-20 bg-indigo-600 text-white"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
        >
            <div className="container mx-auto px-6 text-center">
                <motion.h2
                    className="text-4xl font-bold mb-6"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    Join Our Newsletter
                </motion.h2>
                <p className="text-lg mb-6">Stay updated with our latest collections, exclusive offers, and sustainability initiatives.</p>
                <motion.div
                    className="max-w-md mx-auto"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <form onSubmit={handleSubmit} className="flex" noValidate>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            className={`w-full p-3 rounded-l-lg text-gray-800 focus:outline-none ${error ? 'border-red-500' : ''}`}
                            placeholder="Enter your email"
                            aria-label="Email for newsletter subscription"
                            aria-describedby="newsletter-error"
                        />
                        <button
                            type="submit"
                            className="bg-indigo-800 p-3 rounded-r-lg hover:bg-indigo-900 transition"
                            aria-label="Subscribe to newsletter"
                        >
                            Subscribe
                        </button>
                    </form>
                    {error && <p id="newsletter-error" className="text-red-200 text-sm mt-2">{error}</p>}
                </motion.div>
            </div>
        </motion.section>
    );
};
export default Newsletter;