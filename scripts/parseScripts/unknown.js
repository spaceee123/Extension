$(window).on('load', function() {
    let ad_name = $("h1").text()
    let photos = $.makeArray($("img").map(function() {
        if ($(this).width() >= 800 && $(this).height() >=600){
            console.log($(this).width())
            return $(this).attr('src');
        }
    }))
    let ad_url = window.location.href
    console.log("мое", ad_name, photos)
})