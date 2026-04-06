import os
import requests
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY")

def get_reset_email_template(reset_link: str):
    """Returns a professional HTML email template for password reset."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; }}
            .header {{ text-align: center; margin-bottom: 30px; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }}
            .footer {{ font-size: 12px; color: #64748b; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="color: #1e293b;">Password Reset Request</h1>
            </div>
            <p>Hello,</p>
            <p>You recently requested to reset your password for your Sales Portal account. Click the button below to proceed:</p>
            <div style="text-align: center;">
                <a href="{reset_link}" class="button">Reset Password</a>
            </div>
            <p>This link will expire in 30 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>Best regards,<br>The Sales Portal Team</p>
            <div class="footer">
                <p>&copy; 2026 Sales Portal. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_reset_password_email(email: str, token: str):
    """Sends a real HTML email using the Resend API."""
    reset_link = f"http://localhost:3000/reset-password?token={token}"
    
    # 1. Always print to console as a backup/for debugging
    print("\n" + "="*50)
    print(f"DEBUG: Attempting to send Resend email to: {email}")
    print(f"DEBUG: RESET LINK: {reset_link}")
    print("="*50 + "\n")

    if not RESEND_API_KEY:
        print("ERROR: RESEND_API_KEY not found in environment variables.")
        return False

    # 2. Send via Resend API
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": "Sales Portal <onboarding@resend.dev>", # Default sandbox domain
                "to": email,
                "subject": "Reset your Sales Portal password",
                "html": get_reset_email_template(reset_link),
            },
            timeout=10
        )
        
        if response.status_code == 200 or response.status_code == 201:
            print(f"SUCCESS: Email sent successfully via Resend to {email}")
            return True
        else:
            print(f"ERROR: Resend API failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"CRITICAL ERROR: Failed to send email via Resend: {str(e)}")
        return False
