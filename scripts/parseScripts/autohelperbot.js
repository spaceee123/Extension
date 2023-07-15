function myButton() {
    $("document").ready( function() {
        if (window.location.href.includes('car')){
            var button = $('<button class="btn-add"> <img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf"><p style="margin: 0" class="my_btn_text"></p></button>')

            button.css({
                display: 'flex',
                justifyContent: "center",
                cursor: 'pointer',
                alignItems: "center",
                width: 190,
                height: 40,
                backgroundColor: '#07b74a',
                borderRadius: 5,
                border:"none",
                marginRight: 35,
                marginLeft: 35,
                marginBottom:10,
                fontFamily: 'Arial,Helvetica,sans-serif'
            })

            chrome.storage.local.get(['linksArray'], (result) => {
                const linksArray = result.linksArray || []
                const foundLinks = linksArray.find((link) => link.url.includes(window.location.href))

                console.log('found', foundLinks)
                if (foundLinks !== undefined) {
                    $('.my_btn_text').text('Update Inspection')
                    button.css({
                        color: 'white',
                        backgroundColor: 'rgb(12,96,42)'
                    })
                } else {
                    $('.my_btn_text').text('Create Inspection')
                    button.css({
                        color: 'white',
                        backgroundColor: 'rgb(17,182,75)'
                    })
                }
            })
            $('.lot_information').prepend(button)

            var popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
            popover.find('.extension_popover_text_successful').css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                marginTop: 5,
            })


            let isTopCount = $('span[data-testid="sec-price"]').length > 0
            popover.css({
                position: "absolute",
                textAlign: 'center',
                top: '45px',
                width: '130px',
                height: '30px',
                color: 'white',
                borderRadius: 5,
                zIndex: 10000000000,
            })
            $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {


                let ad_name = $('h1.mb-3').first().text()
                let vin = $('.mt-2 strong').first().text()
                let price = parseInt($('.d-block.d-sm-inline-block.lot_price_range .mt-1 .text-left b').text().replace(/\D/g, ""))
                let currency = $('.d-block.d-sm-inline-block.lot_price_range .mt-1 .text-left span').text()
                let currency_symbol = $('.d-block.d-sm-inline-block.lot_price_range .mt-1 .text-left b').text().replace(/[0-9]/g, "")
                let mileage
                $('.lot_information .mt-2').map(function(){
                    if($(this).find($('b')).text().includes('Пробіг:') || $(this).find($('b')).text().includes('Пробег:') || $(this).find($('b')).text().includes('Mileage:') || $(this).find($('b')).text().includes('Przebieg:')){
                        mileage = parseInt($(this).text().replace(/\D/g, "").trim())
                    }
                })
                let mileage_units = 'mi'
                let ad_url = window.location.href
                let ad_platfotm = 'autohelperbot.com'
                let external = window.location.href.split('/')
                let ad_external_id = external[external.length - 1]

                let index = 0
                let additional_data = $.makeArray($('.lot_information .mt-2').map(function (){
                    index+=10
                    return {
                        key: $(this).find('b').text(),
                        value: $(this).clone().children().remove().end().text(),
                        sort: index}
                }))

                let ad_images = $.makeArray($(".swiper-wrapper:eq(0) .swiper-slide a").map(function() {
                    return $(this).attr('href')
                }))

                let obj = {
                    ad_name: ad_name,
                    vin: vin,
                    price: price,
                    currency: currency,
                    currency_symbol: currency_symbol,
                    mileage: mileage,
                    mileage_units: mileage_units,
                    ad_url: ad_url,
                    ad_platfotm: ad_platfotm,
                    additional_data: additional_data,
                    photos: ad_images,
                    ad_external_id: ad_external_id
                }
                console.log(obj)

                chrome.storage.local.get(['userToken'], function (result) {
                    console.log('token', result.userToken)
                    if (result.userToken !== undefined && result.userToken !== null && result.userToken !== '') {

                        chrome.storage.local.get(['linksArray'], (linksResult) => {
                            console.log('linksArray', linksResult.linksArray)
                            const existingLinksArray = linksResult.linksArray || []
                            const foundLinks = existingLinksArray.find((link) => link?.url.includes(window.location.href))

                            if (foundLinks !== undefined) {
                                fetch(`https://api.carinspect.org/uk/online-inspections/edit/${foundLinks.id}/?api_token=${result.userToken}`, {
                                    method: 'POST',
                                    body: JSON.stringify(obj),
                                    Accept: 'application/json',
                                }).then(res => {
                                    if (res.ok){
                                        return res.json()
                                    }else{
                                        return 'error'
                                    }
                                }).then(data => {
                                    console.log(data)
                                    if(data === 'error'){
                                        popover.find('.extension_popover_text_successful').text("Not Successful!")
                                        popover.css({
                                            backgroundColor: 'rgba(183,48,48,0.75)'
                                        })
                                        $('.btn-add').prepend(popover)
                                    }else{
                                        popover.find('.extension_popover_text_successful').text("Successful!")
                                        popover.css({
                                            backgroundColor: 'rgba(59,183,48,0.75)'
                                        })
                                        $('.btn-add').prepend(popover)
                                    }

                                })
                            } else {
                                const apiUrl = `https://api.carinspect.org/uk/online-inspections/add?api_token=${result.userToken}`
                                fetch(apiUrl, {
                                    method: 'POST',
                                    body: JSON.stringify(obj),
                                    Accept: 'application/json',
                                }).then(res => {
                                    if (res.ok){
                                        return res.json()
                                    }else{
                                        return 'error'
                                    }
                                }).then(data => {
                                    console.log(data)
                                    if(data === 'error'){
                                        popover.find('.extension_popover_text_successful').text("Not Successful!")
                                        popover.css({
                                            backgroundColor: 'rgba(183,48,48,0.75)'
                                        })
                                        $('.btn-add').prepend(popover)
                                    }else{
                                        popover.find('.extension_popover_text_successful').text("Successful!")
                                        popover.css({
                                            backgroundColor: 'rgba(59,183,48,0.75)'
                                        })
                                        $('.btn-add').prepend(popover)

                                        existingLinksArray.push({id: data.id, url: ad_url})
                                        chrome.storage.local.set({ linksArray: existingLinksArray }, () => {
                                            $('.my_btn_text').text('Update Inspection')
                                            button.css({
                                                backgroundColor: 'rgb(12,96,42)'
                                            })
                                            console.log('Массив ссылок сохранен в локальном хранилище.', existingLinksArray);
                                        })
                                    }

                                })

                            }
                        })
                        setTimeout(function() {
                            popover.remove()
                        }, 2000)

                    }
                })
            })
        }
    })
}

function appendMyButton() {
    if ($('.btn-add').length > 0) {
    } else {
        myButton()
    }
}
setInterval(appendMyButton, 1000)