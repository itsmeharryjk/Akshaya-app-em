"""
Production SMS Service for OTP delivery
Replace mock implementation with actual SMS provider
"""
import os
import logging
from typing import Optional
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        
        if all([self.account_sid, self.auth_token, self.phone_number]):
            self.client = Client(self.account_sid, self.auth_token)
            self.is_production = True
        else:
            self.client = None
            self.is_production = False
            logger.warning("SMS service running in development mode - OTPs will be logged")

    async def send_otp(self, phone_number: str, otp: str) -> bool:
        """
        Send OTP via SMS
        In production: Uses Twilio SMS service
        In development: Logs OTP to console
        """
        message = f"Your Akshaya E-Services verification code is: {otp}. Valid for 5 minutes."
        
        if self.is_production and self.client:
            try:
                message = self.client.messages.create(
                    body=message,
                    from_=self.phone_number,
                    to=phone_number
                )
                logger.info(f"SMS sent successfully to {phone_number}, SID: {message.sid}")
                return True
            except TwilioException as e:
                logger.error(f"Failed to send SMS to {phone_number}: {str(e)}")
                return False
        else:
            # Development mode - log OTP
            logger.info(f"🔐 DEVELOPMENT MODE - OTP for {phone_number}: {otp}")
            print(f"🔐 OTP for {phone_number}: {otp}")
            return True

    def get_status(self) -> dict:
        """Get SMS service status"""
        return {
            "service": "SMS",
            "provider": "Twilio" if self.is_production else "Development",
            "status": "configured" if self.is_production else "development_mode",
            "phone_configured": bool(self.phone_number)
        }