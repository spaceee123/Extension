$(window).on('load', function() {
    if (window.location.href.includes('angebote')
        || window.location.href.includes('annunci')
        || window.location.href.includes('anuncios')
        || window.location.href.includes('offres')
        || window.location.href.includes('aanbod')
        || window.location.href.includes('objava')
        || window.location.href.includes('nabidky')
        || window.location.href.includes('offers')
        || window.location.href.includes('ponude')
        || window.location.href.includes('oferta')
        || window.location.href.includes('oferte')
        || window.location.href.includes('predlozheniya')
        || window.location.href.includes('teklifler')
        || window.location.href.includes('proposyzii')
        || window.location.href.includes('ajanlat')
        || window.location.href.includes('erbjudanden')) {


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
    $('.StageTitle_modelVersion__Rmzgd').append(button)

    let popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
    popover.find('.extension_popover_text_successful').css({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 0,
        fontSize: 16,
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
            let ad_name = $('.StageTitle_boldClassifiedInfo__L7JmO').text()
            let vin = ''
            let price = parseInt($('.PriceInfo_price__JPzpT').clone().children().remove().end().text().replace(/\D/g, ""))
            let currency = 'EUR'
            let currency_symbol = '€'
            let mileage = parseInt( $('.VehicleOverview_itemText__V1yKT').first().text().replace(/\D/g, ""))
            let mileage_units = 'km'
            let ad_url = window.location.href
            let ad_platfotm = 'autoscout24.com'
            let ad_external_id = '' //todo: не понятно где id

            let index_count = 0
            let additional_data = []
            $('.DetailPage_slicesContainer__wHHae .DetailsSection_container__kJAVE.DetailsSection_breakElement__ODImO dl.DataGrid_defaultDlStyle__969Qm').map(function () {

                let dtElements = $(this).find('dt.DataGrid_defaultDtStyle__yzRR_');
                let ddElements = $(this).find('dd.DataGrid_defaultDdStyle__29SKf.DataGrid_fontBold__r__dO');

                dtElements.each(function(index) {
                    index_count+=10
                    additional_data.push({
                            key: $(this).text(),
                            value: ddElements.eq(index).text(),
                            sort: index_count
                    })
                })
            })

            let ad_images = $('.image-gallery-thumbnails-container .image-gallery-thumbnail img').map(function (){
                return $(this).attr('src').replace('120x90.jpg', '1280x960.jpg')
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
                                    $('.StageTitle_modelVersion__Rmzgd').append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.StageTitle_modelVersion__Rmzgd').append(popover)
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
                                    $('.StageTitle_modelVersion__Rmzgd').append(popover)
                                }else{
                                    popover.find('.extension_popover_text_successful').text("Successful!")
                                    popover.css({
                                        backgroundColor: 'rgba(59,183,48,0.75)'
                                    })
                                    $('.StageTitle_modelVersion__Rmzgd').append(popover)
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



                    })



                    // $('.btn-add').parent().prepend(popover);
                    setTimeout(function() {
                        popover.remove()
                    }, 2000)

                }
            })
        })
    }
})