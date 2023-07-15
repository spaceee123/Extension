if ($('body').data('auto-id') !== null && $('body').data('auto-id') !== undefined && !window.location.href.includes('newauto')) {

    var button = $('<button class="btn-add"><img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf"><p class="my_btn_text"></p></button>')

    button.css({
        display: 'flex',
        marginTop: 5,
        cursor: 'pointer',
        justifyContent: "center",
        alignItems: "center",
        width: 190,
        height: 40,
        backgroundColor: '#07b74a',
        borderRadius: 5
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


    $('section.price.mb-15.mhide').append(button)

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
        left: "40px",
        top: '305px',
        width: '130px',
        height: '30px',
        color: 'white',
        borderRadius: 5,
        zIndex: 10000000000,
    })


    $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

        let ad_name
        let vin = ''
        let price = 0
        let currency = "USD"
        let currency_symbol = "$"
        let car_price
        let mileage = 0
        let mileage_units = 'km'
        let ad_url = window.location.href
        let ad_platfotm = 'auto.ria.com'
        let ad_external_id = parseInt($('body').data('auto-id'))
        let ad_images = []
        let additional_data = []
        let index = 10

        if (window.location.href.includes('newauto')) {
            ad_name = $('h1.auto-head_title.bold.mb-15').text()

            ad_images = $.makeArray($('#main-image-gallery div picture img')).map(x => ($(x).attr('src').replace('74x56x70.jpg', '620x465x72.jpg')));

            car_price = $('.price_value.price_value--additional').first().text();
            price = parseInt(car_price.replace(/\s/g, '').match(/\d+/));

            mileage = 0

            $('dl.defines_list').find('dt.defines_list_title').each(function (index, element) {
                var title = $(element).text()
                var value = $(element).next('dd.defines_list_value').text().trim()
                additional_data.push({key: title, value: value, sort: index * 10})
            })
        } else {
            ad_name = $('h1.head').text()
            price = parseInt($('.price_value strong').first().text().replace(/\D/g, ""))

            ad_images = $.makeArray($('#photosBlock .carousel-inner img'))
                .map(x => $(x).attr('src').replace('s.jpg', 'f.jpg'))
                .filter(src => !src.includes('youtube.com'))


            mileage = parseInt($('.base-information.bold span.size18').text() + '000')

            $('dl.unstyle').find('dd').each(function () {
                var obj = {}
                var hasLabel = false
                var hasArgument = false

                $(this).find('span.label, span.argument').each(function () {
                    if ($(this).hasClass('label')) {
                        obj.key = $(this).text()
                        hasLabel = true
                    } else if ($(this).hasClass('argument')) {
                        obj.value = $(this).text()
                        hasArgument = true
                    }
                })
                if (hasLabel && hasArgument) {
                    obj.sort = index
                    index += 10
                    let isDuplicate = additional_data.some(function (item) {
                        return item.key === obj.key && item.value === obj.value
                    })

                    if (!isDuplicate) {
                        additional_data.push(obj)
                    }
                }
            })
        }
        index = 10

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
                        editAdvt(result.userToken, obj, foundLinks.id).then((data) => {
                            console.log(data)
                            changeSuccessText(data)
                        })
                    } else {
                        postNewAdvt(result.userToken, obj).then((data) => {
                            console.log(data)
                            changeSuccessText(data, true, existingLinksArray, ad_url)
                        })
                    }

                    $('.btn-add').parent().prepend(popover);
                    setTimeout(function() {
                        popover.remove()
                    }, 2000)
                })

            } else {

            }
        });
    });
}


const postNewAdvt = async (token, obj) => {

    const apiUrl = `https://api.carinspect.org/uk/online-inspections/add?api_token=${token}`
    const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(obj),
        Accept: 'application/json',
    })
    if (response.ok) {
        return await response.json()
    } else {
        return 'error'
    }

}

const editAdvt = async (token, obj, id) => {

    const apiUrl = `https://api.carinspect.org/uk/online-inspections/edit/${id}?api_token=${token}`
    const response = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify(obj),
        Accept: 'application/json',
    })
    if (response.ok) {
        return await response.json()
    } else {
        return 'error'
    }

}

const changeSuccessText = (data, post = false,  existingLinksArray = [], ad_url = '') => {
    if (data === 'error'){
        $('.extension_popover_text_successful').text('Not Successful!')
        popover.css({
            backgroundColor: 'rgba(183,48,48,0.75)'

        })
    }else{
        $('.extension_popover_text_successful').text('Successful!')
        popover.css({
            backgroundColor: 'rgba(59,183,48,0.75)'
        })
        if (post){
            existingLinksArray.push({id: data.id, url: ad_url})

            chrome.storage.local.set({ linksArray: existingLinksArray }, () => {
                $('.btn-add p').text('Update Inspection')
                button.css({
                    backgroundColor: 'rgb(12,96,42)'
                })
                console.log('Массив ссылок сохранен в локальном хранилище.', existingLinksArray)
            })
        }
    }
}