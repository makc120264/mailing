$(document).ready(function () {
    addAgeValue();
    addCountriesValue();
    getMenOnline();
    updateMenOnline();
    $('#send_mailing').on('click', mailing);
});

function mailing() {
    let mailingList, i, stop;
    mailingList = getMailingList();
    if (mailingList) {
        i = 0;
        stop = true;

        function send() {
            if (i < mailingList.length) {
                i++;
                sendingMessage(mailingList[i]);
                setTimeout(send(), 10000);
            } else {
                stop = false;
            }
        }

        if (stop) {
            send();
        } else {
            return stop;
        }
    } else {
        return mailingList;
    }
}

function sendingMessage(man) {
    let url, sendData, form;
    url = 'https://www.svadba.com/chat/send-message/' + man.id;

    sendData = {
        tag: man.id,
        source: 'lc',
        message: localStorage.getItem('message')
    };

    $.ajax({
        type: "POST",
        url: url,
        data: sendData,
        success: function (resp) {
            // alert(resp);
            // TODO We write the successful result to the log file
        },
        error: function(jqXHR, textStatus, errorThrown){
            // alert(textStatus);
            // TODO We show the user an error and write it to the log file.
        }
    });

}

function getMailingList() {
    let menOnline, form, params, mailingList, ageSelected, countriesSelected, key, isValidForm;
    ageSelected = [];
    countriesSelected = [];
    mailingList = [];
    form = $('form')['0'];
    menOnline = JSON.parse(localStorage.getItem('menOnline'));
    localStorage.setItem('message', form.elements.message.value);

    isValidForm = validateForm(form);

    if (isValidForm) {
        for (key in form.elements.age.selectedOptions) {
            if (typeof form.elements.age.selectedOptions[key].value != 'undefined') {
                ageSelected.push(form.elements.age.selectedOptions[key].value);
            }
        }
        key = 0;
        for (key in form.elements.countries.selectedOptions) {
            if (typeof form.elements.countries.selectedOptions[key].value != 'undefined') {
                countriesSelected.push(form.elements.countries.selectedOptions[key].value);
            }
        }

        params = {
            age: ageSelected,
            countries: countriesSelected
        };

        menOnline.forEach(function (man) {
            // TODO Make country control
            if (inArray(params.age, man.member.age)) {
                mailingList.push(man.member);
            }
        });

        return mailingList;
    } else {
        return isValidForm;
    }
}

function validateForm(form) {
    let result = true;

    if (form.elements.age.selectedOptions.length == 0) {
        alert('Select countries please');
        result = false;
    }
    if (form.elements.message.value == '') {
        alert('Write message please.');
        result = false;
    }

    return result;
}

function getMenOnline() {
    let url, oData;
    url = 'https://www.svadba.com/chat/updates/onlines/everyone/?onlines=99999999999999999';

    $.get(url, function (data) {
        oData = JSON.parse(data);
        localStorage.setItem('menOnline', JSON.stringify(oData['0'].updates));
    });
}

function updateMenOnline() {
    setInterval(function () {
        getMenOnline();
    }, 10000);
}

function addAgeValue() {
    let options = '<option value="0">Choose...</option>';
    for (let i = 18; i < 100; i++) {
        options += '<option value="' + i + '">' + i + '</option>';
    }
    $('#age').html(options);
}

function addCountriesValue() {
    let url, countries, res;
    countries = JSON.parse(localStorage.getItem('countries'));
    if (countries == null) {
        url = 'http://api.geonames.org/countryInfoJSON?username=makc64';
        res = [];

        $.get(url, function (result) {
            result.geonames.forEach(function (country, i) {
                res[i] = country.countryName;
            });

            countries = unique(res).sort();
            localStorage.setItem('countries', JSON.stringify(countries));

            setCountriesOptions(countries);
        });
    } else {
        setCountriesOptions(countries);
    }
}

function setCountriesOptions(countries) {
    let options;
    countries.forEach(function (country) {
        options += '<option value="' + country + '">' + country + '</option>';
    });
    $('#countries').html(options);
}

function inArray(arr, elem) {
    let result = false;
    arr.forEach(function(arrEl){
        if (arrEl == elem) {
            result = true;
        }
    });

    return result;
}

function isEmpty(str) {
    let result;
    if (str.trim() == '') {
        result = true;
    } else {
        result = false;
    }

    return result;
}

function unique(arr) {
    return Array.from(new Set(arr));
}
