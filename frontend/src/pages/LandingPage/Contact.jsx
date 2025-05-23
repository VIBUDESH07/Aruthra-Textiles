import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import { useState } from 'react';
const Contact = () => {
    const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = React.useState({});

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
        setErrors({ ...errors, [e.target.id]: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        alert('Form submitted successfully! (Placeholder for actual submission)');
        setFormData({ name: '', email: '', message: '' });
    };

    return (
        <motion.section
            id="contact"
            className="py-20 bg-gray-100"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
        >
            <div className="container mx-auto px-6">
                <motion.h2
                    className="text-4xl font-bold text-center mb-12"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    Get in Touch
                </motion.h2>
                <motion.div
                    className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg"
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${errors.name ? 'border-red-500' : ''}`}
                                placeholder="Your Name"
                                aria-describedby="name-error"
                            />
                            {errors.name && <p id="name-error" className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${errors.email ? 'border-red-500' : ''}`}
                                placeholder="Your Email"
                                aria-describedby="email-error"
                            />
                            {errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium">Message</label>
                            <textarea
                                id="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 ${errors.message ? 'border-red-500' : ''}`}
                                placeholder="Your Message"
                                aria-describedby="message-error"
                            ></textarea>
                            {errors.message && <p id="message-error" className="text-red-500 text-sm mt-1">{errors.message}</p>}
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition"
                            aria-label="Submit contact form"
                        >
                            Send Message
                        </button>
                    </form>
                </motion.div>
            </div>
        </motion.section>
    );
};
export default Contact;