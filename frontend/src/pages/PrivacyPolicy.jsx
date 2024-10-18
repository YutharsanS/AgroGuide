import React from 'react';
import './PrivacyPolicy.css';

/**
 * Displays the privacy policy of the AgroBot website.
 * This function renders the privacy policy content including sections 
 * on information collection, usage, sharing, security, and data protection rights.
 * 
 * @returns A React component with the privacy policy content.
 */
function PrivacyPolicy() {
    return (
        <div className="privacy-policy-container">
            <h1>Privacy Policy</h1>
            <p><strong>Effective Date: October 14, 2024</strong></p>

            <h2>1. Introduction</h2>
            <p>Welcome to AgroBot. We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website.</p>

            <h2>2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul>
                <li><strong>Personal Information</strong>: Name, email address, phone number, and other contact details.</li>
                <li><strong>Usage Data</strong>: Information about how you use our website, including your IP address, browser type, and pages visited.</li>
                <li><strong>Cookies</strong>: Small data files stored on your device to enhance your browsing experience.</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>
            <ul>
                <li>To provide and maintain our services.</li>
                <li>To notify you about changes to our services.</li>
                <li>To allow you to participate in interactive features of our website.</li>
                <li>To provide customer support.</li>
                <li>To gather analysis or valuable information to improve our website.</li>
                <li>To monitor the usage of our website.</li>
                <li>To detect, prevent, and address technical issues.</li>
            </ul>

            <h2>4. Sharing Your Information</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to outside parties except as described below:</p>
            <ul>
                <li><strong>Service Providers</strong>: We may share your information with third-party service providers who assist us in operating our website and conducting our business.</li>
                <li><strong>Legal Requirements</strong>: We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            </ul>

            <h2>5. Security of Your Information</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee its absolute security.</p>

            <h2>6. Your Data Protection Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal information:</p>
            <ul>
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
            </ul>

            <h2>7. Changes to This Privacy Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>

            <h2>8. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <ul>
                <li>By email: support@agrobot.com</li>
                <li>By phone number: +1-234-567-890</li>
            </ul>

            <p>Thank you for visiting AgroBot. Your privacy is important to us.</p>
        </div>
    );
}

export default PrivacyPolicy;