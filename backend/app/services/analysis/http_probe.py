import httpx


async def fetch_headers(url: str) -> dict:
    async with httpx.AsyncClient(follow_redirects=True, timeout=10.0) as client:
        response = await client.get(url)
        return dict(response.headers)
