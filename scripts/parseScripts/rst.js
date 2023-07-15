if (window.location.href.includes('oldcars') !== 1) {
    var button = $('<button class="btn-add"> <img class="icon" src="https://carinspect.org/extention/icon_preview_rev_1.png" width="35" alt="nf"></button>')

    button.css({
        display: 'flex',
        marginTop: 5,
        cursor: 'pointer',
        justifyContent: "center",
        alignItems: "center",
        width: 190,
        height: 40,
        backgroundColor: '#07b74a',
        borderRadius: 5,
        color: 'white',
        borderColor: 'white',
        alignSelf: "center",
        marginLeft: 40,
    })
    chrome.storage.local.get(['linksArray'], (result) => {
        const linksArray = result.linksArray || []
        const foundLinks = linksArray.find((link) => link.url.includes(window.location.href))

        console.log('found', foundLinks)
        if (foundLinks !== undefined) {
            $('.btn-add').append($('<p> Update Inspection </p>'))
            button.css({
                backgroundColor: 'rgb(12,96,42)'
            })
        } else {
            $('.btn-add').append($('<p> Create Inspection </p>'))
            button.css({
                backgroundColor: 'rgb(17,182,75)'
            })
        }
    })
    $('div.tel-body.my-auto').append(button)

    var popover = $('<div class="popover"><p class="extension_popover_text_successful"></p></div>')
    popover.find('.extension_popover_text_successful').css({
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        zIndex: 10000000001,
    });

    popover.css({
        position: "absolute",
        textAlign: 'center',
        left: "145px",
        top: '240px',
        width: '130px',
        height: '30px',
        color: 'white',
        borderRadius: 5,
        zIndex: 10000000000,
    })

    $(document).off('click', '.btn-add').on('click', '.btn-add', function (inp) {

        let ad_name = $("h2.fs-5.mb-3").text().replace(/\//g, ' ')
        let vin = ''
        let price = parseInt($("div.pr.col-6.p-0 b").clone().children().remove().end().text().replace(/\D/g, ""))
        let currency = "USD"
        let currency_symbol = "$"
        let mileage = parseInt($("li[title$='пробiг']").first().text().replace(/\D/g, ""))
        let mileage_units = 'km'
        let ad_url = window.location.href
        let ad_platfotm = 'rst.ua'

        let ad_external_id = parseInt($("div.h.p-3.ps-md-4.border-bottom.border-grey.position-relative").attr("data-bid"))
        let id_img_array = $(".min-imgs.col-6.col-lg-12.px-0").attr('data-i').split(",").map(Number)
        let ad_images = id_img_array.map(id => $(".min-imgs.col-6.col-lg-12.px-0").attr('data-url').replace("{0}", id))

        let additional_data = []
        let index = 10
        $("ul.col-12.col-sm-6.ps-5.pe-0.px-sm-0.ps-lg-1.list-unstyled.my-4 li").each(function() {
            additional_data.push({key: $(this).attr("title"),value: $(this).text(), sort: index})
            index+=10
        })
        additional_data.push({key: $("ul.col-12.col-sm-6.p-0.ps-5.list-unstyled.mt-4.mb-0.mb-sm-4 li").attr("title"), value: $("ul.col-12.col-sm-6.p-0.ps-5.list-unstyled.mt-4.mb-0.mb-sm-4 li").text(), sort: index})

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

        chrome.storage.local.get(['userToken'], function (result) {
            if (result.userToken !== undefined && result.userToken !== null && result.userToken !== '') {
                chrome.storage.local.get(['linksArray'], (linksResult) => {
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
                })

                $('div.tel-body.my-auto').append(popover)
                setTimeout(function() {
                    popover.remove()
                }, 2000)
            }
        })
    })
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

    if (data === 'error') {
        $('.extension_popover_text_successful').text('Not Successful!')
        popover.css({
            backgroundColor: 'rgba(183,48,48,0.75)'
        })
    } else {
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