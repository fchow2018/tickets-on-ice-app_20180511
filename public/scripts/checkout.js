$(document).ready(function() {
    $('#cc_number')
        .formValidation({
            framework: 'bootstrap',
            icon: {
                valid: 'fa fa-check',
                invalid: 'fa fa-times',
                validating: 'fa fa-refresh'
            },
            fields: {
                cardType: {
                    validators: {
                        notEmpty: {
                            message: 'The type is required'
                        }
                    }
                },
                cc: {
                    validators: {
                        notEmpty: {
                            message: 'The credit card number is required'
                        },
                        creditCard: {
                            message: 'The credit card number is not valid'
                        }
                    }
                }
            }
        })
        .on('success.validator.fv', function(e, data) {
            // data.field     ---> The field name
            // data.validator ---> The validator name
            // data.fv        ---> The plugin instance

            // Whenever user changes the card type,
            // we need to revalidate the credit card number
            if (data.field === 'cardType') {
                data.fv.revalidateField('cc');
            }

            if (data.field === 'cc' && data.validator === 'creditCard') {
                // data.result.type can be one of
                // MAESTRO, MASTERCARD, SOLO, UNIONPAY, VISA

                var currentType = null;
                switch (data.result.type) {
                    case 'MASTERCARD':

                    case 'VISA':
                        currentType = 'Visa';       // Visa is the value of Visa card in the select box
                        break;

                    default:
                        break;
                }

                // Get the selected type
                var selectedType = data.fv.getFieldElements('cardType').val();
                if (selectedType && currentType !== selectedType) {
                    // The credit card type doesn't match with the selected one
                    // Mark the field as not valid
                    data.fv.updateStatus('cc', data.fv.STATUS_INVALID, 'creditCard');
                }
            }
        });
});
