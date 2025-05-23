import React from 'react';
import { motion } from 'framer-motion';
const Testimonials = () => (
    <motion.section
        id="testimonials"
        className="py-20 bg-indigo-50"
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
                What Our Customers Say
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { quote: "Aruthra Textiles provided us with the finest silk for our latest collection. The quality is unmatched!", author: "Priya S., Fashion Designer" },
                    { quote: "Their eco-friendly cotton is perfect for our sustainable clothing line. Highly recommend!", author: "Anil K., Retailer" },
                    { quote: "The vibrant prints added a unique flair to our decor projects. Exceptional service!", author: "Meera R., Interior Designer" },
                    { quote: "Their linen blends are a game-changer for summer fashion. Absolutely love the texture!", author: "Vikram T., Boutique Owner" },
                ].map((testimonial, index) => (
                    <motion.div
                        key={index}
                        className="bg-white p-6 rounded-lg shadow-lg"
                        initial={{ x: 50, opacity: 0 }}
                        whileInView={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                        <p className="mt-4 font-semibold">– {testimonial.author}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.section>
);
export default Testimonials;