import React from 'react';
import { motion } from 'framer-motion';
import {useState} from 'react';
// Process Component
const Process = () => (
    <motion.section
        id="process"
        className="py-20 bg-white"
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
                Our Crafting Process
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        title: "Sourcing",
                        desc: "We source sustainable, high-quality raw materials like organic cotton and natural silk from trusted suppliers.",
                        img: "https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?q=80&w=2070&auto=format&fit=crop",
                    },
                    {
                        title: "Weaving",
                        desc: "Our skilled artisans combine traditional looms with modern machinery for precision and quality.",
                        img: "https://images.unsplash.com/photo-1602170901899-8274d3c9fd17?q=80&w=2070&auto=format&fit=crop",
                    },
                    {
                        title: "Finishing",
                        desc: "Each fabric undergoes rigorous quality checks and eco-friendly finishing processes for perfection.",
                        img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2070&auto=format&fit=crop",
                    },
                ].map((step, index) => (
                    <motion.div
                        key={step.title}
                        className="bg-gray-100 p-6 rounded-lg shadow-lg hover:shadow-xl transition"
                        initial={{ y: 50, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                        viewport={{ once: true }}
                    >
                        <img src={step.img} alt={`Aruthra Textiles ${step.title} process`} className="w-full h-48 object-cover rounded-lg mb-4" />
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="text-gray-600">{step.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    </motion.section>
);
export default Process