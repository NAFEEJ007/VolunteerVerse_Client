import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import VolunteerLayout from '../components/VolunteerLayout';
import EventCard from '../components/EventCard';
import { HiCheckCircle, HiStar, HiClock, HiCurrencyDollar, HiDownload } from 'react-icons/hi';
import { jsPDF } from 'jspdf';

const MyEvents = () => {
    const { currentUser, username } = useAuth();
    const [activeTab, setActiveTab] = useState('joined');
    const [joined, setJoined] = useState([]);
    const [bookmarked, setBookmarked] = useState([]);
    const [requested, setRequested] = useState([]);
    const [donations, setDonations] = useState({ donations: [], total: 0 });
    const [loading, setLoading] = useState(true);

    const fetchMyEventsData = async () => {
        if (!currentUser) return;

        try {
            const token = await currentUser.getIdToken();
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            const [joinedRes, bookmarkedRes, requestedRes, donationsRes] = await Promise.all([
                axios.get(`${getApiBase()}/api/my-events/joined`, config),
                axios.get(`${getApiBase()}/api/my-events/bookmarked`, config),
                axios.get(`${getApiBase()}/api/my-events/requested`, config),
                axios.get(`${getApiBase()}/api/my-events/donations`, config),
            ]);

            setJoined(joinedRes.data);
            setBookmarked(bookmarkedRes.data);
            setRequested(requestedRes.data);
            setDonations(donationsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching my events:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchMyEventsData();
        }
    }, [currentUser]);

    const tabs = [
        { id: 'joined', label: 'Joined Events', count: joined.length, icon: HiCheckCircle },
        { id: 'bookmarked', label: 'Bookmarked', count: bookmarked.length, icon: HiStar },
        { id: 'requested', label: 'Requested', count: requested.length, icon: HiClock },
        { id: 'donations', label: 'Donations', count: donations.donations.length, icon: HiCurrencyDollar },
    ];

    if (loading) {
        return (
            <VolunteerLayout>
                <div className="text-center py-8">Loading your events...</div>
            </VolunteerLayout>
        );
    }

    const generateReceipt = async (donation) => {
        const doc = new jsPDF();
        const primaryColor = '#4F46E5';

        // Header
        try {
            const logoImg = new Image();
            logoImg.src = '/logo.svg';
            await new Promise((resolve, reject) => {
                logoImg.onload = resolve;
                logoImg.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            canvas.width = logoImg.width;
            canvas.height = logoImg.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(logoImg, 0, 0);
            const logoData = canvas.toDataURL('image/png');

            doc.addImage(logoData, 'PNG', 20, 10, 15, 15);
            doc.setFontSize(24);
            doc.setTextColor(primaryColor);
            doc.text("VolunteerVerse", 40, 20);
        } catch (error) {
            console.error('Error loading logo for receipt:', error);
            doc.setFontSize(24);
            doc.setTextColor(primaryColor);
            doc.text("VolunteerVerse", 20, 20);
        }
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text("Donation Receipt", 20, 30);

        // Receipt Details
        doc.setDrawColor(200);
        doc.line(20, 35, 190, 35);

        doc.setFontSize(10);
        doc.setTextColor(0);
        
        const date = new Date(donation.date).toLocaleDateString();
        const receiptNo = donation._id.substring(0, 8).toUpperCase();

        doc.text(`Receipt #: ${receiptNo}`, 140, 45);
        doc.text(`Date: ${date}`, 140, 50);

        // Bill To
        doc.setFontSize(12);
        doc.text("Received From:", 20, 50);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(username || currentUser.email, 20, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(currentUser.email, 20, 66);

        // Donation Details Table
        doc.setFillColor(245, 247, 250);
        doc.rect(20, 80, 170, 10, 'F');
        
        doc.setFont("helvetica", "bold");
        doc.text("Description", 25, 86);
        doc.text("Amount", 160, 86);

        doc.setFont("helvetica", "normal");
        doc.text(`Donation for Event: ${donation.event?.title || 'General Donation'}`, 25, 100);
        doc.text(`$${donation.amount.toFixed(2)}`, 160, 100);

        doc.line(20, 110, 190, 110);

        // Total
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Total:", 130, 120);
        doc.text(`$${donation.amount.toFixed(2)}`, 160, 120);

        // Signatures
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        
        // Authorized Signature
        doc.text("Authorized Signature", 140, 160);
        doc.line(130, 155, 180, 155);
        doc.setFont("times", "italic");
        doc.text("VolunteerVerse", 135, 150);

        // Donor Signature
        doc.setFont("helvetica", "normal");
        doc.text("Donor Signature", 30, 160);
        doc.line(20, 155, 80, 155);
        doc.setFont("times", "italic");
        doc.text(currentUser.displayName || "Donor", 25, 150);

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Thank you for your support!", 105, 280, { align: "center" });

        doc.save(`Receipt_${receiptNo}.pdf`);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'joined':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {joined.length === 0 ? (
                            <div className="col-span-full card text-center">
                                <p className="text-gray-600">You haven't joined any events yet.</p>
                            </div>
                        ) : (
                            joined.map((event) => (
                                <EventCard key={event._id} event={event} showJoinButton={false} />
                            ))
                        )}
                    </div>
                );

            case 'bookmarked':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarked.length === 0 ? (
                            <div className="col-span-full card text-center">
                                <p className="text-gray-600">You haven't bookmarked any events yet.</p>
                            </div>
                        ) : (
                            bookmarked.map((event) => (
                                <EventCard key={event._id} event={event} showJoinButton={true} />
                            ))
                        )}
                    </div>
                );

            case 'requested':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {requested.length === 0 ? (
                            <div className="col-span-full card text-center">
                                <p className="text-gray-600">You don't have any pending requests.</p>
                            </div>
                        ) : (
                            requested.map((event) => (
                                <div key={event._id} className="card">
                                    <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold mb-3 inline-flex items-center gap-1">
                                        <HiClock />
                                        Pending Approval
                                    </div>
                                    <EventCard event={event} showJoinButton={false} />
                                </div>
                            ))
                        )}
                    </div>
                );

            case 'donations':
                return (
                    <div>
                        {donations.donations.length === 0 ? (
                            <div className="card text-center">
                                <p className="text-gray-600">You haven't made any donations yet.</p>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4">Date</th>
                                                <th className="text-left py-3 px-4">Event</th>
                                                <th className="text-right py-3 px-4">Amount</th>
                                                <th className="text-right py-3 px-4">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {donations.donations.map((donation) => (
                                                <tr key={donation._id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        {new Date(donation.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-3 px-4">{donation.event?.title || 'Unknown Event'}</td>
                                                    <td className="py-3 px-4 text-right font-semibold">
                                                        ${donation.amount}
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <button
                                                            onClick={() => generateReceipt(donation)}
                                                            className="text-primary hover:underline"
                                                        >
                                                            <HiDownload className="inline-block" /> Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-100 font-bold">
                                                <td colSpan="2" className="py-4 px-4 text-right">
                                                    Total Donated:
                                                </td>
                                                <td className="py-4 px-4 text-right text-primary text-xl">
                                                    ${donations.total}
                                                </td>
                                                <td className="py-4 px-4"></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <VolunteerLayout>
            <div>
                <h1 className="text-3xl font-bold mb-6">My Events</h1>

                {/* Tabs */}
                <div className="flex space-x-2 mb-6 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Icon className="text-lg" />
                                {tab.label}
                                <span className={`ml-1 px-2 py-1 rounded-full text-xs ${activeTab === tab.id ? 'bg-white text-primary font-bold' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {renderContent()}
            </div>
        </VolunteerLayout>
    );
};

export default MyEvents;
