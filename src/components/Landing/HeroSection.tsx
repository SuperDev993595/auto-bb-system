import React from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <section className="relative bg-gradient-to-b from-[#0d0f15] to-[#08090d] min-h-[550px] flex items-center justify-center text-center px-4 overflow-hidden">
            {/* Background Image */}
            <img
                src="/images/banner.jpg"
                alt="Auto Mechanic Banner"
                className="absolute inset-0 w-full h-full object-cover opacity-10 z-0"
            />

            {/* Overlay Content */}
            <div className="relative z-10 max-w-2xl mx-auto animate-fade-in-down">
                <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-4 drop-shadow">
                    We Answer While You Repair
                </h1>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                    Let our Virtual Secretary handle appointments, collections, and
                    marketing while you focus on quality service.
                </p>
                <button
                    onClick={() => navigate("/admin/dashboard")}
                    className="px-6 py-2 md:px-8 md:py-3 rounded-full bg-yellow-400 text-gray-900 font-semibold text-sm md:text-base shadow-md transition-all duration-300 hover:bg-yellow-300 hover:shadow-lg hover:scale-105 active:scale-95"
                >
                    Book a Demo
                </button>
            </div>
        </section>
    );
};

export default HeroSection;
