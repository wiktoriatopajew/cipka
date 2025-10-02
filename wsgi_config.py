import subprocess
import sys
import os
import signal
import atexit

# PythonAnywhere WSGI Configuration for AutoMentor
# Replace the content of your WSGI file with this

# Set the project path
PROJECT_PATH = '/home/yourusername/automentor'

# Add the project directory to Python path
if PROJECT_PATH not in sys.path:
    sys.path.insert(0, PROJECT_PATH)

# Store the Node.js process
node_process = None

def start_node_server():
    """Start the Node.js server"""
    global node_process
    
    # Change to project directory
    os.chdir(PROJECT_PATH)
    
    # Set environment variables
    env = os.environ.copy()
    env['NODE_ENV'] = 'production'
    env['PORT'] = '8000'
    
    # Start Node.js server
    try:
        node_process = subprocess.Popen(
            ['node', 'server/index.js'],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            preexec_fn=os.setsid
        )
        print("Node.js server started successfully")
    except Exception as e:
        print(f"Error starting Node.js server: {e}")

def cleanup():
    """Cleanup function to stop Node.js process"""
    global node_process
    if node_process:
        try:
            os.killpg(os.getpgid(node_process.pid), signal.SIGTERM)
        except:
            pass

# Register cleanup function
atexit.register(cleanup)

# Start the Node.js server when module loads
start_node_server()

def application(environ, start_response):
    """WSGI application entry point"""
    
    # Simple proxy to Node.js server
    import urllib.request
    import urllib.error
    
    try:
        # Forward request to Node.js server
        url = f"http://localhost:8000{environ['PATH_INFO']}"
        if environ['QUERY_STRING']:
            url += f"?{environ['QUERY_STRING']}"
            
        # Create request
        req = urllib.request.Request(url)
        
        # Forward headers
        for key, value in environ.items():
            if key.startswith('HTTP_'):
                header_name = key[5:].replace('_', '-').title()
                req.add_header(header_name, value)
        
        # Add request body for POST requests
        request_body = None
        if environ['REQUEST_METHOD'] in ['POST', 'PUT', 'PATCH']:
            try:
                content_length = int(environ.get('CONTENT_LENGTH', 0))
                request_body = environ['wsgi.input'].read(content_length)
            except:
                pass
        
        # Make request to Node.js server
        if request_body:
            response = urllib.request.urlopen(req, request_body, timeout=30)
        else:
            response = urllib.request.urlopen(req, timeout=30)
        
        # Get response data
        response_data = response.read()
        
        # Set response status and headers
        status = f"{response.code} {response.reason}"
        response_headers = []
        
        for header, value in response.headers.items():
            if header.lower() not in ['connection', 'transfer-encoding']:
                response_headers.append((header, value))
        
        start_response(status, response_headers)
        return [response_data]
        
    except urllib.error.HTTPError as e:
        # Handle HTTP errors from Node.js server
        status = f"{e.code} {e.reason}"
        response_headers = [('Content-type', 'application/json')]
        start_response(status, response_headers)
        return [f'{{"error": "{e.reason}"}}'.encode()]
        
    except Exception as e:
        # Handle other errors
        print(f"WSGI Error: {e}")
        status = '500 Internal Server Error'
        response_headers = [('Content-type', 'application/json')]
        start_response(status, response_headers)
        return [f'{{"error": "Internal Server Error: {str(e)}"}}'.encode()]