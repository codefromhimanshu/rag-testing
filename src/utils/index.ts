
function addDomainToImgSrc(htmlString:string, domain:string) {
    // Replace domain name in html string img tag if not present
    const domainRegex = /^https?:\/\/[^\/]+/;
    return htmlString.replace(/<img [^>]*src="([^"]+)"[^>]*>/g, (match, src) => {
        if (src.includes('data:image')) {
            return match
        }
        else if (!domainRegex.test(src)) {
          
            return match.replace(src, domain +'/'+ src);
        }
        return match;
    });
}

function getDomainFromUrl(url:string) {
    try {
        let parsedUrl = new URL(url);
        return `${parsedUrl.protocol}//${parsedUrl.hostname}`; // Returns the domain part of the URL
    } catch (error:any) {
        console.error("Invalid URL:", error.message);
        return null;
    }
}
export {addDomainToImgSrc, getDomainFromUrl}