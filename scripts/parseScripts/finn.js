//todo: https://www.finn.no/car/used/ad.html?finnkode=304099631 как вытащить цену
$(window).on('load', function () {
    if (window.location.href.includes('car') && window.location.href.includes('finnkode')) {

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

        $('.panel:eq(3)').append(button)

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

            let ad_name = $('h1.u-t2.u-word-break').text()
            let vin = $('dl.list-descriptive.u-col-count2.u-col-count3from990 div:contains("Chassis nr. (VIN)")').find('dd').text().trim() || ''
            let price_text
            let price
            let currency = 'kr'
            if (document.getElementById('horseshoe-config') !== null){
                price_text = JSON.parse(document.getElementById('horseshoe-config').textContent).xandr.feed.pris
                price = parseInt(price_text)
            }else{
                price_text = $("div#tjm-ad-entry h2").text() || $('.flex-wrapper__unit span.u-t3').text()
                price = parseInt(price_text.replace(/\D/g, ""))
            }


            let currency_symbol = 'kr'
            let mileage_text = $('.panel.panel--bleed.summary-icons .grid.grid--cols2to4.t-grid .grid__unit.u-pa8:eq(1) div.u-strong').text() || $('.grid.grid--cols2to4.t-grid .grid__unit.u-pa8:eq(1) div.u-strong').text()
            let mileage = parseInt(mileage_text.replace(/\D/g, "").replace(/\s/g, ''))
            let mileage_units = mileage_text.replace(/\d+/g, '').trim()
            let ad_url = window.location.href
            let ad_platfotm = 'finn.no'
            let params = new URLSearchParams(window.location.href.split('?')[1])
            let ad_external_id = params.get("finnkode")

            let index = 0
            let additional_data = $('dl.list-descriptive.u-col-count2.u-col-count3from990 div').map(function() {
                index += 10
                return {
                    key: $(this).find('dt').text().trim(),
                    value: $(this).find('dd').text().trim(),
                    sort: index
                }
            }).toArray()

            let ad_images = $("div.u-display-none img").map(function (){
                return $(this).attr('data-src')
            }).toArray()


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

                        // $('.btn-add').parent().prepend(popover);
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