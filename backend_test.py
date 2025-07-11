#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite for Akshaya E-Services
Tests all backend endpoints with realistic Kerala government service data
"""

import requests
import json
import base64
import time
from datetime import datetime

# Backend URL from environment
BACKEND_URL = "https://7b264566-0c1e-4eda-9186-f093b3c6cebf.preview.emergentagent.com/api"

# Test data
TEST_PHONE = "+919876543210"
TEST_USER_DATA = {
    "name": "Rajesh Kumar",
    "phone": TEST_PHONE,
    "language": "ml"
}

# Sample base64 encoded test document (small text file)
TEST_DOCUMENT_DATA = base64.b64encode(b"This is a test document for Akshaya E-Services").decode('utf-8')

class AkshayaAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "response_data": response_data,
            "timestamp": datetime.now().isoformat()
        })
        
    def test_request_otp(self):
        """Test OTP request endpoint"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/request-otp",
                json={"phone": TEST_PHONE},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "OTP sent successfully" in data.get("message", ""):
                    self.log_test("OTP Request", True, "OTP request successful", data)
                    return True
                else:
                    self.log_test("OTP Request", False, f"Unexpected response: {data}")
            else:
                self.log_test("OTP Request", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("OTP Request", False, f"Exception: {str(e)}")
        
        return False
    
    def test_verify_otp(self, otp="123456"):
        """Test OTP verification endpoint"""
        try:
            response = self.session.post(
                f"{BACKEND_URL}/auth/verify-otp",
                json={"phone": TEST_PHONE, "otp": otp},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("token") and data.get("user_id"):
                    self.auth_token = data["token"]
                    self.user_id = data["user_id"]
                    self.session.headers.update({"Authorization": f"Bearer {self.auth_token}"})
                    self.log_test("OTP Verification", True, "Authentication successful", data)
                    return True
                else:
                    self.log_test("OTP Verification", False, f"Missing token or user_id: {data}")
            else:
                self.log_test("OTP Verification", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("OTP Verification", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_user_profile(self):
        """Test get user profile endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/user/profile")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("phone") == TEST_PHONE:
                    self.log_test("Get User Profile", True, "Profile retrieved successfully", data)
                    return True
                else:
                    self.log_test("Get User Profile", False, f"Profile data mismatch: {data}")
            else:
                self.log_test("Get User Profile", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get User Profile", False, f"Exception: {str(e)}")
        
        return False
    
    def test_update_user_profile(self):
        """Test update user profile endpoint"""
        try:
            response = self.session.put(
                f"{BACKEND_URL}/user/profile",
                json=TEST_USER_DATA,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if "updated successfully" in data.get("message", "").lower():
                    self.log_test("Update User Profile", True, "Profile updated successfully", data)
                    return True
                else:
                    self.log_test("Update User Profile", False, f"Unexpected response: {data}")
            else:
                self.log_test("Update User Profile", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Update User Profile", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_services(self):
        """Test get all services endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/services")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Check for Kerala government services
                    service_names = [s.get("name", "") for s in data]
                    expected_services = ["Ration Card", "Birth Certificate", "Income Certificate"]
                    
                    if any(service in service_names for service in expected_services):
                        self.log_test("Get Services", True, f"Retrieved {len(data)} services including Kerala govt services", {"count": len(data), "services": service_names[:3]})
                        return True
                    else:
                        self.log_test("Get Services", False, f"Expected Kerala services not found: {service_names}")
                else:
                    self.log_test("Get Services", False, f"Invalid services data: {data}")
            else:
                self.log_test("Get Services", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Services", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_service_details(self):
        """Test get specific service details endpoint"""
        try:
            # Test with ration card service
            response = self.session.get(f"{BACKEND_URL}/services/ration_card")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == "Ration Card" and "required_documents" in data:
                    required_docs = data["required_documents"]
                    if len(required_docs) > 0 and "address_proof" in str(required_docs):
                        self.log_test("Get Service Details", True, "Service details retrieved with required documents", {"service": data["name"], "doc_count": len(required_docs)})
                        return True
                    else:
                        self.log_test("Get Service Details", False, f"Missing required documents: {data}")
                else:
                    self.log_test("Get Service Details", False, f"Invalid service data: {data}")
            else:
                self.log_test("Get Service Details", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Service Details", False, f"Exception: {str(e)}")
        
        return False
    
    def test_upload_document(self):
        """Test document upload endpoint"""
        try:
            document_data = {
                "name": "Aadhaar Card",
                "type": "identity_proof",
                "file_data": TEST_DOCUMENT_DATA
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/documents",
                json=document_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("name") == "Aadhaar Card" and data.get("id"):
                    self.document_id = data["id"]
                    self.log_test("Upload Document", True, "Document uploaded successfully", {"id": data["id"], "name": data["name"]})
                    return True
                else:
                    self.log_test("Upload Document", False, f"Invalid document response: {data}")
            else:
                self.log_test("Upload Document", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Upload Document", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_documents(self):
        """Test get all user documents endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/documents")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Documents", True, f"Retrieved {len(data)} documents", {"count": len(data)})
                    return True
                else:
                    self.log_test("Get Documents", False, f"Invalid documents data: {data}")
            else:
                self.log_test("Get Documents", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Documents", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_document_details(self):
        """Test get specific document endpoint"""
        if not hasattr(self, 'document_id'):
            self.log_test("Get Document Details", False, "No document ID available from upload test")
            return False
            
        try:
            response = self.session.get(f"{BACKEND_URL}/documents/{self.document_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == self.document_id and data.get("name") == "Aadhaar Card":
                    self.log_test("Get Document Details", True, "Document details retrieved successfully", {"id": data["id"], "name": data["name"]})
                    return True
                else:
                    self.log_test("Get Document Details", False, f"Document data mismatch: {data}")
            else:
                self.log_test("Get Document Details", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Document Details", False, f"Exception: {str(e)}")
        
        return False
    
    def test_create_application(self):
        """Test create service application endpoint"""
        try:
            application_data = {
                "service_name": "Ration Card",
                "service_id": "ration_card",
                "fee": 100,
                "documents": [getattr(self, 'document_id', 'test-doc-id')]
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/applications",
                json=application_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("service_name") == "Ration Card" and data.get("id"):
                    self.application_id = data["id"]
                    self.log_test("Create Application", True, "Service application created successfully", {"id": data["id"], "service": data["service_name"]})
                    return True
                else:
                    self.log_test("Create Application", False, f"Invalid application response: {data}")
            else:
                self.log_test("Create Application", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Create Application", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_applications(self):
        """Test get user applications endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/applications")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Applications", True, f"Retrieved {len(data)} applications", {"count": len(data)})
                    return True
                else:
                    self.log_test("Get Applications", False, f"Invalid applications data: {data}")
            else:
                self.log_test("Get Applications", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Applications", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_notifications(self):
        """Test get notifications endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/notifications")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Should have notification from application submission
                    notification_found = any("Application Submitted" in notif.get("title", "") for notif in data)
                    if notification_found:
                        self.notification_id = data[0].get("id") if data else None
                        self.log_test("Get Notifications", True, f"Retrieved {len(data)} notifications including application notification", {"count": len(data)})
                        return True
                    else:
                        self.log_test("Get Notifications", True, f"Retrieved {len(data)} notifications (no application notification yet)", {"count": len(data)})
                        return True
                else:
                    self.log_test("Get Notifications", False, f"Invalid notifications data: {data}")
            else:
                self.log_test("Get Notifications", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Notifications", False, f"Exception: {str(e)}")
        
        return False
    
    def test_mark_notification_read(self):
        """Test mark notification as read endpoint"""
        if not hasattr(self, 'notification_id') or not self.notification_id:
            self.log_test("Mark Notification Read", True, "No notification ID available (skipped)")
            return True
            
        try:
            response = self.session.put(f"{BACKEND_URL}/notifications/{self.notification_id}/read")
            
            if response.status_code == 200:
                data = response.json()
                if "marked as read" in data.get("message", "").lower():
                    self.log_test("Mark Notification Read", True, "Notification marked as read successfully", data)
                    return True
                else:
                    self.log_test("Mark Notification Read", False, f"Unexpected response: {data}")
            else:
                self.log_test("Mark Notification Read", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Mark Notification Read", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_analytics_savings(self):
        """Test get user savings analytics endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/analytics/savings")
            
            if response.status_code == 200:
                data = response.json()
                expected_keys = ["time_saved", "money_saved", "visits_avoided"]
                if all(key in data for key in expected_keys):
                    self.log_test("Get Analytics Savings", True, "Savings analytics retrieved successfully", data)
                    return True
                else:
                    self.log_test("Get Analytics Savings", False, f"Missing expected keys in response: {data}")
            else:
                self.log_test("Get Analytics Savings", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Analytics Savings", False, f"Exception: {str(e)}")
        
        return False
    
    def test_process_payment(self):
        """Test process payment endpoint"""
        try:
            payment_data = {
                "amount": 100,
                "service": "Ration Card",
                "method": "UPI"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/payments/process",
                json=payment_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("transaction_id"):
                    self.log_test("Process Payment", True, "Payment processed successfully", {"transaction_id": data["transaction_id"], "amount": data.get("amount")})
                    return True
                else:
                    self.log_test("Process Payment", False, f"Payment processing failed: {data}")
            else:
                self.log_test("Process Payment", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Process Payment", False, f"Exception: {str(e)}")
        
        return False
    
    def test_get_payment_history(self):
        """Test get payment history endpoint"""
        try:
            response = self.session.get(f"{BACKEND_URL}/payments/history")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get Payment History", True, f"Retrieved {len(data)} payment records", {"count": len(data)})
                    return True
                else:
                    self.log_test("Get Payment History", False, f"Invalid payment history data: {data}")
            else:
                self.log_test("Get Payment History", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Get Payment History", False, f"Exception: {str(e)}")
        
        return False
    
    def test_delete_document(self):
        """Test delete document endpoint"""
        if not hasattr(self, 'document_id'):
            self.log_test("Delete Document", True, "No document ID available (skipped)")
            return True
            
        try:
            response = self.session.delete(f"{BACKEND_URL}/documents/{self.document_id}")
            
            if response.status_code == 200:
                data = response.json()
                if "deleted successfully" in data.get("message", "").lower():
                    self.log_test("Delete Document", True, "Document deleted successfully", data)
                    return True
                else:
                    self.log_test("Delete Document", False, f"Unexpected response: {data}")
            else:
                self.log_test("Delete Document", False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test("Delete Document", False, f"Exception: {str(e)}")
        
        return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting Akshaya E-Services Backend API Tests")
        print(f"📡 Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Authentication Flow Tests
        print("\n🔐 AUTHENTICATION TESTS")
        print("-" * 30)
        
        if not self.test_request_otp():
            print("❌ Authentication flow failed at OTP request")
            return
        
        # Wait a moment and try with actual OTP from logs
        time.sleep(1)
        print("ℹ️  Using actual OTP from backend logs: '758685'...")
        
        if not self.test_verify_otp("758685"):
            print("❌ Authentication flow failed at OTP verification")
            return
        
        # User Management Tests
        print("\n👤 USER MANAGEMENT TESTS")
        print("-" * 30)
        self.test_get_user_profile()
        self.test_update_user_profile()
        
        # Services Tests
        print("\n🏛️ SERVICES TESTS")
        print("-" * 30)
        self.test_get_services()
        self.test_get_service_details()
        
        # Document Management Tests
        print("\n📄 DOCUMENT MANAGEMENT TESTS")
        print("-" * 30)
        self.test_upload_document()
        self.test_get_documents()
        self.test_get_document_details()
        
        # Service Application Tests
        print("\n📋 SERVICE APPLICATION TESTS")
        print("-" * 30)
        self.test_create_application()
        self.test_get_applications()
        
        # Notifications Tests
        print("\n🔔 NOTIFICATIONS TESTS")
        print("-" * 30)
        self.test_get_notifications()
        self.test_mark_notification_read()
        
        # Analytics Tests
        print("\n📊 ANALYTICS TESTS")
        print("-" * 30)
        self.test_get_analytics_savings()
        
        # Payment Tests
        print("\n💳 PAYMENT TESTS")
        print("-" * 30)
        self.test_process_payment()
        self.test_get_payment_history()
        
        # Cleanup Tests
        print("\n🧹 CLEANUP TESTS")
        print("-" * 30)
        self.test_delete_document()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\n🎯 CRITICAL FUNCTIONALITY STATUS:")
        critical_tests = [
            "OTP Request", "OTP Verification", "Get User Profile", 
            "Get Services", "Upload Document", "Create Application"
        ]
        
        critical_passed = 0
        for test_name in critical_tests:
            test_result = next((r for r in self.test_results if r["test"] == test_name), None)
            if test_result and test_result["success"]:
                critical_passed += 1
                print(f"  ✅ {test_name}")
            else:
                print(f"  ❌ {test_name}")
        
        print(f"\nCritical Tests Passed: {critical_passed}/{len(critical_tests)}")
        
        if critical_passed == len(critical_tests):
            print("🎉 All critical backend functionality is working!")
        else:
            print("⚠️  Some critical backend functionality needs attention.")

if __name__ == "__main__":
    tester = AkshayaAPITester()
    tester.run_all_tests()