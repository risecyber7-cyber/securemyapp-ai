import urllib.request, json
data = json.loads(urllib.request.urlopen("https://openrouter.ai/api/v1/models").read())
print("\n".join([m["id"] for m in data["data"] if "gemini-1.5" in m["id"]]))
