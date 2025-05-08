<p align="center">
  <a href="#" target="_blank">
    <img src="./icons/icon128.png" alt="GitHub Logo" width="150" height="150" />
  </a>
</p>


# 🎭 PACO - Package Confuser

🕵️‍♂️ A Chrome Extension that scans GitHub repositories to uncover unpublished, broken, or removed packages across major ecosystems.

---

## 🚀 Overview

**PACO (Package Confuser)** is a browser-based dependency auditing tool built as a Chrome extension. It inspects package manager files found across GitHub repositories (including search result pages) and checks if any dependencies are:

- 🔴 Unpublished
- ⚠️ Removed
- ❌ Not found on public registries

This helps developers, security teams, and recruiters quickly assess the reliability of open-source software by flagging dependencies that might be risky, broken, or suspicious.

---

## 🎯 Use Cases

### 🔐 **Security Auditing**
- Detect if dependencies have been removed or unpublished (often a red flag for supply-chain attacks).

### 🧑‍💻 **Open-Source Review**
- Quickly check if repositories use valid, public, and stable dependencies before using them in your stack.

### ⚙️ **DevOps QA**
- Prevent broken builds by identifying missing dependencies before deployment.

### 🕵️‍♀️ **Hiring/Recruitment**
- Evaluate candidates' projects by scanning for package hygiene and maintenance.

### 📈 **Tech Due Diligence**
- Validate code dependencies in public projects for compliance and risk management.

---

## 🔍 Supported Package Managers

| Ecosystem    | File Type             | Registry Checked                              |
|--------------|------------------------|-----------------------------------------------|
| **Node.js**  | `package.json`         | [npmjs.org](https://registry.npmjs.org/)      |
| **Python**   | `requirements.txt`     | [pypi.org](https://pypi.org/)                 |
| **Ruby**     | `Gemfile`, `Gemfile.lock` | [rubygems.org](https://rubygems.org/)     |
| **Java**     | `pom.xml`              | [search.maven.org](https://search.maven.org/) |

---

## 🛠 Tech Stack

| Layer              | Tech Used                                |
|--------------------|-------------------------------------------|
| **Platform**        | Chrome Extension (Manifest V3)            |
| **Frontend UI**     | HTML, CSS, Vanilla JavaScript             |
| **Logic & Parser**  | `fetch`, `async/await`, RegEx extraction  |
| **Background Tasks**| Service worker + message passing          |
| **Concurrency**     | Custom batch queuing engine               |

---

## 💡 Key Features

- ✅ **Deep GitHub Search Integration**
  - Works not only on open repos, but also GitHub search result pages
- ✅ **Multi-Ecosystem Support**
  - Scans NPM, PyPI, RubyGems, Maven packages
- ⚡ **Blazing Fast Queue Processing**
  - Handles 100+ concurrent requests with smart throttling
- 📊 **Live Scan Progress**
  - Animated progress bar with live updates
- 💥 **Instant Results**
  - Packages flagged as `Not Found`, `Unpublished`, or safe
- 🧼 **No External Dependencies**
  - Lightweight, clean, and framework-free JavaScript
- 💻 **Developer-Friendly UX**
  - Checkbox toggles, scrollable results, one-click scan
- 🔐 **Zero Tracking**
  - All data stays in your browser. No accounts, no data collection.

---

## 📦 Installation

1. Clone or download this repository
2. Go to `chrome://extensions/`
3. Enable **Developer Mode**
4. Click **Load unpacked** and select the folder
5. Open any GitHub repo or search page with package manager files
6. Click the PACO extension icon → Hit **“Start Scan”**

---

## 📁 Project Structure

- `paco/`
  - `manifest.json` – Chrome Extension configuration
  - `background.js` – Handles API checks, queues, concurrency
  - `content.js` – Extracts GitHub links & raw file URLs
  - `popup.html` – Extension UI
  - `popup.js` – UI logic & Chrome messaging
  - `style.css` – Clean, responsive UI styling
  - `icons/` – Extension icon set (includes `icon128.png`, etc.)

## 📘 Attribution

GitHub logo used under fair use as per [GitHub Brand Guidelines](https://github.com/logos). This project is not affiliated with or endorsed by GitHub.
