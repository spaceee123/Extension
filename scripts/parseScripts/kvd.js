$(window).on('load', function() {
    if (window.location.href.includes('fast-pris') || window.location.href.includes('auktioner')) {
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
            color: 'white',
            fontSize: 16,
            fontFamily: 'Arial,Helvetica,sans-serif'
        })

        chrome.storage.local.get(['linksArray'], (result) => {
            const linksArray = result.linksArray || []
            const foundLinks = linksArray.find((link) => link.url.includes(window.location.href))

            console.log('found', foundLinks)
            if (foundLinks !== undefined) {
                $('.my_btn_text').text('Update Inspection')
                button.css({
                    backgroundColor: 'rgb(12,96,42)'
                })
            } else {
                $('.my_btn_text').text('Create Inspection')
                button.css({
                    backgroundColor: 'rgb(17,182,75)'
                })
            }
        })


        $('.Auction__BidboxContainer-sc-1o651m8-4.fwLGEu').append(button)

        let popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
        popover.find('.extension_popover_text_successful').css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            fontFamily: 'Arial,Helvetica,sans-serif'
        })

        popover.css({
            marginTop: 5,
            marginLeft: 25,
            display: 'flex',
            justifyContent: "center",
            textAlign: 'center',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 10000000000,
        })

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

            let ad_name = $('h3.sc-kgUAyh.Summary__TitleText-sc-q2hqkx-6.kXlTDh.czGotP').text()
            let vin = $('.Facts__List-sc-1wz5p7z-4.gLByAV:eq(1) span.sc-gSAPjG.FactItem__DataWrapper-sc-1q5j9y5-1.cJltTK.JDnqM:first').text()
            let text_price = $('.Bidbox__BiddingPriceValue-sc-mzloik-4.fCulwX').text() || $('.BuyDirect__BuyDirectPriceValue-sc-1dvjsm7-2.xuoNa').text() || $('.BuyDirect__BuyDirectPriceValue-sc-1dvjsm7-2.ApOnh').text()
            let price = parseInt(text_price.replace(/\D/g, ""))
            let currency = text_price.replace(/\d+/g, '').trim()
            let currency_symbol = 'Kč'
            let text_mileage = $('span.Summary__Spec-sc-q2hqkx-3.fFlYJU:eq(1)').text()
            let mileage = parseInt( text_mileage.replace(/\D/g, ""))
            let mileage_units = text_mileage.replace(/\d+/g, '').trim()
            let ad_url = window.location.href
            let ad_platfotm = 'kvd.se'
            let ad_external_id = $('.sc-gSAPjG.Social__Label-sc-1c6s525-4.cJltTK.ewcSGh:eq(1)').text()

            let index = 0
            let additional_data = $.makeArray($('.Facts__Content-sc-1wz5p7z-2.ktThQy ul li').map(function (){
                index+=10
                return{
                    key: $(this).find('span.sc-fnykZs.kOPGld').text(),
                    value:$(this).find('span.sc-gSAPjG.FactItem__DataWrapper-sc-1q5j9y5-1.cJltTK.JDnqM').text(),
                    sort: index
                }
            }))

            let ad_images = $('.image-gallery-slides .image-gallery-slide').map(function() {
                return $(this).find('picture source:first').attr('srcset')
            }).get()


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
                                    $('.btn-add').parent().append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.btn-add').parent().append(popover)
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
                                    $('.btn-add').parent().append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.btn-add').parent().append(popover)

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

                        $('.btn-add').parent().prepend(popover);
                        setTimeout(function() {
                            popover.remove()
                        }, 2000)

                    })




                    setTimeout(function() {
                        popover.remove()
                    }, 2000)

                }
            })


        })

    }
})