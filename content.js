async function getRepoLinks() {
    let repoLinks = [];

    // Detect if we're on a GitHub search results page
    if (window.location.href.includes("github.com/search")) {
        console.log("Detected GitHub search results page.");
        
        document.querySelectorAll('a[href]').forEach(link => {
            let href = link.href;
            if (href.match(/^https:\/\/github\.com\/[^\/]+\/[^\/]+$/) && !repoLinks.includes(href)) {
                repoLinks.push(href);
            }
        });

        console.log("Extracted repository links:", repoLinks);
        return repoLinks;
    }

    return [];
}

async function getPackageLinksFromRepo(repoUrl) {
    let fileLinks = { npm: [], ruby: [], python: [], maven: [] };

    try {
        let response = await fetch(repoUrl);
        let html = await response.text();
        let parser = new DOMParser();
        let doc = parser.parseFromString(html, "text/html");

        doc.querySelectorAll('a[href]').forEach(link => {
            let href = link.href;

            if (href.includes("/blob/")) {
                let rawUrl = href.replace("/blob/", "/raw/");

                if (href.endsWith("package.json")) fileLinks.npm.push({ url: rawUrl });
                else if (/Gemfile(\..*)?$/.test(href)) fileLinks.ruby.push({ url: rawUrl });
                else if (/requirements(\..*)?\.txt$/.test(href)) fileLinks.python.push({ url: rawUrl });
                else if (/pom(\..*)?\.xml$/.test(href)) fileLinks.maven.push({ url: rawUrl });
            }
        });

        console.log(`Extracted files from ${repoUrl}:`, fileLinks);
    } catch (error) {
        console.error(`Failed to fetch repo ${repoUrl}:`, error);
    }

    return fileLinks;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getFileLinks") {
        getRepoLinks().then(async (repos) => {
            let allFiles = { npm: [], ruby: [], python: [], maven: [] };

            for (let repo of repos) {
                let repoFiles = await getPackageLinksFromRepo(repo);
                Object.keys(allFiles).forEach(type => allFiles[type].push(...repoFiles[type]));
            }

            console.log("Final extracted file links:", allFiles);
            sendResponse({ files: allFiles });
        });
        return true;
    }
});
