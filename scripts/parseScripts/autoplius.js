$(window).on('load', function() {
    if (window.location.href.includes('skelbimai')){
         $('.parameter-row-price:first').css({
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
        })
        var button = $('<button class="btn-add"> <img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf"><p class="my_btn_text"></p></button>')

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

        $('.parameter-row-price:first').append(button)

        let popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
        popover.find('.extension_popover_text_successful').css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            marginTop: 5,
        })

        popover.css({
            position: "absolute",
            textAlign: 'center',
            left: '188px',
            top: '54px',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 10000000000,
        })

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

            let vin = ''
            let ad_name = $('.col-8.page-title h1').text()
            let price = parseInt( $('.price:first').text().replace(/\D/g, ""))
            let currency = 'EUR'
            let currency_symbol = $('.default-currency:first').text()
            let mileage = 0
            let mileage_units = 'km'
            let ad_url = window.location.href
            let ad_platfotm = 'autoplius.lt'
            let ad_external_id  = $('span.announcement-id').text().replace('ID: ', '')

            let index = 0
            let targetDiv = $(".col-5").find("div:not([class]):not([id])")
            let additional_data = $.makeArray(targetDiv.find(".parameter-row").map(function() {
                if ($(this).find(".parameter-label").text().trim().includes('VIN')){
                    vin = $(this).find(".parameter-label").text().trim()
                }
                if($(this).find(".parameter-label").text().trim().includes('Rida')
                    || $(this).find(".parameter-label").text().trim().includes('Пробег')
                    || $(this).find(".parameter-label").text().trim().includes('Mileage')
                    || $(this).find(".parameter-label").text().trim().includes('Nobraukums')){
                    mileage = parseInt($(this).find(".parameter-value").text().replace(/\D/g, ""))
                }
                index+=10
                return {
                    key: $(this).find(".parameter-label").text().trim(),
                    value: $(this).find(".parameter-value").text().trim(),
                    sort: index
                }
            }))

            let ad_images = []

            $('div.col-7 script').each(function() {
                let scriptContent = $(this).html()

                if (scriptContent.includes('var mediaGalleryItems')) {

                    let startIndex = scriptContent.indexOf('[{')
                    let endIndex = scriptContent.lastIndexOf('}]') + 2
                    let json = scriptContent.substring(startIndex, endIndex)

                    let mediaGalleryItems = JSON.parse(json)
                    ad_images = mediaGalleryItems.map(i => i.url)
                    return false
                }
            })

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
                                    $('.btn-add').parent().prepend(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.btn-add').parent().prepend(popover)

                                }

                            })
                        } else {
                            fetch(`https://api.carinspect.org/uk/online-inspections/add?api_token=${result.userToken}`, {
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
                                    $('.btn-add').parent().prepend(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.btn-add').parent().prepend(popover)

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





                }
            })

        })
    }
})