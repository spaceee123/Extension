$(window).on('load', function() {
    if (window.location.href.includes('id=')){
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
                    backgroundColor: 'rgb(12,96,42)'
                })
            } else {
                $('.my_btn_text').text('Create Inspection')
                button.css({
                    backgroundColor: 'rgb(17,182,75)'
                })
            }
        })

        $('#main-cta-box').append(button)

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
            left: "80px",
            top: isTopCount ? '445px' : '426px',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 10000000000,
        })

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {


            let ad_name = $('#ad-title').text()
            let vin = ''

            var elementsWithText = $("body").find("*").filter(function() {
                return $(this).text().includes("Fahrgestellnummer")
            })

            elementsWithText.each(function() {
                if ($(this).text().length < 50){
                    //vin = $(this).text()
                }
            })
            let price = parseInt($("span.h3").text().replace(/\D/g, ""))

            let currency = 'EUR'
            let currency_symbol = '€'
            let mileage = parseInt( $(".key-feature.key-feature--mileage .key-feature__value").text().replace(/\D/g, ""))
            let mileage_units = 'km'
            let ad_url =  window.location.href
            let ad_platfotm = 'mobile.de'
            let params = new URLSearchParams(window.location.href.split('?')[1])
            let ad_external_id = params.get("id")
            let ad_imag = $.makeArray($(".gallery-img-wrapper.u-flex-centerer.slick-slide.slick-cloned img").map(function() {
                return $(this).attr('data-overlay-src')
            }))
            let ad_images = Array.from(new Set(ad_imag)).sort()
            let index = 0
            let additional_data = $.makeArray($(".g-row.u-margin-bottom-9").map(function() {
                index+=10
                return {
                    key: $(this).find('.g-col-6').eq(0).text(),
                    value: $(this).find('.g-col-6').eq(1).text(),
                    sort: index}
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
                                    $('.extension_popover_text_successful').text('Not Successful!')
                                    popover.css({
                                        backgroundColor: 'rgba(183,48,48,0.75)'
                                    })
                                }else{
                                    $('.extension_popover_text_successful').text('Successful!')
                                    $('.btn-add').parent().prepend(popover);
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
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
                                    $('.extension_popover_text_successful').text('Not Successful!')
                                    popover.css({
                                        backgroundColor: 'rgba(183,48,48,0.75)'
                                    })
                                }else{
                                    $('.extension_popover_text_successful').text('Successful!')
                                    $('.btn-add').parent().prepend(popover);
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })


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
                }
            })

        })

    }
})