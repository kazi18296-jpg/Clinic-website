import urllib.request, urllib.parse, http.cookiejar, re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

login_url = 'http://127.0.0.1:8000/doctor/login/'
resp = opener.open(login_url)
html = resp.read().decode('utf-8')

match = re.search(r'name=["\']csrfmiddlewaretoken["\']\s+value=["\']([^"\']+)["\']', html)
csrf = match.group(1) if match else ''

data = urllib.parse.urlencode({
    'doctor_id': 'DOC101',
    'password': 'doctorpassword123',
    'csrfmiddlewaretoken': csrf
}).encode('utf-8')

req = urllib.request.Request(login_url, data=data, headers={'Referer': login_url})
opener.open(req)

dash_resp = opener.open('http://127.0.0.1:8000/doctor/dashboard/')
dash_html = dash_resp.read().decode('utf-8')

with open('dashboard_preview.html', 'w', encoding='utf-8') as f:
    f.write(dash_html)
print('Dashboard preview HTML generated successfully!')

