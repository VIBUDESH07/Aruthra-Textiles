import React from 'react';
import { motion } from 'framer-motion';
        const About = () => (
            <motion.section
                id="about"
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
                        About Aruthra Textiles
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
                                src="https://images.unsplash.com/photo-1586771107445-3b3b4f138600?q=80&w=2070&auto=format&fit=crop"
                                alt="Aruthra Textiles woven fabric craftsmanship"
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
                                Founded in 2000, Aruthra Textiles is a family-owned business dedicated to blending traditional weaving techniques with modern innovation. Our fabrics are crafted to inspire designers, retailers, and homeowners worldwide.
                            </p>
                            <p className="text-lg mb-4">
                                Our mission is to create sustainable, high-quality textiles that elevate every project. From handwoven silks to eco-friendly cottons, we prioritize ethical production and environmental responsibility.
                            </p>
                            <p className="text-lg font-semibold">Our Vision: To lead the textile industry with sustainable elegance and unmatched craftsmanship.</p>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        );
  export default About;