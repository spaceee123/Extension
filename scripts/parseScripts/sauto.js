$(document).ready( function () {
    if (window.location.href.includes('detail')) {
        var button = $('<button class="btn-add"> <img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf"><p class="my_btn_text"></p></button>')

        button.css({
            marginBottom: 10,
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
                button.find('.my_btn_text').text("Update Inspection")
                button.css({
                    backgroundColor: 'rgb(12,96,42)'
                })
            } else {
                button.find('.my_btn_text').text('Create Inspection')
                button.css({
                    backgroundColor: 'rgb(17,182,75)'
                })
            }
        })

        setTimeout(function() {
            $('.c-a-basic-info:first').prepend(button)
        }, 1000)


        let popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
        popover.find('.extension_popover_text_successful').css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            marginTop: 5,
            fontFamily: 'Arial,Helvetica,sans-serif'
        })

        popover.css({
            position: "absolute",
            left: '48px',
            top: '65px',
            textAlign: 'center',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 10000000000,
        })

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

            let ad_name = $('.c-item-title__name-prefix a:eq(0)').text() + ' ' + $('.c-item-title__name-prefix a:eq(1)').text()
            let vin = $('.c-car-details-section__table-value .c-vin-info__vin').text()
            let price_text = $('.notranslate.c-a-basic-info__price').text()
            let price = parseInt(price_text.replace(/\D/g, ""))
            let currency = 'CZK'
            let currency_symbol = price_text.replace(/\d+/g, '').trim()
            let mileage_text = $('.c-a-basic-info__subtitle-info').text().split(',')
            let mileage = parseInt(mileage_text[2].replace(/\D/g, ""))
            let mileage_units = mileage_text[2].replace(/\d+/g, '').trim()
            let ad_url = window.location.href
            let ad_platfotm = 'sauto.cz'
            let ad_external_id =  window.location.href.match(/\/(\d+)$/)[1]

            let index = 0
            let additional_data = $('div.sds-surface.sds-surface--05.p-uw-item-detail__info.c-car-details .c-car-details-section__table .c-car-details-section__table-row').map(function() {
                let index=+10
                return {
                    key: $(this).find('th.c-car-details-section__table-label').text().trim(),
                    value: $(this).find('td.c-car-details-section__table-value').text().trim(),
                    sort: index
                };
            }).get()

            let ad_images = $('.ob-c-carousel__content .ob-c-carousel__item').map(function () {
                let noscriptContent = $(this).find('noscript').html()
                let $tempElement = $('<div>').html(noscriptContent)
                return $tempElement.find('img').attr('src')
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
                                    $('.btn-add:first').parent().append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.btn-add:first').parent().append(popover)
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
                                    $('.btn-add:first').parent().append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.btn-add:first').parent().append(popover)

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