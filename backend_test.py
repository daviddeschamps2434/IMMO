import requests
import sys
from datetime import datetime
import json

class BSKImmobilierAPITester:
    def __init__(self, base_url="https://lauzerte-immo.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": None,
                "error": None
            }

            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    result["response_data"] = response.json()
                except:
                    result["response_data"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text

            self.test_results.append(result)
            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            result = {
                "test_name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": None,
                "success": False,
                "response_data": None,
                "error": str(e)
            }
            self.test_results.append(result)
            return False, None

    def test_api_root(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_create_lead_valid(self):
        """Test creating a valid lead"""
        lead_data = {
            "nom": "Jean Dupont",
            "email": "jean.dupont@example.com",
            "telephone": "0620833887",
            "ville": "Lauzerte",
            "type_bien": "Maison"
        }
        return self.run_test("Create Valid Lead", "POST", "leads", 200, lead_data)

    def test_create_lead_missing_fields(self):
        """Test creating lead with missing fields"""
        lead_data = {
            "nom": "Jean Dupont",
            "email": "jean.dupont@example.com"
            # Missing telephone, ville, type_bien
        }
        return self.run_test("Create Lead Missing Fields", "POST", "leads", 422, lead_data)

    def test_create_lead_invalid_email(self):
        """Test creating lead with invalid email"""
        lead_data = {
            "nom": "Jean Dupont",
            "email": "invalid-email",
            "telephone": "0620833887",
            "ville": "Lauzerte",
            "type_bien": "Maison"
        }
        return self.run_test("Create Lead Invalid Email", "POST", "leads", 422, lead_data)

    def test_get_leads(self):
        """Test getting all leads"""
        return self.run_test("Get All Leads", "GET", "leads", 200)

    def test_create_lead_all_property_types(self):
        """Test creating leads with all property types"""
        property_types = ["Maison", "Appartement", "Terrain", "Autre bâtiment"]
        all_passed = True
        
        for prop_type in property_types:
            lead_data = {
                "nom": f"Test {prop_type}",
                "email": f"test.{prop_type.lower().replace(' ', '')}@example.com",
                "telephone": "0620833887",
                "ville": "Montcuq",
                "type_bien": prop_type
            }
            success, _ = self.run_test(f"Create Lead - {prop_type}", "POST", "leads", 200, lead_data)
            if not success:
                all_passed = False
        
        return all_passed

    def test_create_lead_all_cities(self):
        """Test creating leads with all supported cities"""
        cities = ["Lauzerte", "Montcuq", "Montaigu-de-Quercy", "Autre"]
        all_passed = True
        
        for city in cities:
            lead_data = {
                "nom": f"Test {city}",
                "email": f"test.{city.lower().replace('-', '').replace(' ', '')}@example.com",
                "telephone": "0620833887",
                "ville": city,
                "type_bien": "Maison"
            }
            success, _ = self.run_test(f"Create Lead - {city}", "POST", "leads", 200, lead_data)
            if not success:
                all_passed = False
        
        return all_passed

def main():
    print("🏠 BSK Immobilier API Testing")
    print("=" * 50)
    
    tester = BSKImmobilierAPITester()
    
    # Run all tests
    print("\n📡 Testing API connectivity...")
    tester.test_api_root()
    
    print("\n📝 Testing lead creation...")
    tester.test_create_lead_valid()
    tester.test_create_lead_missing_fields()
    tester.test_create_lead_invalid_email()
    
    print("\n📋 Testing lead retrieval...")
    tester.test_get_leads()
    
    print("\n🏘️ Testing all property types...")
    tester.test_create_lead_all_property_types()
    
    print("\n🗺️ Testing all cities...")
    tester.test_create_lead_all_cities()
    
    # Print final results
    print(f"\n📊 Final Results")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed/tester.tests_run)*100
            },
            "test_results": tester.test_results
        }, f, indent=2)
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())