import React, { useState, useEffect } from 'react';
import OrganizerLayout from '../components/OrganizerLayout';
import axios from 'axios';
import { getApiBase } from '../utils/api';
import Swal from 'sweetalert2';
import { auth } from '../firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

const VolunteerStats = () => {
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [topVolunteer, setTopVolunteer] = useState(null);

    useEffect(() => {
        fetchVolunteerStats();
    }, []);

    const fetchVolunteerStats = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/organizer/volunteer-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setVolunteers(response.data);
            if (response.data.length > 0) {
                setTopVolunteer(response.data[0]); // First one is highest score
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching volunteer stats:', error);
            setLoading(false);
        }
    };

    const generateCertificate = async (volunteerId) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const token = await user.getIdToken();
            const response = await axios.get(`${getApiBase()}/api/organizer/certificate/${volunteerId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const certData = response.data;

            // Create PDF
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // Colors
            const primaryColor = [59, 130, 246]; // Blue
            const secondaryColor = [212, 175, 55]; // Gold
            const textColor = [60, 60, 60]; // Dark Gray

            // Background
            doc.setFillColor(255, 255, 255);
            doc.rect(0, 0, 297, 210, 'F');

            // Ornamental Border
            doc.setDrawColor(...secondaryColor);
            doc.setLineWidth(1);
            doc.rect(10, 10, 277, 190); // Outer Gold
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.rect(12, 12, 273, 186); // Inner Blue

            // Corner Decorations
            doc.setDrawColor(...secondaryColor);
            doc.setLineWidth(3);
            doc.line(10, 10, 40, 10); // Top Left
            doc.line(10, 10, 10, 40);
            doc.line(287, 10, 257, 10); // Top Right
            doc.line(287, 10, 287, 40);
            doc.line(10, 200, 40, 200); // Bottom Left
            doc.line(10, 200, 10, 170);
            doc.line(287, 200, 257, 200); // Bottom Right
            doc.line(287, 200, 287, 170);

            // Header - Organization Name
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(24);
            doc.setTextColor(...primaryColor);
            doc.text('VOLUNTEERVERSE', 148.5, 30, { align: 'center' });

            // Certificate Title
            doc.setFont('times', 'bolditalic');
            doc.setFontSize(48);
            doc.setTextColor(...secondaryColor);
            doc.text('Certificate of Excellence', 148.5, 55, { align: 'center' });

            // Presentation Text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(14);
            doc.setTextColor(...textColor);
            doc.text('This certificate is proudly presented to', 148.5, 75, { align: 'center' });

            // Volunteer Name
            doc.setFont('times', 'bolditalic');
            doc.setFontSize(36);
            doc.setTextColor(0, 0, 0);
            doc.text(certData.volunteerName, 148.5, 95, { align: 'center' });

            // Decorative line under name
            doc.setDrawColor(...secondaryColor);
            doc.setLineWidth(0.5);
            doc.line(80, 100, 217, 100);

            // Achievement Text
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(16);
            doc.setTextColor(...textColor);
            doc.text(`In recognition of their outstanding contribution and dedication`, 148.5, 115, { align: 'center' });
            doc.text(`as a valued member of our community.`, 148.5, 123, { align: 'center' });

            // Stats
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Total Score: ${certData.score} | Events Completed: ${certData.eventsCompleted}`, 148.5, 135, { align: 'center' });

            // Signatures Section
            const signatureY = 170;

            // Organizer Signature - Load and add image
            try {
                // Load signature image from public folder
                const signatureImg = new Image();
                signatureImg.src = '/signature.png';

                // Wait for image to load, then add to PDF
                await new Promise((resolve, reject) => {
                    signatureImg.onload = () => {
                        // Add signature image (adjust dimensions as needed)
                        doc.addImage(signatureImg, 'PNG', 45, signatureY - 15, 50, 15);
                        resolve();
                    };
                    signatureImg.onerror = () => {
                        console.warn('Could not load signature image, using text fallback');
                        // Fallback to text signature
                        doc.setFont('times', 'italic');
                        doc.setFontSize(18);
                        doc.setTextColor(0, 0, 0);
                        doc.text('Nafeej Tamjeed Ahmed', 70, signatureY, { align: 'center' });
                        resolve();
                    };
                });
            } catch (error) {
                console.error('Error loading signature:', error);
                // Fallback to text signature
                doc.setFont('times', 'italic');
                doc.setFontSize(18);
                doc.setTextColor(0, 0, 0);
                doc.text('Nafeej Tamjeed Ahmed', 70, signatureY, { align: 'center' });
            }

            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.5);
            doc.line(40, signatureY + 2, 100, signatureY + 2); // Line

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            doc.text('NAFEEJ TAMJEED AHMED', 70, signatureY + 8, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.text('Founder & Owner', 70, signatureY + 13, { align: 'center' });

            // Date
            doc.setFont('times', 'italic');
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text(certData.date, 227, signatureY, { align: 'center' });

            doc.line(197, signatureY + 2, 257, signatureY + 2); // Line

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(...textColor);
            doc.text('DATE', 227, signatureY + 8, { align: 'center' });

            // Certificate ID
            doc.setFont('courier', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Certificate ID: ${certData.certificateId || 'N/A'}`, 148.5, 195, { align: 'center' });

            // Save PDF
            doc.save(`Certificate_${certData.volunteerName.replace(/\s+/g, '_')}.pdf`);

            Swal.fire('Success', 'Certificate downloaded!', 'success');
        } catch (error) {
            console.error('Certificate Error:', error);
            Swal.fire('Error', error.response?.data?.message || 'Failed to generate certificate', 'error');
        }
    };

    if (loading) {
        return (
            <OrganizerLayout>
                <div className="flex justify-center items-center h-screen">Loading...</div>
            </OrganizerLayout>
        );
    }

    // Prepare data for chart (top 10 volunteers)
    const chartData = volunteers.slice(0, 10).map(v => ({
        name: v.username || v.displayName || v.email.split('@')[0],
        score: v.score || 0,
        events: v.joinedEvents?.length || 0
    }));

    return (
        <OrganizerLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Volunteer Statistics</h1>

                {volunteers.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No volunteer data available yet</p>
                    </div>
                ) : (
                    <>
                        {/* Top Volunteer Card */}
                        {topVolunteer && (
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold mb-2">🏆 Top Volunteer</h2>
                                        <p className="text-3xl font-bold mb-2">
                                            {topVolunteer.username || topVolunteer.displayName || topVolunteer.email}
                                        </p>
                                        <p className="text-lg opacity-90">
                                            Score: {topVolunteer.score || 0} points • Events: {topVolunteer.joinedEvents?.length || 0}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => generateCertificate(topVolunteer._id)}
                                        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                    >
                                        Generate Certificate
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Score Chart */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">Volunteer Performance Chart</h2>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" fill="#3b82f6" name="Score" />
                                    <Bar dataKey="events" fill="#8b5cf6" name="Events Completed" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Volunteer List */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 text-gray-800">All Volunteers</h2>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rank
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Username
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Score
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Events
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {volunteers.map((volunteer, index) => (
                                            <tr key={volunteer._id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {index === 0 && '🥇'}
                                                    {index === 1 && '🥈'}
                                                    {index === 2 && '🥉'}
                                                    {index > 2 && `#${index + 1}`}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {volunteer.username || volunteer.displayName || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {volunteer.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {volunteer.score || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {volunteer.joinedEvents?.length || 0}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button
                                                        onClick={() => generateCertificate(volunteer._id)}
                                                        className="text-blue-600 hover:text-blue-900 font-medium"
                                                    >
                                                        Generate Certificate
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </OrganizerLayout>
    );
};

export default VolunteerStats;
