$(window).on('load', function() {
    if ($("body .otomotopl.detailpage.desktop")){

        var button = $('<button class="btn-add"> <img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" style="margin: 0" width="35" alt="nf"><p class="my_btn_text"></p></button>')
        var popover = $('<div class="btn-add1"><p class="extension_popover_text_successful"></p></div>')

        button.css({
            cursor: 'pointer',
            marginLeft: 55,
            marginRight: 55,
            marginTop: 5,
            display: 'flex',
            justifyContent: "center",
            alignItems: "center",
            width: 190,
            minWidth: 190,
            height: 40,
            backgroundColor: '#07b74a',
            borderRadius: 5,
            color: 'white',
            fontSize: 16,
            fontFamily: 'Arial,Helvetica,sans-serif'
        })
        popover.css({
            marginLeft: 80,
            marginRight: 80,
            marginTop: 5,
            display: 'flex',
            justifyContent: "center",
            alignItems: "center",
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
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

        $('section.seller-card').append(button)

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {


            let ad_name = $(".offer-title.big-text.fake-title").text().trim()
            let vin = ''
            if ($('.offer-params.vin')){
                vin = $('.offer-params.vin span').text()
            }
            let price = parseInt( $('.offer-price__number:first').text().replace(/\D/g, ""))
            let currency = $('.offer-price__currency:first').text()
            let currency_symbol = 'zł'

            let mileage
             $('.offer-params__list:first .offer-params__item').map(function(){
               if( $(this).find('.offer-params__label').text() === 'Przebieg'){
                   mileage = parseInt( $(this).find('.offer-params__value').text().replace(/\D/g, ""))
               }
            })
            let mileage_units = 'km'
            let ad_url = window.location.href
            let ad_platfotm = 'otomoto.pl'
            let ad_external_id = parseInt($('span#ad_id:first').text())
            let index = 0
            let additional_data = $.makeArray($(".offer-params__list .offer-params__item").map(function() {
                index+=10
                return {
                    key: $(this).find('.offer-params__label').eq(0).text(),
                    value: $(this).find('.offer-params__value').text().trim() || $(this).find('.offer-params__value .offer-params__link').text().trim(),
                    sort: index}
            }))
            let ad_images = $.makeArray($(".slick-track:first .slick-slide .photo-item img").map(function() {
                return $(this).attr('src') || $(this).attr('data-lazy');
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
                if (result.userToken !== undefined && result.userToken !== null && result.userToken !== '') {
                    chrome.storage.local.get(['linksArray'], (linksResult) => {
                        console.log('linksArray', linksResult.linksArray)
                        const existingLinksArray = linksResult.linksArray || []
                        const foundLinks = existingLinksArray.find((link) => link?.url.includes(window.location.href))

                        if (foundLinks !== undefined) {
                            fetch(`https://api.carinspect.org/uk/online-inspections/edit/${foundLinks.id}?api_token=${result.userToken}`, {
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
                                    $('section.seller-card').append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('section.seller-card').append(popover)
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
                                    $('section.seller-card').append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('section.seller-card').append(popover)
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



                    $('.btn-add').parent().prepend(popover)
                    setTimeout(function() {
                        popover.remove()
                    }, 2000)

                })
                }
            })


            setTimeout(function() {
                popover.remove()
            }, 2000)

        })

    }
})