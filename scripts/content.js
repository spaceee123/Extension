var jsonp = require('jsonp')
var tabInfo
var auth_token
function submitForm() {
    // let version = chrome.runtime.getManifest().version;
    // console.log(version);
    let userAgent = navigator.userAgent;
    console.log(userAgent);

    const json = JSON.stringify({
        userAgent: userAgent,
        redirect: 'https://login.carinspect.org/login'
    })

    const encodedJson =  window.btoa(json)

    chrome.tabs.create({ url: `https://login.carinspect.org/login?app_extension=1&params=${encodedJson}` }, (tab) =>{
        document.body.innerHTML += 'tabid = ' + tab.id
        tabInfo = tab
    });

}
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', submitForm);
});


if (window.location.href.includes('login.carinspect.org/login?app_extension=1') && document.getElementById('auth_token') !== null && document.getElementById('auth_token').value != '') {
    alert(document.getElementById('auth_token').value)
    auth_token = document.getElementById('auth_token').value

    fetchUserInfo(document.getElementById('auth_token').value).then(data => alert(data))
}



async function fetchUserInfo(auth_token){
    const res = await fetch("https://api.carinspect.org/user", {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + auth_token
        }
    })

    return await res.json()
}
