## Selenium-based Frontend UI tests (Robot Framework)

This folder contains Robot Framework UI tests for the React frontend using `SeleniumLibrary`.

### Requirements
- UI running at `http://localhost:3000`
- API running at `http://localhost:8000`
- Chrome available (and a compatible `chromedriver` accessible to Selenium)

### Install
From `src/frontend`:

```bash
py -m pip install -r robot-selenium\requirements-ui-selenium.txt
```

### Run
From `src/frontend`:

```bash
robot -d robot-selenium\results robot-selenium\ui
```

Run only performance checks:

```bash
robot -d robot-selenium\results robot-selenium\ui\performance.robot
```

You can override URLs by setting env vars:
- `UI_URL`
- `API_URL`

You can override the ChromeDriver path by setting:
- `CHROME_DRIVER` (full path to `chromedriver.exe`)

To force headed Chrome:
- keep `HEADLESS` unset or set `HEADLESS=FALSE`

To run headless (optional):
- set `HEADLESS=TRUE`

Performance thresholds (optional env vars):
- `MAX_DOM_CONTENT_LOADED_MS` (default `3000`)
- `MAX_LOGIN_RENDER_MS` (default `2500`)
