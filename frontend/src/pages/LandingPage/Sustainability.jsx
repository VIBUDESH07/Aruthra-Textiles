import React from 'react';
import { motion } from 'framer-motion';
const Sustainability = () => (
    <motion.section
        id="sustainability"
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
                Our Commitment to Sustainability
            </motion.h2>
            <div className="flex flex-col md:flex-row items-center">
                <motion.div
                    className="md:w-1/2 mb-6 md:mb-0"
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                >
                    <img
                        src="https://images.unsplash.com/photo-1587502537140-0e3e0c0e0c0b?q=80&w=2070&auto=format&fit=crop"
                        alt="Sustainable textile production"
                        className="rounded-lg shadow-lg w-full h-auto max-w-md md:max-w-lg lg:max-w-xl"
                    />
                </motion.div>
                <motion.div
                    className="md:w-1/2 md:pl-10"
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                >
                    <p className="text-lg mb-4">
                        At Aruthra Textiles, sustainability is at the core of our operations. We use eco-friendly materials, such as organic cotton and recycled fibers, to minimize our environmental footprint.
                    </p>
                    <p className="text-lg">
                        Our production processes are designed to reduce waste and energy consumption, and we partner with local communities to ensure fair labor practices. Join us in creating a greener future with beautiful, sustainable textiles.
                    </p>
                </motion.div>
            </div>
        </div>
    </motion.section>
);

export default Sustainability