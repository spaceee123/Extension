$(window).on('load', function() {
    if (window.location.href.includes('/pr/')) {
        var button = $('<button class="btn-add"> <img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf"><p class="my_btn_text"></p></button>')

        button.css({
            marginTop: 10,
            display: 'flex',
            justifyContent: "center",
            cursor: 'pointer',
            alignItems: "center",
            width: 200,
            height: 40,
            backgroundColor: '#07b74a',
            borderRadius: 5,
            border:"none",
            color: 'white',
            fontSize: 16,
            fontFamily: 'Arial,Helvetica,sans-serif',
            lineHeight: 'normal',
            marginBottom: 10,
        })

        chrome.storage.local.get(['linksArray'], (result) => {
            const linksArray = result.linksArray || []
            const foundLinks = linksArray.find((link) => link.url.includes(window.location.href))

            console.log('found', foundLinks)
            if (foundLinks !== undefined) {
                button.find('.my_btn_text').text('Update Inspection')
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
            $('.min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0').append(button);
        }, 1000)



        let popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
        popover.find('.extension_popover_text_successful').css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            fontSize: 14,
            fontFamily: 'Arial,Helvetica,sans-serif'
        })

        popover.css({
            border: 'none',
            marginLeft: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 10000000000,
        })

        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

            let ad_name =  $('span.d-flex.ml-12px.text-gray-500').parent().clone().children().remove().end().text()
            let vin = ''
            let price = parseInt( $('.sticky-side.d-flex.flex-column.justify-content-between.flex-shrink-0.w-m-240px.h-m-510px.px-20px.pb-20px.pt-20px.bg-white.border-radius-16.position-relative .min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0 .d-flex.align-items-center .d-flex.flex-column.w-100 .d-flex.align-items-center .d-inline-flex.align-items-center.font-size-28.line-height-1.text-gray-800.font-bold').text().replace(/\D/g, ""))
            let currency = ''
            let currency_symbol = ''
            if ($('.sticky-side.d-flex.flex-column.justify-content-between.flex-shrink-0.w-m-240px.h-m-510px.px-20px.pb-20px.pt-20px.bg-white.border-radius-16.position-relative .min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0 .d-flex.align-items-center .d-flex.flex-column.w-100 .d-flex.align-items-center .position-relative.tooltip-parent .d-flex span.d-flex.align-items-center.justify-content-center.w-24px.h-24px.rounded-circle.cursor-pointer').eq(0).hasClass('bg-transparent')) {
                currency = 'GEL'
                currency_symbol = '₾'
            } else {
                currency = 'USD'
                currency_symbol = '$'
            }

            let mileage = 0
            let mileage_units = 'km'

            let ad_url = window.location.href
            let ad_platfotm = 'myauto.ge'
            let ad_external_id = $('.d-flex.align-items-center.text-blue-250.font-size-12.font-medium.text-nowrap').text().replace(/\D/g, "")

            let index_count = 0
            let additional_data = $('.d-flex.flex-column.w-100.bg-white.border-radius-12.mb-16px.mb-lg-0 .detail-row.d-flex.align-items-center.font-size-13.px-sm-24px.px-16px.py-8px').map(function (index){
                index_count+=10
                if (index === 4){
                    mileage = parseInt( $(this).find('.w-50.w-md-60.text-gray-800').text().replace(/\D/g, ""))
                }
                return{
                    key: $(this).find('.w-50.w-md-40.text-gray-850').text(),
                    value: $(this).find('.w-50.w-md-60.text-gray-800').text(),
                    sort: index_count
                }
            }).toArray()


            let ad_images = $('.d-flex.flex-lg-column.w-100.mx-n4px.mx-lg-0.my-lg-n4px img').map(function (){
                return $(this).attr('src').replace('thumbs', 'large')
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
                                    $('.min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0').append(popover)

                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0').append(popover)
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
                                    $('.min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0').append(popover)

                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.min-height-m-64px.position-relative.d-flex.flex-m-column.justify-content-between.align-items-center.align-items-m-start.mb-12px.mb-m-0').append(popover)
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