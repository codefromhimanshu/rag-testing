import CryptoJS from 'crypto-js';

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

function encryptEmail(email:string){
    //TODO: Add timer to expire the token
 
    return CryptoJS.AES.encrypt(email, process.env.NEXTAUTH_SECRET as string).toString();
}

function decryptEmail(encrypted:string) {
 
    return CryptoJS.AES.decrypt(encrypted, process.env.NEXTAUTH_SECRET as string).toString(CryptoJS.enc.Utf8);
}
export {addDomainToImgSrc, getDomainFromUrl, encryptEmail, decryptEmail}