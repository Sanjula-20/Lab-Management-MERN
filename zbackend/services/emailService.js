const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        // Determine which email configuration to use
        const emailUser = process.env.NEW_GMAIL_USER || process.env.GMAIL_USER;
        const emailPass = process.env.NEW_GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
        
        console.log(`📧 Initializing email service with: ${emailUser}`);
        
        // Initialize the transporter with Gmail configuration
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: emailUser,
                pass: emailPass
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        this.fromEmail = emailUser;
    }

    // Generate a random 6-digit OTP
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Send OTP email
    async sendOTP(email, otp, purpose = 'verification') {
        try {
            const mailOptions = {
                from: this.fromEmail,
                to: email,
                subject: `${this.getSubjectByPurpose(purpose)} - Laboratory Management System`,
                html: this.getOTPEmailTemplate(otp, purpose)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ OTP email sent successfully from ${this.fromEmail} to ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending OTP email:', error);
            throw new Error('Failed to send OTP email');
        }
    }

    // Send welcome email after registration
    async sendWelcomeEmail(email, name) {
        try {
            const mailOptions = {
                from: this.fromEmail,
                to: email,
                subject: 'Welcome to Laboratory Management System',
                html: this.getWelcomeEmailTemplate(name)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Welcome email sent successfully to ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending welcome email:', error);
            // Don't throw error for welcome email failure
            return { success: false, error: error.message };
        }
    }

    // Send password reset email
    async sendPasswordResetEmail(email, resetToken, name) {
        try {
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
            
            const mailOptions = {
                from: process.env.GMAIL_USER,
                to: email,
                subject: 'Password Reset - Laboratory Management System',
                html: this.getPasswordResetEmailTemplate(name, resetUrl)
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent successfully to ${email}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }

    // Get subject by purpose
    getSubjectByPurpose(purpose) {
        switch (purpose) {
            case 'registration':
                return 'Email Verification Code';
            case 'login':
                return 'Login Verification Code';
            case 'password-reset':
                return 'Password Reset Code';
            default:
                return 'Verification Code';
        }
    }

    // OTP email template
    getOTPEmailTemplate(otp, purpose) {
        const purposeText = this.getPurposeText(purpose);
        
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>OTP Verification</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #3b82f6;">
                    <h1 style="color: #3b82f6; margin: 0; font-size: 24px;">🧪 Laboratory Management System</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px 0; text-align: center;">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Verification Code</h2>
                    <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        ${purposeText}
                    </p>
                    
                    <!-- OTP Code -->
                    <div style="background-color: #f8fafc; border: 2px dashed #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 5px; font-family: monospace;">
                            ${otp}
                        </div>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
                        ⚠️ This code will expire in 10 minutes
                    </p>
                </div>
                
                <!-- Security Note -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        <strong>Security Notice:</strong> Never share this code with anyone. Our team will never ask for this code.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                    <p>This is an automated message from Laboratory Management System</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                </div>
                
            </div>
        </body>
        </html>
        `;
    }

    // Welcome email template
    getWelcomeEmailTemplate(name) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #10b981;">
                    <h1 style="color: #10b981; margin: 0; font-size: 24px;">🧪 Laboratory Management System</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px 0; text-align: center;">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome, ${name}! 🎉</h2>
                    <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        Thank you for joining the Laboratory Management System. Your account has been successfully created and verified.
                    </p>
                    
                    <!-- Features -->
                    <div style="text-align: left; margin: 20px 0;">
                        <h3 style="color: #1f2937; margin-bottom: 15px;">What you can do:</h3>
                        <ul style="color: #6b7280; line-height: 1.8;">
                            <li>📋 Manage laboratory equipment and bookings</li>
                            <li>📊 View reports and analytics</li>
                            <li>👥 Collaborate with team members</li>
                            <li>📱 Access from any device</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Get Started
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                    <p>Welcome to the Laboratory Management System!</p>
                    <p>If you have any questions, feel free to contact our support team.</p>
                </div>
                
            </div>
        </body>
        </html>
        `;
    }

    // Password reset email template
    getPasswordResetEmailTemplate(name, resetUrl) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; margin-top: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                
                <!-- Header -->
                <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #ef4444;">
                    <h1 style="color: #ef4444; margin: 0; font-size: 24px;">🧪 Laboratory Management System</h1>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px 0; text-align: center;">
                    <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
                    <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
                        Hello ${name}, <br><br>
                        We received a request to reset your password. Click the button below to create a new password.
                    </p>
                    
                    <div style="margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
                        ⚠️ This link will expire in 1 hour
                    </p>
                </div>
                
                <!-- Security Note -->
                <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                    <p style="color: #92400e; margin: 0; font-size: 14px;">
                        <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email.
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                    <p>This is an automated message from Laboratory Management System</p>
                </div>
                
            </div>
        </body>
        </html>
        `;
    }

    // Get purpose text for OTP emails
    getPurposeText(purpose) {
        switch (purpose) {
            case 'registration':
                return 'Please use the following code to verify your email address and complete your registration:';
            case 'login':
                return 'Please use the following code to securely log in to your account:';
            case 'password-reset':
                return 'Please use the following code to reset your password:';
            default:
                return 'Please use the following verification code:';
        }
    }

    // Test email configuration
    async testConnection() {
        try {
            if (!this.fromEmail) {
                return { success: false, message: 'Email user/password not configured in environment variables' };
            }
            await this.transporter.verify();
            console.log('✅ Email service is ready and verified');
            return { success: true, message: 'SMTP connection verified successfully' };
        } catch (error) {
            console.warn('⚠️ Email service configuration notice:', error.message);
            return { success: false, message: error.message };
        }
    }

    // Send a test email to verify credentials
    async sendTestEmail(targetEmail) {
        try {
            if (!this.fromEmail) {
                return { success: false, message: 'SMTP credentials (GMAIL_USER / GMAIL_APP_PASSWORD) not configured' };
            }
            const mailOptions = {
                from: this.fromEmail,
                to: targetEmail,
                subject: '🧪 Laboratory Management System - Email Configuration Test',
                html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h2 style="color: #2563eb;">🧪 Email Configuration Successful</h2>
                    <p>This is a test notification from the Laboratory Management System.</p>
                    <p style="color: #4b5563;">Timestamp: ${new Date().toISOString()}</p>
                    <p style="color: #16a34a; font-weight: bold;">✅ SMTP service is actively communicating.</p>
                </div>
                `
            };
            const result = await this.transporter.sendMail(mailOptions);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.warn('⚠️ Failed to send test email:', error.message);
            return { success: false, message: error.message };
        }
    }

    // Automated Notification: Incident Workflow
    async sendIncidentNotification({ to, recipientName, incident, action, actorName, notes }) {
        if (!to) return { success: false, reason: 'No recipient email provided' };
        try {
            let actionTitle = 'Incident Update';
            let actionBadge = '#3b82f6';
            if (action === 'reported') { actionTitle = 'New Incident Reported'; actionBadge = '#ef4444'; }
            else if (action === 'assigned') { actionTitle = 'Incident Assigned to You'; actionBadge = '#f59e0b'; }
            else if (action === 'resolved') { actionTitle = 'Incident Resolved'; actionBadge = '#10b981'; }
            else if (action === 'status_changed') { actionTitle = `Incident Status Changed to ${incident?.status}`; actionBadge = '#6366f1'; }

            const mailOptions = {
                from: this.fromEmail || 'no-reply@labms.local',
                to,
                subject: `[Incident #${incident?.id}] ${actionTitle} - ${incident?.title || ''}`,
                html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 24px; margin: 0;">
                    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="background-color: ${actionBadge}; padding: 18px 24px; color: white;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">🧪 ${actionTitle}</h2>
                            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Lab Management System Notification</p>
                        </div>
                        <div style="padding: 24px;">
                            <p style="color: #374151; font-size: 15px; margin-top: 0;">Hello ${recipientName || 'User'},</p>
                            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                                An incident record has been updated by <strong>${actorName || 'System'}</strong>.
                            </p>
                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr><td style="padding: 4px 0; color: #6b7280; width: 130px;">Incident ID:</td><td style="font-weight: 600; color: #111827;">#${incident?.id}</td></tr>
                                    <tr><td style="padding: 4px 0; color: #6b7280;">Title:</td><td style="font-weight: 600; color: #111827;">${incident?.title || 'N/A'}</td></tr>
                                    <tr><td style="padding: 4px 0; color: #6b7280;">Priority:</td><td style="font-weight: 600; text-transform: uppercase; color: ${incident?.priority === 'critical' ? '#dc2626' : '#2563eb'};">${incident?.priority || 'N/A'}</td></tr>
                                    <tr><td style="padding: 4px 0; color: #6b7280;">Current Status:</td><td style="font-weight: 600; text-transform: capitalize; color: #111827;">${incident?.status || 'N/A'}</td></tr>
                                    ${incident?.relatedEquipment?.name ? `<tr><td style="padding: 4px 0; color: #6b7280;">Equipment:</td><td style="font-weight: 600; color: #111827;">${incident.relatedEquipment.name} (${incident.relatedEquipment.serial_number || 'N/A'})</td></tr>` : ''}
                                    ${notes ? `<tr><td style="padding: 4px 0; color: #6b7280;">Notes:</td><td style="color: #111827;">${notes}</td></tr>` : ''}
                                </table>
                            </div>
                            <div style="text-align: center; margin-top: 24px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/incidents" style="background-color: #1e293b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
                                    View Incident in LabMS
                                </a>
                            </div>
                        </div>
                        <div style="background-color: #f9fafb; padding: 12px 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 11px;">
                            Automated message. Please do not reply directly to this email.
                        </div>
                    </div>
                </body>
                </html>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Incident email sent to ${to} [Action: ${action}]`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.warn(`⚠️ Incident email notification failed to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // Automated Notification: Booking Workflow
    async sendBookingNotification({ to, recipientName, booking, action, reason }) {
        if (!to) return { success: false, reason: 'No recipient email provided' };
        try {
            let actionTitle = 'Booking Status Update';
            let actionBadge = '#3b82f6';
            if (action === 'created') { actionTitle = 'New Booking Request'; actionBadge = '#3b82f6'; }
            else if (action === 'approved') { actionTitle = 'Booking Approved ✅'; actionBadge = '#10b981'; }
            else if (action === 'rejected') { actionTitle = 'Booking Rejected ❌'; actionBadge = '#ef4444'; }
            else if (action === 'cancelled') { actionTitle = 'Booking Cancelled'; actionBadge = '#6b7280'; }

            const mailOptions = {
                from: this.fromEmail || 'no-reply@labms.local',
                to,
                subject: `[Booking #${booking?.id}] ${actionTitle}`,
                html: `
                <!DOCTYPE html>
                <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; padding: 24px; margin: 0;">
                    <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="background-color: ${actionBadge}; padding: 18px 24px; color: white;">
                            <h2 style="margin: 0; font-size: 20px; font-weight: 600;">📅 ${actionTitle}</h2>
                            <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Lab Management System</p>
                        </div>
                        <div style="padding: 24px;">
                            <p style="color: #374151; font-size: 15px; margin-top: 0;">Hello ${recipientName || 'User'},</p>
                            <p style="color: #4b5563; font-size: 14px; line-height: 1.5;">
                                Your booking request has been updated.
                            </p>
                            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 13px;">
                                <table style="width: 100%; border-collapse: collapse;">
                                    <tr><td style="padding: 4px 0; color: #6b7280; width: 130px;">Booking ID:</td><td style="font-weight: 600; color: #111827;">#${booking?.id}</td></tr>
                                    <tr><td style="padding: 4px 0; color: #6b7280;">Type:</td><td style="font-weight: 600; text-transform: capitalize; color: #111827;">${booking?.booking_type || 'Lab/Equipment'}</td></tr>
                                    <tr><td style="padding: 4px 0; color: #6b7280;">Start Time:</td><td style="color: #111827;">${booking?.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A'}</td></tr>
                                    <tr><td style="padding: 4px 0; color: #6b7280;">End Time:</td><td style="color: #111827;">${booking?.end_time ? new Date(booking.end_time).toLocaleString() : 'N/A'}</td></tr>
                                    ${reason ? `<tr><td style="padding: 4px 0; color: #6b7280;">Reason / Remark:</td><td style="color: #dc2626;">${reason}</td></tr>` : ''}
                                </table>
                            </div>
                            <div style="text-align: center; margin-top: 24px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/bookings" style="background-color: #1e293b; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; display: inline-block;">
                                    View Bookings
                                </a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                `
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Booking notification email sent to ${to}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.warn(`⚠️ Booking email notification failed to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();