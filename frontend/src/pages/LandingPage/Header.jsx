import React from 'react';

const Header = () => (
    <header className="bg-white shadow-md fixed w-full z-10">
        <nav className="container mx-auto flex justify-between items-center py-4 px-6" aria-label="Main navigation">
            <div className="text-2xl font-bold text-indigo-600">Aruthra Textiles</div>
            <ul className="flex space-x-6">
                {['Home', 'About', 'Process', 'Products', 'Sustainability', 'Testimonials', 'Contact'].map((item) => (
                    <li key={item}>
                        <a href={`#${item.toLowerCase()}`} className="hover:text-indigo-600 transition" aria-label={`Navigate to ${item} section`}>
                            {item}
                        </a>
                    </li>
                ))}
            </ul>
            <div>
                <button
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    onClick={() => window.location.href = '/login'}
                >
                    Login/Signup
                </button>
            </div>
        </nav>
    </header>
);

export default Header;