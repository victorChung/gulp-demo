
    $(function(){
      var swiper = new Swiper('.swiper-container', {
        autoplay: true,
        loop: true,
        slidesPerView: 3,
        direction : 'vertical',
      });
      var unbug = 'sdf';
      $('.summary-actions>ul>li>a').click(()=>{
        $('.summary-actions>ul>li>a.active').removeClass('active')
        $(this).addClass('active')
        var idx = $('.summary-actions>ul>li').index($(this).parent())
        if(idx != undefined){
          $('.summary-box').hide()
          $('.summary-box').eq(idx).css('display', 'flex')
        }
      })
    })