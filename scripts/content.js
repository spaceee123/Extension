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
    });

}
// chrome.storage.local.clear(() => {
//     console.log('Все записи в локальном хранилище были успешно удалены.');
// });
async function fetchUserInfo(auth_token){

    const apiUrl = `https://api.carinspect.org/user?api_token=${auth_token}`
    const response = await fetch(apiUrl, {
        method: 'GET',
        Accept: 'application/json'
    })
    const result = await response.json()
    return result
}

async function Logout(auth_token){
    chrome.storage.local.remove( 'userToken', function() {
        console.log('Токен пользователя удален')
    })

    $(".section_auth").css("display", "block")
    $(".section_main").css("display", "none")

    const apiUrl = `https://api.carinspect.org/logout?api_token=${auth_token}`
    const response = await fetch(apiUrl, {
        method: 'GET',
        Accept: 'application/json'
    })
    const data = await response.json()
    return data
}

window.addEventListener('DOMContentLoaded', function() {
    const views = chrome.extension.getViews();
    const isPopupOpen = views.some(view => view.location.pathname === '/index.html');

    if (isPopupOpen){
        chrome.storage.local.get(['userToken'], function (result) {
            //alert(result.userToken)
            if (result.userToken !== undefined && result.userToken !== null && result.userToken !== '') {
                $(".section_auth").css("display", "none")
                $(".section_main").css("display", "flex")
                chrome.storage.local.get(['userInfo'], function (result) {
                    $(".username").append(`${result.userInfo.name}`)
                    $(".email_text").append(`${result.userInfo.email}`)
                })
            } else {
                $(".section_auth").css("display", "flex")
                $(".section_main").css("display", "none")
            }
        })
    }
});

// $(document).off('click', '#loginBtn').on('click', '#loginBtn', () => submitForm())
// $(document).off('click', '#logoutBtn').on('click', '#logoutBtn', () =>{
//     chrome.storage.local.get(['userToken'], function (result) {
//         Logout(result.userToken)
//     })
// })

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginBtn').addEventListener('click', submitForm);
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-new-unknown-btn').addEventListener('click', () =>{
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs && tabs.length > 0) {
                var tab = tabs[0];
                var tabTitle = tab.url;
                chrome.tabs.create({ url: tab.url })
            }
        });
        let script = document.createElement("script")
        s.src = chrome.runtime.getURL('unknown.js')
        $("body").append(s)
    })
})

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('logoutBtn').addEventListener('click',() => {
        chrome.storage.local.get(['userToken'], function (result) {
            Logout(result.userToken)
        })

    });
});

// chrome.storage.onChanged.addListener(function(changes, namespace) {
//     for (var key in changes) {
//         if (key === 'userToken') {
//             chrome.runtime.sendMessage({ action: 'updatePopup' }, (response) => {
//                 alert(response)
//             });
//         }
//     }
// });


if (window.location.href.includes('login.carinspect.org/login?app_extension=1') && document.getElementById('auth_token') !== null && document.getElementById('auth_token').value != '') {

    chrome.storage.local.set({ userToken: document.getElementById('auth_token').value }, function() {
        console.log('Токен пользователя сохранен')
    });

    fetchUserInfo(document.getElementById('auth_token').value).then( result => {
        chrome.storage.local.set({ userInfo:result }, function() {
            console.log('Информация о ползователе сохранена')
        });
    })

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // Первая активная вкладка в текущем окне
        var activeTab = tabs[0];
        var tabId = activeTab.id;
        chrome.runtime.sendMessage({action: 'closeActiveTab', tabId: tabId}, (response) => {
            alert(response)
        });

    });
}
function injectCode(src) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = function() {
        console.log("script injected")
        this.remove()
    }
}
async function getTab() {
    let queryOptions = { active: true, currentWindow: true };
    let tabs = await chrome.tabs.query(queryOptions);
    return tabs[0].url;
}

// var s = document.createElement("script")
//
// if (window.location.href.includes('auto.ria.com')) {
//     // injectCode('https://carinspect.org/static/extention/autoria.js')
//     // //s.src = chrome.runtime.getURL('https://carinspect.org/static/extention/autoria.js')
//     // s.src = 'https://carinspect.org/static/extention/autoria.js'
//     document.body.append(s);
// } else if (window.location.href.includes('rst.ua')){
//     s.src = chrome.runtime.getURL('parseScripts/rst.js')
//     $("body").append(s)
// }else if(window.location.href.includes('olx.ua')){
//     s.src = chrome.runtime.getURL('parseScripts/olx.js')
//     $("body").append(s)
// }else if(window.location.href.includes('mobile.de')) {
//     s.src = chrome.runtime.getURL('parseScripts/mobilede.js')
//     $("body").append(s)
// } else if(window.location.href.includes('otomoto.pl')) {
//     s.src = chrome.runtime.getURL('parseScripts/otomoto.js')
//     $("body").append(s)
// } else if(window.location.href.includes('autoplius.lt')) {
//     s.src = chrome.runtime.getURL('parseScripts/autoplius.js')
//     $("body").append(s)
// } else if(window.location.href.includes('lacentrale.fr')) {
//     s.src = chrome.runtime.getURL('parseScripts/lacentrale.js')
//     $("body").append(s)
// }else if(window.location.href.includes('kvd.se')) {
//     s.src = chrome.runtime.getURL('parseScripts/kvd.js')
//     $("body").append(s)
// }else if(window.location.href.includes('finn.no')) {
//     s.src = chrome.runtime.getURL('parseScripts/finn.js')
//     $("body").append(s)
// }else if(window.location.href.includes('sauto.cz')) {
//     s.src = chrome.runtime.getURL('parseScripts/sauto.js')
//     $("body").append(s)
// }else if(window.location.href.includes('myauto.ge')) {
//     s.src = chrome.runtime.getURL('parseScripts/myauto.js')
//     $("body").append(s)
// }





// если сайт = auto ria, то делем это
// var s = document.createElement("script");
// s.type = "text/javascript";
// // s.src = "https://api.carinpect.org/chrome_extension/auto_ria.js";
// s.src = chrome.runtime.getURL('/autoria.js')
// $("head").append(s);