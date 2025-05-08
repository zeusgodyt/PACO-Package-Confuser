chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "checkUnpublishedPackages") {
        let { selectedFiles, files } = request;
        let results = [];
        let totalDependencies = 0;
        let scannedDependencies = 0;
        let maxConcurrentRequests = 100; // Balanced for speed & stability
        let packageQueue = [];
        let activeRequests = 0;

        const fetchStatus = async (url, packageName, type) => {
            activeRequests++;
            try {
                let response = await fetch(url, { cache: "no-store" }); // Avoid cached outdated data
                let status = response.status === 404 ? "Not Found" : "Published";

                if (type === "npm" && response.status === 200) {
                    let data = await response.json();
                    if (data.time?.unpublished) status = "Unpublished";
                }

                if (status !== "Published") {
                    results.push({ name: packageName, type, status });
                }
            } catch (error) {
                console.error(`Error checking ${packageName}:`, error);
            }

            scannedDependencies++;
            activeRequests--;

            // Update UI every 10 dependencies (prevents UI lag)
            if (scannedDependencies % 10 === 0 || scannedDependencies === totalDependencies) {
                chrome.runtime.sendMessage({ action: "updateProgress", scanned: scannedDependencies, total: totalDependencies });
            }

            processQueue();
        };

        const processQueue = () => {
            while (activeRequests < maxConcurrentRequests && packageQueue.length > 0) {
                let { url, name, type } = packageQueue.shift();
                fetchStatus(url, name, type);
            }
        };

        const extractDependencies = async (file, type) => {
            try {
                let response = await fetch(file.url);
                if (!response.ok) throw new Error(`Failed to fetch ${file.url}`);

                let text = await response.text();
                let dependencies = [];

                if (type === "npm") {
                    let json = JSON.parse(text);
                    dependencies = Object.keys({ ...json.dependencies, ...json.devDependencies });
                } else if (type === "ruby") {
                    dependencies = [...text.matchAll(/gem ["']([^"']+)["']/g)].map(m => m[1]);
                } else if (type === "python") {
                    dependencies = [...new Set(text.split("\n").map(line => line.split(/[><=]/)[0].trim()))];
                } else if (type === "maven") {
                    dependencies = [...text.matchAll(/<groupId>([^<]+)<\/groupId>.*?<artifactId>([^<]+)<\/artifactId>/gs)]
                        .map(m => `${m[1]}:${m[2]}`);
                }

                dependencies.forEach(name => {
                    let url = type === "npm" ? `https://registry.npmjs.org/${name}`
                        : type === "ruby" ? `https://rubygems.org/gems/${name}`
                        : type === "python" ? `https://pypi.org/pypi/${name}/json`
                        : `https://search.maven.org/solrsearch/select?q=${name}&rows=1&wt=json`;

                    packageQueue.push({ url, name, type });
                });

                totalDependencies += dependencies.length;
            } catch (error) {
                console.error(error);
            }
        };

        (async () => {
            for (const type of selectedFiles) {
                for (const file of files[type]) {
                    await extractDependencies(file, type);
                }
            }

            processQueue();

            let interval = setInterval(() => {
                if (activeRequests === 0 && packageQueue.length === 0) {
                    clearInterval(interval);
                    chrome.runtime.sendMessage({ action: "scanComplete", results });
                    sendResponse({ results });
                }
            }, 250); // Safe interval (prevents infinite loops)
        })();

        return true;
    }
});
