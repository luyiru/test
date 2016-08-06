$(function(){
    var $container = $('#container'),
        loading = false,
        currentVideoInterval,
        $loader = $('<div class="loader"></div>').hide();
    function classToggle($elem, className) {
        $('.' + className).removeClass(className);
        $elem.addClass(className);
        if (className == 'loading') {
            $('.loader').remove();
            $elem.append($loader);
            $loader.fadeIn(400);
        }
    }
    function openItem() {
        var $elem = $(this),
            $openContent = $(".item.open .content"),
            $content = $elem.children('.content'),
            imageURL = $content.attr('image-id'),
            videoId = $content.attr('video-id'),
            videoWidth = $content.attr('width-id'),
            videoHeight = $content.attr('height-id'),
            $slider = $content.parent().find(".seek");
        $playpause = $slider.siblings(".playpause");
        $openContent.tubeplayer("pause");
        if (loading) { console.log('still loading, returning'); return };
        if (imageURL) {
            $content.html('<img src="' + imageURL + '" />');
            classToggle($elem, 'loading');
            loading = true;
        }
        if (videoId) {
            $content.css({'width' : videoWidth, 'height' : videoHeight}); //resizing content area for isotope
            $content.tubeplayer({
                initialVideo: videoId,
                width: videoWidth,
                height: videoHeight,
                showControls: 0,
                modestbranding: true,
                iframed: false, //Stops buggy behaviour with iframe version and isotope
                onPlayerPlaying: sliderPlaying,
                allowFullScreen: false,
                onPlayerPaused: function() {
                    clearInterval(currentVideoInterval);
                    $playpause.removeClass('playing');
                }
            });
            function sliderPlaying() {
                lightsOff($elem, true);
                $playpause.addClass('playing');
            }
            $slider.on("slidestop", function(event, ui){
                var sliderPos = $(this).slider( "option", "value" ),
                    value =  $content.tubeplayer("data");
                $content.tubeplayer("seek", Math.floor(value.duration/100*sliderPos));
            });
            $playpause.off("click").on("click", function() {
                if ($(this).hasClass('playing')) {
                    $content.tubeplayer("pause");
                } else {
                    $content.tubeplayer("play");
                }
            })
        }
        $content.waitForImages( function () {
            loading = false;
            $openContent.tubeplayer("destroy");
            $openContent.parent().find(".seek").slider("option", "value", 0);
            $openContent.parent().find(".playpause").removeClass("playing");
            $('.loading').removeClass('loading');
            $('.loader').remove();
            classToggle($elem, 'open');
            $('.item').off('click', openItem);
            $('.item:not(.open)').on('click', openItem);
            $('.item img').off('click', lightsOff);
            $(".item img").off('mousemove', bulbTip);
            $('.open:not(.info) img').on('click', lightsOff);
            $(".open:not(.info) img").on('mousemove', bulbTip);
            $(".open:not(.info) img").on('mouseout', function() {
                $('#lightbulb').hide();
            });
            $("html").addClass("scrolling");
            $container.isotope('reLayout', function() {
                var position = $elem.data('isotope-item-position'),
                    positionY = position.y - 100;
                containerHeight = $container.height();
                if (positionY < 0) { positionY = 0}
                $("body").scrollTo(positionY, 500, {easing: "easeInOutQuad"})
                $("html").removeClass("scrolling");
            });
        });
    };
    function lightsOff($elem, video) {
        $('.item img').off('mousemove', bulbTip);
        $(".open:not(.info)").on('mouseover', function() {
            $('#lightbulb').hide();
        });
        if (video != true) {
            var $elem = $(this).parents('.item');
        }
        $elem.addClass('lightsOff');
        $('#overlay').show('fade', 'fast', function() {
            $('#lightbulb').hide();
        });
    }
    function lightsOn() {
        $('#overlay').hide('fade', 'fast', function() {
            $('#lightbulb').hide();
            $(".open:not(.info) img").on('mousemove', bulbTip); //Tooltip bulb
        });
        $('.lightsOff').removeClass('lightsOff');
    }
    function bulbTip(e) {
        console.log('bulbtip');
        $('#lightbulb').show().css({
            top: (e.pageY - 15) + "px",
            left: (e.pageX + 15) + "px"
        });
    }
    $('.item:not(.info) h4').each(function() {
        $(this).wrap('<div class="ribbonHead"></div>').after('<div class="ribbonBack"></div>');
    })
    $('.item:not(.info) h5.categories').each(function() {
        $(this).wrap('<div class="ribbonTag" />').after('<div class="ribbonBack"></div>');
    })
    $('.item:not(.info) h5.caption').each(function() {
        $(this).wrap('<div class="ribbonTag ribbonCaption" />').after('<div class="ribbonBack ribbonCaption"></div>');
    })
    $('.item.video h5.caption').each(function() {
        $(this).append('<div class="playpause"></div><div class="seek"></div>');
    })
    $(window).on('mousewheel', function() {
        console.log('scrolling');
        $(window)._scrollable().stop();
    })
    $('#overlay').on('click', lightsOn);
    $('#overlay').on('mousemove', bulbTip);
    $('.item:not(.open)').on('click', openItem);
    $('#nav ul li').on('click', function() {
        var filter = $(this).children('a').attr('data-filter');
        $('.selected').removeClass('selected');
        $(this).addClass('selected');
        $container.isotope({
            filter: '.static' + ' ,' + filter
        }, function() {
            $(window).stop().scrollTo($("#container"), 500, {easing: "easeInOutQuad"});
        })
    });
    $container.isotope({
        masonry: {
            columnWidth: 193
        },
        itemPositionDataEnabled: true,
        transformsEnabled: false
    });
    $(".seek").slider({range: "min", min: 0});
});