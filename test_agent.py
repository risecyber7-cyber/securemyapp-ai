from openai import OpenAI
import os


class OpenRouterLLM:
    def __init__(self, api_key: str, model="openai/gpt-4.1-mini"):
        self.client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
        self.model = model

    def generate(self, prompt: str):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.choices[0].message.content


class AntigravityAgent:
    def __init__(self, llm, tools=None):
        self.llm = llm
        self.tools = tools or []

    def run(self, task: str):
        print("Antigravity Agent initialized!")
        print(f"Task: {task}")
        prompt = (
            f"Please perform the following task as a security expert: {task}\n"
            "Provide an initial plan on what common weaknesses to look for in a modern web app (e.g. Next.js, FastAPI)."
        )

        try:
            response = self.llm(prompt)
            print("\nAgent Response:")
            print("=" * 40)
            print(response)
            print("=" * 40)
        except Exception as e:
            print(f"Error during generation: {e}")


if __name__ == "__main__":
    api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("SECUREMYAPP_OPENROUTER_API_KEY")
    if not api_key:
        raise SystemExit("Set OPENROUTER_API_KEY or SECUREMYAPP_OPENROUTER_API_KEY before running this script.")

    llm = OpenRouterLLM(api_key=api_key)
    agent = AntigravityAgent(llm=llm.generate, tools=["source_code_scanner", "vulnerability_analyzer"])
    agent.run("Scan a web app logic for weaknesses")
