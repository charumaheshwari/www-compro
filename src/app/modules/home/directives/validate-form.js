(function() {
  'use strict';

  angular.module('app.home')
    .directive('validateForm', validateForm);
  
  validateForm.$inject = ['$rootScope', 'jQuery', '$timeout', '$state'];
  function validateForm($rootScope, jQuery, $timeout, $state){
    return {
            restrict: 'A',
            link: function (scope, form, attributes) {         

                var validateOptions = {
                    rules: {},
                    messages: {},
                    highlight: function (element) {
                        jQuery(element).closest('.form-group').removeClass('has-success').addClass('has-error');
                    },
                    unhighlight: function (element) {
                        jQuery(element).closest('.form-group').removeClass('has-error').addClass('has-success');
                    },
                    errorElement: 'span',
                    errorClass: 'help-block',
                    errorPlacement: function (error, element) {
                        if (element.parent('.input-group').length) {
                            error.insertAfter(element.parent());
                        } else {
                            error.insertAfter(element);
                        }
                    }
                };
                form.find('[data-validate-input], [validate-input]').each(function () {
                    var $input = jQuery(this), fieldName = $input.attr('name');

                    validateOptions.rules[fieldName] = {};

                    if ($input.data('required') !== undefined) {
                        validateOptions.rules[fieldName].required = true;
                    }
                    if ($input.data('email') !== undefined) {
                        validateOptions.rules[fieldName].email = true;
                    }

                    if ($input.data('maxlength') !== undefined) {
                        validateOptions.rules[fieldName].maxlength = $input.data('maxlength');
                    }

                    if ($input.data('minlength') !== undefined) {
                        validateOptions.rules[fieldName].minlength = $input.data('minlength');
                    }

                    if($input.data('message')){
                        validateOptions.messages[fieldName] = $input.data('message');
                    } else {
                        angular.forEach($input.data(), function(value, key){
                            if(key.search(/message/) === 0){
                                if(!validateOptions.messages[fieldName]) {
                                    validateOptions.messages[fieldName] = {};
                                }

                                var messageKey = key.toLowerCase().replace(/^message/,'');
                                validateOptions.messages[fieldName][messageKey] = value;
                            }
                        });
                    }
                });
                form.validate(validateOptions);
            }
        };
  }
})();
