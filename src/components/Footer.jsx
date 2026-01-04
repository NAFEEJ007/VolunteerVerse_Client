import React from 'react';
import { Link } from 'react-router-dom';
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* About */}
                    <div>
                        <h3 className="text-xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>VolunteerVerse</h3>
                        <p className="text-gray-300 text-sm">
                            Connecting volunteers with meaningful opportunities to make a difference in their communities.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/volunteer/dashboard" className="text-gray-300 hover:text-white transition-colors">Events</Link></li>
                            <li><Link to="/register" className="text-gray-300 hover:text-white transition-colors">Sign Up</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Contact</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <HiMail className="text-primary" />
                                info@volunteerverse.com
                            </li>
                            <li className="flex items-center gap-2">
                                <HiPhone className="text-primary" />
                                +8801871190447
                            </li>
                            <li className="flex items-center gap-2">
                                <HiLocationMarker className="text-primary" />
                                Sector 13, Road 14, Uttara, Dhaka - 1230
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-primary hover:bg-indigo-700 p-2 rounded-full transition-colors">
                                <FaFacebookF />
                            </a>
                            <a href="#" className="bg-primary hover:bg-indigo-700 p-2 rounded-full transition-colors">
                                <FaTwitter />
                            </a>
                            <a href="#" className="bg-primary hover:bg-indigo-700 p-2 rounded-full transition-colors">
                                <FaInstagram />
                            </a>
                            <a href="#" className="bg-primary hover:bg-indigo-700 p-2 rounded-full transition-colors">
                                <FaLinkedinIn />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
                    <p>&copy; {new Date().getFullYear()} VolunteerVerse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
