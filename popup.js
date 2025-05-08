document.addEventListener("DOMContentLoaded", () => {
    const scanBtn = document.getElementById("scan-btn");
    const resultsContainer = document.getElementById("file-list");
    const progressBar = document.getElementById("progress-bar");
    const scanStatus = document.getElementById("scan-status");

    scanBtn.addEventListener("click", () => {
        resultsContainer.innerHTML = "<p>⏳ Scanning...</p>";
        progressBar.value = 0;
        scanStatus.innerText = "Scanning started...";

        let selectedFiles = ["npm", "ruby", "python", "maven"].filter(type => document.getElementById(type).checked);

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                resultsContainer.innerHTML = "<p>⚠️ No active GitHub tab found.</p>";
                return;
            }

            chrome.tabs.sendMessage(tabs[0].id, { action: "getFileLinks" }, (response) => {
                if (!response || !response.files) {
                    resultsContainer.innerHTML = "<p>⚠️ No package files found.</p>";
                    return;
                }

                console.log("Sending extracted files to background.js:", response.files);

                chrome.runtime.sendMessage(
                    { action: "checkUnpublishedPackages", selectedFiles, files: response.files },
                    (result) => {
                        if (!result || !result.results) {
                            resultsContainer.innerHTML = "<p>⚠️ Scan failed. Try again.</p>";
                            return;
                        }

                        if (result.results.length > 0) {
                            resultsContainer.innerHTML = `<p>🚨 Unpublished or Not Found Packages:</p><ul>${result.results.map(pkg => `<li>${pkg.name} (${pkg.type}): ${pkg.status}</li>`).join('')}</ul>`;
                        } else {
                            resultsContainer.innerHTML = "<p>✅ No unpublished packages found.</p>";
                        }

                        scanStatus.innerText = "Scan complete!";
                        progressBar.value = 100;
                    }
                );
            });
        });
    });

    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === "updateProgress") {
            let percent = Math.round((message.scanned / message.total) * 100);
            progressBar.value = percent;
            scanStatus.innerText = `Scanning ${message.scanned} of ${message.total} dependencies...`;
        }

        if (message.action === "scanComplete") {
            scanStatus.innerText = "Scan complete!";
            resultsContainer.innerHTML = `<p>🚨 Unpublished or Not Found Packages:</p><ul>${message.results.map(pkg => `<li>${pkg.name} (${pkg.type}): ${pkg.status}</li>`).join('')}</ul>`;
        }
    });
});
