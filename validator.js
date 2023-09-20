// đối tượng 'validator'
function Validator (option) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};


    function validate(inputElement, rule) {

        //ham thuc hien validate
        var errorElement = getParent(inputElement, option.formGroundSelector).querySelector(option.errorSelector)
        var errorMessage;

        // lay ra cac rules cua selector
        var rules = selectorRules[rule.selector];

        // lap qua tung rule va kiem tra
        //neu co loi thi dung viec kiem tra 
        for ( var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break; 
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, option.formGroundSelector).classList.add('invalid')
        } else {
            errorElement.innerText = '';
            getParent(inputElement, option.formGroundSelector).classList.remove('invalid')
        }

        return ! errorMessage;

    }
    //lay element cua form can validate
    var formElement = document.querySelector(option.form);
    if (formElement){
        // khi submit form 
        formElement.onsubmit = function (e) {
            e.preventDefault();

            // ktra 
            var isFormValid = true;

            // lap qua tung rules va` validate
            option.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });
                        
            if (isFormValid) {
                //truong hop submit voi jvscript
                if (typeof option.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    
                    var formValues = Array.from(enableInputs).reduce(function(values, input) {
                        values[input.name] = input.value;
                        return values;
                    }, {});

                    option.onSubmit(formValues);
                }
                //truong hop submit voi hanh vi mac dinh
                else {
                    formElement.submit();
                }
            }

        }

        //xu ly lap qua rule va xu li( lang nghe su kien blur, input,..)
        option.rules.forEach(function (rule) {

            //luu lai cac ryles cho moi input

            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            // selectorRules[rule.selector] = rule.test

            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // xử lí trường hợp blur ra khởi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }
                // xử lí mỗi khi người dùng nhập vào input
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, option.formGroundSelector).querySelector('.form-message')
                    errorElement.innerText = '';
                    getParent(inputElement, option.formGroundSelector).classList.remove('invalid')
                }

            }
        } );
    }
}

// Định nghĩa rules
// nguyen tac cau rules:
// 1 khi co loi => tra ra messae loi
// 2 khi hop le => khong tra ra j ca (undefined)
Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này' // viết 1 dòng của if else, trim() loại bỏ khoảng trống ở 2 đầu.
        }
    };
}

Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'trường hợp này phải là email'
        }
    };
}

Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `vui lòng nhập tối thiểu ${min} kí tự`
        }
    };
}

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'giá trị nhập vào không chính xác'
        }
    }
}