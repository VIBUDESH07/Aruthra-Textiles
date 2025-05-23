import React from 'react';
import { motion } from 'framer-motion';
const Products = () => {
    const [filter, setFilter] = React.useState('all');
    const products = [
        {
            name: "Handwoven Silk",
            desc: "Luxurious silk with intricate patterns for elegant designs.",
            img: "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?q=80&w=2070&auto=format&fit=crop",
            category: "silk",
        },
        {
            name: "Eco-Friendly Cotton",
            desc: "Sustainable cotton blends, soft and durable for everyday wear.",
            img: "https://images.unsplash.com/photo-1551489186-cf8726f514f8?q=80&w=2070&auto=format&fit=crop",
            category: "cotton",
        },
        {
            name: "Vibrant Prints",
            desc: "Bold and colorful printed fabrics for modern fashion.",
            img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=2070&auto=format&fit=crop",
            category: "prints",
        },
        {
            name: "Linen Blends",
            desc: "Breathable and stylish linen fabrics for summer collections.",
            img: "https://images.unsplash.com/photo-1600585153490-76fb20a0f145?q=80&w=2070&auto=format&fit=crop",
            category: "linen",
        },
        {
            name: "Velvet Luxe",
            desc: "Rich and soft velvet for luxurious garments and decor.",
            img: "https://images.unsplash.com/photo-1615471614849-5c2a2b04b667?q=80&w=2070&auto=format&fit=crop",
            category: "velvet",
        },
    ];

    const filteredProducts = filter === 'all' ? products : products.filter((product) => product.category === filter);

    return (
        <motion.section
            id="products"
            className="py-20 bg-gray-50"
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
                    Our Products
                </motion.h2>
                <div className="flex justify-center mb-8">
                    <div className="flex space-x-4">
                        {['all', 'silk', 'cotton', 'prints', 'linen', 'velvet'].map((category) => (
                            <button
                                key={category}
                                onClick={() => setFilter(category)}
                                className={`px-4 py-2 rounded-lg capitalize ${filter === category ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-indigo-500 hover:text-white transition`}
                                aria-label={`Filter by ${category} products`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product.name}
                            className="group bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
                            initial={{ y: 50, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            viewport={{ once: true }}
                        >
                            <img src={product.img} alt={`${product.name} fabric`} className="w-full h-48 object-cover rounded-lg mb-4" />
                            <h3 className="text-xl font-semibold">{product.name}</h3>
                            <p className="text-gray-600">{product.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
};
export default Products;