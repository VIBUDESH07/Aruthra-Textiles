import React from 'react';
import { motion } from 'framer-motion';
const Footer = () => (
    <footer className="bg-indigo-800 text-white py-6">
        <div className="container mx-auto px-6 text-center">
            <p>© 2025 Aruthra Textiles. All rights reserved.</p>
            <div className="mt-4 flex justify-center space-x-4" aria-label="Social media links">
                {['Facebook', 'Instagram', 'Twitter'].map((social) => (
                    <a key={social} href="#" className="hover:text-gray-200" aria-label={`Visit our ${social} page`}>
                        {social}
                    </a>
                ))}
            </div>
        </div>
    </footer>
);
export default Footer;