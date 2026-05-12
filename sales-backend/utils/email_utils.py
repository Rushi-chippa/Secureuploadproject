import os
import requests
from dotenv import load_dotenv

load_dotenv()

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

def get_otp_email_template(otp: str):
    """Returns a professional HTML email template for password reset via OTP."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .otp-box {{ display: inline-block; padding: 15px 30px; background-color: #f1f5f9; color: #0f172a; border: 2px dashed #4f46e5; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; }}
            .footer {{ font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #1e293b;">Password Reset OTP</h1>
            </div>
            <p>Hello,</p>
            <p>You recently requested to reset your password for your Sales Portal account. Please use the following One-Time Password (OTP) to proceed:</p>
            <div style="text-align: center;">
                <div class="otp-box">{otp}</div>
            </div>
            <p>This code will expire in 10 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The Sales Portal Team</p>
            <div class="footer">
                <p>&copy; 2026 Sales Portal. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_reset_password_email(email: str, otp: str):
    """Sends a real HTML email using Gmail SMTP."""
    
    print("\n" + "="*50)
    print(f"DEBUG: Attempting to send OTP email to: {email}")
    print(f"DEBUG: OTP CODE: {otp}")
    print("="*50 + "\n")

    if not EMAIL_USER or not EMAIL_PASSWORD:
        print("ERROR: EMAIL_USER or EMAIL_PASSWORD not found in environment variables.")
        return False

    try:
        # Set up the MIME message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = "Reset your Sales Portal password - Your OTP"
        msg['From'] = f"Sales Portal <{EMAIL_USER}>"
        msg['To'] = email

        # Create the HTML content
        html_content = get_otp_email_template(otp)
        part = MIMEText(html_content, 'html')
        msg.attach(part)

        # Connect to Gmail SMTP Server and Send
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        server.sendmail(EMAIL_USER, email, msg.as_string())
        server.quit()
        
        print(f"SUCCESS: OTP Email sent successfully via Gmail to {email}")
        return True
            
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to send email via Gmail: {str(e)}")
        return False

