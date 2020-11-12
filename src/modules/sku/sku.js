$(function(){
  $(document).on('click', '.sku-block .sku-inline .sku-item', function(){
    if($(this).hasClass('disabled')) return
    if($(this).hasClass('active')) {
      $(this).removeClass('active')
      return
    }
    $(this).parent().children('.sku-item').removeClass('active')
    $(this).addClass('active')
  })
})