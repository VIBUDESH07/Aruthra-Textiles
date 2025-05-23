import React from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import Hero from './Hero';
import About from './About';
import Process from './Process'; 
import Sustainability from './Sustainability';
import Products from './Products';
import Testimonials from './Testimonials';
import Contact from './Contact';
import Newsletter from './NewsLetter';
import Footer from './Footer';
// Layout Component           
const Layout = () => (
    <div>
        <Header />
        <Hero />
        <About />
        <Process />
        <Sustainability />
        <Products />
        <Testimonials />
        <Contact />
        <Newsletter />
        <Footer />
    </div>
);

export default Layout;