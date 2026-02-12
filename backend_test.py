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
        self.admin_token = None

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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")

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
                    print(f"Error details: {result['error']}")
                except:
                    result["error"] = response.text
                    print(f"Error text: {result['error']}")

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

    def test_admin_login_valid(self):
        """Test admin login with valid credentials"""
        login_data = {
            "username": "admin",
            "password": "hMX181haIwKrkOhj"
        }
        success, response = self.run_test("Admin Login Valid", "POST", "auth/login", 200, login_data)
        if success and response:
            try:
                data = response.json()
                if data.get('success') and data.get('token'):
                    self.admin_token = data['token']
                    print(f"✅ Admin token obtained: {self.admin_token[:20]}...")
                    return True
            except:
                pass
        return False

    def test_admin_login_invalid(self):
        """Test admin login with invalid credentials"""
        login_data = {
            "username": "admin",
            "password": "wrongpassword"
        }
        return self.run_test("Admin Login Invalid", "POST", "auth/login", 401, login_data)

    def test_auth_verify(self):
        """Test auth verification with token"""
        if not self.admin_token:
            print("❌ No admin token available for verification test")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Auth Verify", "GET", "auth/verify", 200, headers=headers)

    def test_get_site_content(self):
        """Test getting site content"""
        return self.run_test("Get Site Content", "GET", "site/content", 200)

    def test_update_site_content(self):
        """Test updating site content (requires auth)"""
        if not self.admin_token:
            print("❌ No admin token available for site content update test")
            return False
        
        content_data = {
            "meta_title": "Test Title - BSK Immobilier",
            "meta_description": "Test description for BSK Immobilier",
            "hero_title": "Test Hero Title",
            "agent_name": "Test Agent"
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Update Site Content", "PUT", "site/content", 200, content_data, headers)

    def test_get_sectors(self):
        """Test getting sectors"""
        return self.run_test("Get Sectors", "GET", "site/sectors", 200)

    def test_update_sectors(self):
        """Test updating sectors (requires auth)"""
        if not self.admin_token:
            print("❌ No admin token available for sectors update test")
            return False
        
        sectors_data = {
            "sectors": [
                {
                    "id": "test1",
                    "name": "Test Sector 1",
                    "code": "12345",
                    "description": "Test description",
                    "image_url": "https://example.com/image.jpg"
                }
            ]
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Update Sectors", "PUT", "site/sectors", 200, sectors_data, headers)

    def test_get_blog_posts(self):
        """Test getting blog posts"""
        return self.run_test("Get Blog Posts", "GET", "blog/posts", 200)

    def test_get_blog_categories(self):
        """Test getting blog categories"""
        return self.run_test("Get Blog Categories", "GET", "blog/categories", 200)

    def test_get_recent_posts(self):
        """Test getting recent posts"""
        return self.run_test("Get Recent Posts", "GET", "blog/recent", 200)

    def test_create_blog_post(self):
        """Test creating a blog post (requires auth)"""
        if not self.admin_token:
            print("❌ No admin token available for blog post creation test")
            return False
        
        post_data = {
            "title": "Test Blog Post",
            "slug": "test-blog-post-" + str(int(datetime.now().timestamp())),
            "excerpt": "This is a test blog post excerpt for testing purposes",
            "content": "<p>This is the test blog post content. It contains enough text to meet the minimum 50 character requirement for blog post content validation.</p>",
            "category": "Conseils Vente",
            "tags": ["test", "immobilier"],
            "published": True
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        success, response = self.run_test("Create Blog Post", "POST", "blog/posts", 200, post_data, headers)
        
        if success and response:
            try:
                data = response.json()
                self.test_blog_post_id = data.get('id')
                return True
            except:
                pass
        return False

    def test_get_blog_post_by_slug(self):
        """Test getting a blog post by slug"""
        # Use a test slug - if no posts exist, this will return 404 which is expected
        return self.run_test("Get Blog Post by Slug", "GET", "blog/posts/test-slug", 404)

    def test_get_leads_protected(self):
        """Test getting leads (requires auth)"""
        if not self.admin_token:
            print("❌ No admin token available for protected leads test")
            return False
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        return self.run_test("Get Leads Protected", "GET", "leads", 200, headers=headers)

    def test_sitemap(self):
        """Test sitemap generation"""
        return self.run_test("Get Sitemap", "GET", "sitemap.xml", 200)

def main():
    print("🏠 BSK Immobilier API Testing - Complete Admin & Blog System")
    print("=" * 60)
    
    tester = BSKImmobilierAPITester()
    
    # Test basic API connectivity
    print("\n📡 Testing API connectivity...")
    tester.test_api_root()
    
    # Test admin authentication
    print("\n🔐 Testing admin authentication...")
    tester.test_admin_login_valid()
    tester.test_admin_login_invalid()
    tester.test_auth_verify()
    
    # Test site content management
    print("\n🏠 Testing site content management...")
    tester.test_get_site_content()
    tester.test_update_site_content()
    tester.test_get_sectors()
    tester.test_update_sectors()
    
    # Test blog functionality
    print("\n📝 Testing blog functionality...")
    tester.test_get_blog_posts()
    tester.test_get_blog_categories()
    tester.test_get_recent_posts()
    tester.test_create_blog_post()
    tester.test_get_blog_post_by_slug()
    
    # Test lead functionality
    print("\n📋 Testing lead functionality...")
    tester.test_create_lead_valid()
    tester.test_create_lead_missing_fields()
    tester.test_create_lead_invalid_email()
    tester.test_get_leads_protected()
    
    # Test comprehensive lead creation
    print("\n🏘️ Testing all property types...")
    tester.test_create_lead_all_property_types()
    
    print("\n🗺️ Testing all cities...")
    tester.test_create_lead_all_cities()
    
    # Test additional endpoints
    print("\n🗺️ Testing additional endpoints...")
    tester.test_sitemap()
    
    # Print final results
    print(f"\n📊 Final Results")
    print("=" * 60)
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