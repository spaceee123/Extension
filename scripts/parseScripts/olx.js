
if (window.location.href.includes('obyavlenie') && $("ol.css-xv75xi li:eq(1)").text() === 'Авто'){
    $(document).ready(function() {
        var button = $('<button class="btn-add"> ' +
            '<img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf">' +
            '<p class="my_btn_text"></p>' +
            '</button>')

        button.css({
            display: 'flex',
            marginTop: 5,
            justifyContent: "center",
            alignItems: "center",
            cursor: 'pointer',
            width: 190,
            minWidth: 190,
            height: 40,
            backgroundColor: '#07b74a',
            borderRadius: 5,
            color: 'white',
            borderColor: 'white',
            fontSize: 18,
            fontFamily: 'Arial,Helvetica,sans-serif'
        })



        $(window).on('load', function() {
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

            $('div.css-sg1fy9:eq(1)').append(button)
        })


        var popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
        popover.find('.extension_popover_text_successful').css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 0,
            marginTop: 5,
        });
        popover.css({
            position: "absolute",
            textAlign: 'center',
            left: '610px',
            top: '760px',
            width: '130px',
            height: '30px',
            color: 'white',
            borderRadius: 5,
            zIndex: 100000000000000000000,
        })


        $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {
            let ad_name = $(".css-1soizd2.er34gjf0").text()
            let vin = ''
            let price = parseInt($(".css-ddweki.er34gjf0").text().replace(/\D/g, ""))
            let currency_text = $('.css-ddweki.er34gjf0').text()
            let currency
            let currency_symbol
            if (currency_text.includes('$')){
                currency = 'USD'
                currency_symbol = currency_text.replace(/\d+/g, '').trim()
            }else{
                currency = currency_text.replace(/\d+/g, '').trim()
                currency_symbol = '₴'
            }

            let mileage_text = $('p:contains("Пробег"), p:contains("Пробіг")').text()
            let mileage = (mileage_text.includes('тис') || mileage_text.includes('тыс')) ? parseInt(mileage_text.replace(/\D/g, "") + '000') : parseInt(mileage_text.replace(/\D/g, ""))
            let mileage_units = 'km'
            let ad_url = window.location.href
            let ad_platfotm = 'olx.ua'
            let ad_external_id = parseInt($("span.css-12hdxwj.er34gjf0").text().replace(/\D/g, ""))

            let additional_data = []
            let index = 10
            $("ul.css-sfcl1s li").each(function(){
                const item = $(this).text().split(':')
                if (item){
                    additional_data.push({key: item[0]?.trim(),value: item[1]?.trim(), sort: index})
                    index+=10
                }
                if(item[0]?.trim().includes("VIN")){
                    vin = item[1]?.trim()
                }

            })


            const ad_images = $.makeArray($(".swiper-wrapper:first .swiper-slide.css-1915wzc img").map(function() {
                return $(this).attr('src');
            }));

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





                    $('.btn-add').parent().prepend(popover);
                    setTimeout(function() {
                        popover.remove()
                    }, 2000)

                }
            })
        })
    })
}