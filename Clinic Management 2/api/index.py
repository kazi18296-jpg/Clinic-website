import os
import sys
from pathlib import Path

# Add project root to sys.path so Django finds clinic_backend and clinic_app
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'clinic_backend.settings')

from django.core.wsgi import get_wsgi_application
_application = get_wsgi_application()

def handler(environ, start_response):
    # When Vercel rewrites to /api/index.py, normalize PATH_INFO so Django gets the intended route
    path_info = environ.get('PATH_INFO', '')
    if path_info.startswith('/api/index.py'):
        remainder = path_info[len('/api/index.py'):]
        environ['PATH_INFO'] = remainder if remainder else '/'
    return _application(environ, start_response)

app = handler
