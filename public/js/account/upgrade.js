/* globals $ */
(function () {

  var $input = $('#coupon_code');
  var $form = $('#stripe_pro_month');
  var originalAction = $form.attr('action');

  $input.on('change', function () {
    'use strict';
    $form.attr('action', originalAction + '?' + $input.val());
  });

  var $couponBtn = $('.coupon-btn');
  $couponBtn.on('click', function (event) {
    event.preventDefault();
    $input.css('visibility', 'visible');
  });

}());
