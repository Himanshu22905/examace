# Survey QA Testing Bot System

This tool helps survey owners test their own surveys before launch by simulating realistic respondents. It automatically opens your survey, answers questions with different personas, submits responses, and stores everything in Excel for QA review. You can use it to catch broken logic, missing required fields, and edge-case behavior early.

## Requirements

- Python 3.10 or newer
- Works on Windows, macOS, and Linux
- Internet connection (for OpenAI API and survey website access)

## Step-by-Step Installation

1. Install Python
- Download Python from: [https://www.python.org/downloads/](https://www.python.org/downloads/)
- During install on Windows, check **"Add Python to PATH"**.

2. Open Terminal / Command Prompt
- Windows: Command Prompt or PowerShell
- macOS: Terminal
- Linux: Terminal

3. Go to the project folder
```bash
cd survey_tester
```

4. Install Python dependencies
```bash
pip install -r requirements.txt
```

5. Install Playwright browser (Chromium)
```bash
playwright install chromium
```

## Configure Your OpenAI API Key

1. Open `config.json`
2. Find this field:
```json
"openai_api_key": "sk-your-openai-api-key-here"
```
3. Replace it with your real key.

## Add Your Survey URLs

In `config.json`, edit the `surveys` list:

```json
"surveys": [
  {
    "name": "Customer Experience QA",
    "url": "https://your-survey-link.com",
    "responses_per_run": 5
  }
]
```

- `name`: Friendly name for your report file
- `url`: Public link to your survey
- `responses_per_run`: How many test submissions to run

## Run the Bot

From inside `survey_tester`:

```bash
python main.py
```

## Where Outputs Are Saved

- Excel QA files: inside the folder set by `output_dir` in `config.json` (default: `results/`)
- Debug logs: `results/run_log.txt`
- Persona cache: `results/personas_cache.json`
- Answer cache: `results/answer_cache.json`

## Troubleshooting

### Survey not loading
- Confirm the URL is correct and publicly accessible.
- Make sure the survey platform is not blocking your IP or region.

### API key error
- Re-check `openai_api_key` in `config.json`.
- Make sure the key starts with `sk-` and is active.

### CAPTCHA detected
- Set `"headless": false` in `config.json`.
- Run again and solve CAPTCHA manually when browser opens.

## Change Number of Test Responses

To increase or decrease generated test responses, update `responses_per_run` under each survey in `config.json`.

Example:
```json
"responses_per_run": 20
```

This will run 20 simulated respondents for that survey in one execution.
