
function submitForm() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    fetch('https://login.carinspect.org/login')
    console.log(username, password)
}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', submitForm);

    let version = chrome.runtime.getManifest().version;
    console.log(version);
    let userAgent = navigator.userAgent;
    console.log(userAgent);

    const json =JSON.stringify({
        version: version,
        userAgent: userAgent,
    })

    const encodedJson = base64.encode(json)
    console.log(encodedJson)
       chrome.tabs.create({ url: `https://login.carinspect.org/login?params=${encodedJson}` });
});