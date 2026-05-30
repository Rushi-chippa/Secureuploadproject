import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Google Apps Script Web App URL (bypasses Render's SMTP port blocks)
APPS_SCRIPT_URL = os.getenv("GOOGLE_APPS_SCRIPT_URL", "")

# ---------------------------------------------------------------------------
# HTML Email Templates
# ---------------------------------------------------------------------------

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
    """Sends an OTP email via Google Apps Script Web App (bypasses SMTP firewall)."""

    print("\n" + "="*50)
    print(f"DEBUG: Attempting to send OTP email to: {email}")
    print(f"DEBUG: OTP CODE: {otp}")
    print("="*50 + "\n")

    if not APPS_SCRIPT_URL:
        print("ERROR: GOOGLE_APPS_SCRIPT_URL not set in environment variables.")
        return False

    try:
        payload = {
            "to": email,
            "subject": "Reset your Sales Portal password - Your OTP",
            "body": get_otp_email_template(otp)
        }
        response = requests.post(
            APPS_SCRIPT_URL,
            json=payload,
            timeout=15
        )
        response.raise_for_status()

        result = response.json()
        if result.get("status") == "success":
            print(f"SUCCESS: OTP Email sent successfully via Apps Script to {email}")
            return True
        else:
            print(f"ERROR from Apps Script: {result}")
            return False

    except Exception as e:
        print(f"CRITICAL ERROR: Failed to send OTP email: {str(e)}")
        return False


# ---------------------------------------------------------------------------
# Invoice Email
# ---------------------------------------------------------------------------

def get_invoice_email_template(full_name: str, company_name: str, plan_name: str, amount: str, invoice_no: str, date_str: str):
    """Returns a premium responsive HTML email template for subscription invoices."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
            .header {{ text-align: center; margin-bottom: 25px; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; }}
            .logo {{ font-size: 24px; font-weight: bold; color: #3b82f6; text-decoration: none; }}
            .invoice-badge {{ display: inline-block; padding: 6px 16px; background-color: #d1fae5; color: #065f46; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-top: 10px; text-transform: uppercase; }}
            .details-table {{ width: 100%; border-collapse: collapse; margin: 20px 0; }}
            .details-table th {{ text-align: left; padding: 12px 8px; border-bottom: 2px solid #e2e8f0; color: #475569; font-size: 14px; }}
            .details-table td {{ padding: 12px 8px; border-bottom: 1px solid #f1f5f9; color: #0f172a; font-size: 14px; }}
            .total-row {{ font-weight: bold; background-color: #f8fafc; }}
            .footer {{ font-size: 12px; color: #94a3b8; margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }}
            .button {{ display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2); }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">⚡ SalesPortal</div>
                <h2 style="color: #1e293b; margin: 10px 0 0 0;">Subscription Invoice</h2>
                <div class="invoice-badge">Paid</div>
            </div>
            <p>Dear {full_name},</p>
            <p>Thank you for choosing SalesPortal! Your company <strong>{company_name}</strong> is now officially registered on the <strong>{plan_name}</strong>. Below is your transaction summary and receipt details.</p>
            
            <table class="details-table">
                <tr>
                    <td style="color: #64748b; font-weight: bold;">Invoice Number</td>
                    <td>{invoice_no}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: bold;">Date</td>
                    <td>{date_str}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: bold;">Subscription Tier</td>
                    <td>{plan_name}</td>
                </tr>
                <tr>
                    <td style="color: #64748b; font-weight: bold;">Status</td>
                    <td style="color: #059669; font-weight: bold;">SUCCESS (Auto-Cleared)</td>
                </tr>
            </table>

            <table class="details-table" style="margin-top: 30px;">
                <thead>
                    <tr>
                        <th>Item Description</th>
                        <th style="text-align: right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>SalesPortal '{plan_name}' Subscription (Monthly Recurring)</td>
                        <td style="text-align: right;">{amount}</td>
                    </tr>
                    <tr class="total-row">
                        <td>Total Amount Paid</td>
                        <td style="text-align: right; color: #3b82f6;">{amount}</td>
                    </tr>
                </tbody>
            </table>

            <div style="text-align: center; margin-top: 30px;">
                <a href="https://sales-frontend-vafv.onrender.com/login" class="button" style="color: #ffffff !important;">Access Your Dashboard</a>
            </div>

            <p style="margin-top: 30px; font-size: 13px; color: #64748b;">If you have any questions regarding this invoice or your subscription settings, please reply directly to this email or visit our support desk.</p>
            
            <p>Best regards,<br>The SalesPortal Billing Team</p>
            
            <div class="footer">
                <p>&copy; 2026 SalesPortal Inc. All rights reserved.</p>
                <p>123 Sales Suite, Corporate Ring Road, Bangalore, India</p>
            </div>
        </div>
    </body>
    </html>
    """


def send_welcome_invoice_email(email: str, full_name: str, company_name: str, plan_name: str, amount: str):
    """Sends a professional subscription confirmation HTML invoice via Google Apps Script."""
    import datetime
    import random

    print("\n" + "="*50)
    print(f"DEBUG: Attempting to send welcome invoice to: {email}")
    print(f"DEBUG: PLAN: {plan_name} | AMOUNT: {amount}")
    print("="*50 + "\n")

    if not APPS_SCRIPT_URL:
        print("ERROR: GOOGLE_APPS_SCRIPT_URL not set in environment variables. Invoice email skipped.")
        return False

    try:
        invoice_no = f"INV-2026-{random.randint(10000, 99999)}"
        date_str = datetime.datetime.now().strftime("%B %d, %Y")

        payload = {
            "to": email,
            "subject": f"Invoice for your SalesPortal '{plan_name}' Subscription",
            "body": get_invoice_email_template(full_name, company_name, plan_name, amount, invoice_no, date_str)
        }
        response = requests.post(
            APPS_SCRIPT_URL,
            json=payload,
            timeout=15
        )
        response.raise_for_status()

        result = response.json()
        if result.get("status") == "success":
            print(f"SUCCESS: Invoice Email sent successfully via Apps Script to {email}")
            return True
        else:
            print(f"ERROR from Apps Script: {result}")
            return False

    except Exception as e:
        print(f"CRITICAL ERROR: Failed to send invoice email: {str(e)}")
        return False
