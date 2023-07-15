$(window).on('load', function() {
    if (window.location.href.includes('auto-occasion-annonce')) {

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
            fontFamily: 'Arial,Helvetica,sans-serif',
            marginLeft: 90,
            marginRight: 90,
            marginTop: 20
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

        $('.SummaryInformation_summaryInformation__qJ5TR').append(button)

        let popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
        popover.find('.extension_popover_text_successful').css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            marginTop: 7,
            fontFamily: 'Arial,Helvetica,sans-serif',
        })

        popover.css({
            position: "absolute",
            textAlign: 'center',
            left: '142px',
            bottom: '420px',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 10000000000,
        })

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

            let ad_name = $('.Text_Text_text.SummaryInformation_title__5CYhW.Text_Text_headline2:first').text()
            let vin = ''
            let price = parseInt($('span.PriceInformation_classifiedPrice__b-Jae').text().replace(/\D/g, ""))
            let currency = 'EUR'
            let currency_symbol = $('span.PriceInformation_classifiedPrice__b-Jae').text().replace(/\d+/g, '').trim()
            let mileage
            let mileage_units = 'km'
            $('.SummaryInformation_information__pf4ga .Text_Text_text.Text_Text_body2').each(function (){
                if($(this).text().includes('km')){
                    mileage = parseInt( $(this).text().replace(/\D/g, ""))
                }
            })
            let ad_url = window.location.href
            let ad_platfotm = 'lacentrale.fr'
            let ad_external_id = parseInt( window.location.href.match(/-([\d]+)\.html$/)[1])

            let index = 0
            let additional_data = $.makeArray($('.GeneralInformation_section__yS6K9 ul li').map(function (){
                index+=10
                return {
                    key: $(this).find('.Text_Text_text.Text_Text_subtitle2').text(),
                    value: $(this).find('.Text_Text_text.Text_Text_body1').text() || $(this).find('.Item_content__Xyd3d').text(),
                    sort: index}
            }))



            let ad_images = $.makeArray($(".swiper-wrapper .swiper-slide").map(function() {
                let srcset = $(this).find('img').attr("data-srcset")
                if (srcset !== undefined){
                    let urls = srcset?.split(", ")
                    return urls[urls?.length - 1]
                }
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
                                    $('.btn-add').parent().prepend(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
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