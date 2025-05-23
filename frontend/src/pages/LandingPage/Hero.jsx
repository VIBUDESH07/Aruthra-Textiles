import React from 'react';
import { motion } from 'framer-motion';
const Hero = () => (
    <motion.section
        id="home"
        className="h-screen flex items-center justify-center bg-cover bg-center parallax"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        role="banner"
    >
        <motion.div
            className="text-center text-white bg-black bg-opacity-50 p-10 rounded-lg"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
        >
            <h1 className="text-5xl font-bold mb-4">Welcome to Aruthra Textiles</h1>
            <p className="text-xl mb-6">Crafting premium fabrics with tradition and innovation since 2000.</p>
            <a
                href="#products"
                className="bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-700 transition"
                aria-label="Shop our textile collections"
            >
                Shop Now
            </a>
        </motion.div>
    </motion.section>
);
export default Hero;