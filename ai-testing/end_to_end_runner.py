import asyncio
import argparse
import datetime
import logging
import os
import sys

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent, Browser, BrowserConfig

from prompts_e2e import (
    LOGIN_PROMPT,
    JOB_CREATION_PROMPT,
    VALIDATION_ERROR_PROMPT,
    LOGIN_NEGATIVE_PROMPT,
)

load_dotenv()

TIMESTAMP = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(f"e2elogs/run_{TIMESTAMP}.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

llm_gemini = ChatGoogleGenerativeAI(
    model="gemini-3.1-flash-lite-preview",
    google_api_key=GEMINI_API_KEY,
    temperature=1,
)

browser = Browser(
    config=BrowserConfig(
        headless=False,
    )
)

TEST_REGISTRY = {
    "login": LOGIN_PROMPT,
    "job_creation": JOB_CREATION_PROMPT,
    "validation": VALIDATION_ERROR_PROMPT,
    "negative": LOGIN_NEGATIVE_PROMPT,
}

async def run_test(llm, model_name: str, prompt):
    logger.info(f"{'='*60}")
    logger.info(f"Running test: {prompt.scenario_name}")
    logger.info(f"Model: {model_name}")
    logger.info(f"{'='*60}")

    save_path = f"e2elogs/{model_name}/{prompt.scenario_name}/{TIMESTAMP}"
    os.makedirs(save_path, exist_ok=True)

    agent = Agent(
        task=prompt.content,
        llm=llm,
        browser=browser,
        generate_gif=True,
        use_vision=True,
        save_conversation_path=save_path,
    )

    result = await agent.run()
    logger.info(f"Test '{prompt.scenario_name}' completed.")
    logger.info(f"Result: {result}")
    return result


async def run_all_tests(llm, model_name: str, test_names: list[str] | None = None):
    if test_names is None:
        test_names = list(TEST_REGISTRY.keys())

    results = {}
    for name in test_names:
        prompt = TEST_REGISTRY.get(name)
        if prompt is None:
            logger.warning(f"Unknown test: '{name}'. Skipping.")
            continue

        try:
            result = await run_test(llm, model_name, prompt)
            results[name] = {"status": "completed", "result": str(result)}
        except Exception as e:
            logger.error(f"Test '{name}' failed with error: {e}")
            results[name] = {"status": "error", "error": str(e)}

    logger.info(f"\n{'='*60}")
    logger.info("TEST EXECUTION SUMMARY")
    logger.info(f"{'='*60}")
    for name, info in results.items():
        status = info["status"]
        logger.info(f"  {name}: {status}")
    logger.info(f"{'='*60}\n")

    await browser.close()
    return results

def main():
    parser = argparse.ArgumentParser(
        description="AI-driven E2E Test Runner (browser-use + Gemini)"
    )
    parser.add_argument(
        "--test",
        choices=list(TEST_REGISTRY.keys()),
        help="Run a specific test. If omitted, all tests run.",
    )
    parser.add_argument(
        "--model",
        default="gemini-3.1-flash-lite-preview",
        help="Model name for logging (default: gemini-3.1-flash-lite-preview)",
    )
    args = parser.parse_args()

    test_names = [args.test] if args.test else None
    asyncio.run(run_all_tests(llm_gemini, args.model, test_names))


if __name__ == "__main__":
    main()
