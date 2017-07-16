angular.element(function() {
    angular.bootstrap(document, ['WarrantyModule']);
});

angular.module('WarrantyModule', ['angularFileUpload', 'darthwade.loading', 'ngTagsInput', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.select'])

         // Directiva para hacer preview de imágenes
        .directive('ngThumb', ['$window', function($window) {
            var helper = {
                support: !!($window.FileReader && $window.CanvasRenderingContext2D),
                isFile: function(item) {
                    return angular.isObject(item) && item instanceof $window.File;
                },
                isImage: function(file) {
                    var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                    return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
                }
            };

            return {
                restrict: 'A',
                template: '<canvas/>',
                link: function(scope, element, attributes) {
                    if (!helper.support) return;

                    var params = scope.$eval(attributes.ngThumb);

                    if (!helper.isFile(params.file)) return;
                    if (!helper.isImage(params.file)) return;

                    var canvas = element.find('canvas');
                    var reader = new FileReader();

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }

                    function onLoadImage() {
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }
                }
            };
        }])

        .controller('ctrlWarrantyHome', ['$scope', '$http', '$loading', '$uibModal', 'FileUploader', function ($scope, $http, $loading, $uibModal, FileUploader) {
            // Inicio variables
            $scope.device = {};
            $scope.make = {};
            $scope.make.selected = {};
            $scope.model = {};
            $scope.model.selected = {};
            $scope.category = {};
            $scope.category.selected = {};
            $scope.subcategory = {};
            $scope.subcategory.selected = {};
            $scope.device.strSerial = '';
            $scope.device.datDatePurchase = new Date();
            $scope.device.strVendor = '';
            $scope.strSerialClass = 'form-group';
            $scope.modelClass = 'form-group';
            $scope.datDatePurchaseClass = 'form-group';
            $scope.subcategoryClass = 'form-group';
            $scope.strVendorClass = 'form-group';
            // Get Initial Data
            $scope.GetInitialData = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/GetInitialData',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.user = response.data.User;
                        $scope.messages = response.data.Messages;
                        $scope.devices = response.data.Devices;
                    }
                    else if (response.data.Result == 'userExist') {
                        window.location.href = '/home.html';
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            $scope.GetInitialData();
            // Crear nuevo dispositivo
            $scope.NewDeviceRegister = function () {
                var booError = false;
                if ($scope.device.strSerial.trim() == '') {
                    $scope.strSerialClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strSerialClass = 'form-group'
                }
                if (typeof $scope.model.selected.name == 'undefined') {
                    $scope.modelClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.modelClass = 'form-group'
                }
                if (typeof $scope.subcategory.selected.name == 'undefined') {
                    $scope.subcategoryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.subcategoryClass = 'form-group'
                }
                if ($scope.device.strVendor.trim() == '') {
                    $scope.strVendorClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strVendorClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var DataDevice = {};
                DataDevice.device = $scope.device;
                DataDevice.device.make = $scope.make.selected.name;
                DataDevice.device.model = $scope.model.selected.name;
                DataDevice.device.subcategory = $scope.subcategory.selected.name;
                DataDevice.device.category = $scope.category.selected.name;
                DataDevice.device.email = $scope.user.strEmail;
                DataDevice.device.FileName = '';
                if ($scope.uploader.queue.length > 0) {
                    DataDevice.device.FileName = $scope.uploader.queue[0].file.name;
                }
                $scope.devices.push(DataDevice.device);
                var Data = {};
                Data.devices = $scope.devices;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/NewDeviceRegister',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.uploader.uploadAll();
                        $scope.open();
                    }
                    else if (response.data.Result == 'userExist') {
                        window.location.href = '/home.html';
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Close session
            $scope.Logout = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/Logout',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        window.location.href = '/index.html';
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            // update messages
            $scope.UpdateMessages = function (message) {
                $loading.start('myloading');
                message.messagetype2 = 'text-success';
                message.messagetype3 = 'fa fa-check';
                message.read = true;
                var Data = {};
                Data.Messages = $scope.messages;
                $http({
                    method: 'POST',
                    url: '/api/UpdateMessages',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            // Modal de mensajes
            $scope.MessagesModalInterface = {};
            $scope.animationsEnabled = true;
            $scope.open = function (size, Solicitud, parentSelector) {
                $scope.MessagesModalInterface.Message = '';
                var parentElem = parentSelector ?
                  angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'messagemodal.html',
                    controller: 'MessagesModalCtrl',
                    controllerAs: '$ctrl',
                    size: size,
                    appendTo: parentElem,
                    resolve: {
                        MessagesModalInterface: function () {
                            return $scope.MessagesModalInterface;
                        }
                    }
                });
            };
            $scope.uploader = new FileUploader();
            $scope.uploader.url = "/api/uploadFile";
            $scope.uploader.onSuccessItem = function (item, response) {
            }
            $scope.FillModels = function () {
                // Lista de modelos (Fijos por traer de base de datos)
                $scope.model.selected = {};
                $scope.models = [ // Taken from https://gist.github.com/unceus/6501985
                { id: 1, name: 'Daewood Modelo 1', code: 'DA', makeid: 1 },
                { id: 2, name: 'Daewood Modelo 2', code: 'FI', makeid: 1 },
                { id: 3, name: 'Fiat Modelo 1', code: 'TO', makeid: 2 },
                ];
            };
            $scope.FillSubCategories = function () {
                // Lista de subcategorías (Fijos por traer de base de datos)
                $scope.subcategory.selected = {};
                $scope.subcategories = [ // Taken from https://gist.github.com/unceus/6501985
                { id: 1, name: 'Refrigerator model 1', code: 'DA', categoryid: 1 },
                { id: 2, name: 'Refrigerator model 2', code: 'FI', categoryid: 1 },
                { id: 3, name: 'Microwave model 1', code: 'TO', categoryid: 2 },
                ];
            };
            // Lista de marcas (Fijos por traer de base de datos)
            $scope.makes = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: 'Daewood', code: 'DA' },
            { id: 2, name: 'Fiat', code: 'FI' },
            { id: 3, name: 'Toyota', code: 'TO' },
            ];
            // Lista de categorías (Fijos por traer de base de datos)
            $scope.categories = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: 'Refrigerator', code: 'DA' },
            { id: 2, name: 'Microwave', code: 'FI' }
            ];
            // Angular code date picker control
            $scope.today = function () {
                $scope.dt = new Date();
            };
            $scope.today();
            $scope.clear = function () {
                $scope.dt = null;
            };
            $scope.inlineOptions = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };
            $scope.dateOptions = {
                dateDisabled: disabled,
                formatYear: 'yy',
                maxDate: new Date(2020, 5, 22),
                minDate: new Date(),
                startingDay: 1
            };
            // Disable weekend selection
            function disabled(data) {
                var date = data.date,
                  mode = data.mode;
                return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
            }
            $scope.toggleMin = function () {
                $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
                $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
            };
            $scope.toggleMin();
            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };
            $scope.setDate = function (year, month, day) {
                $scope.dt = new Date(year, month, day);
            };
            $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            $scope.altInputFormats = ['M!/d!/yyyy'];
            $scope.popup1 = {
                opened: false
            };
            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            var afterTomorrow = new Date();
            afterTomorrow.setDate(tomorrow.getDate() + 1);
            $scope.events = [
              {
                  date: tomorrow,
                  status: 'full'
              },
              {
                  date: afterTomorrow,
                  status: 'partially'
              }
            ];
            function getDayClass(data) {
                var date = data.date,
                  mode = data.mode;
                if (mode === 'day') {
                    var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
                    for (var i = 0; i < $scope.events.length; i++) {
                        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                        if (dayToCheck === currentDay) {
                            return $scope.events[i].status;
                        }
                    }
                }
                return '';
            }
        }])

        .controller('ctrlWarrantyLogin', ['$scope', '$http', '$loading', '$uibModal', function ($scope, $http, $loading, $uibModal) {
            // Inicio variables
            $scope.user = {};
            $scope.country = {};
            $scope.country.selected = {};
            $scope.user.strFirstName = '';
            $scope.user.strLastName = '';
            $scope.user.strEmail = '';
            $scope.user.strPassword = '';
            $scope.user.strConfirmPassword = '';
            $scope.user.strPhoneNumber = '';
            $scope.userLogon = {};
            $scope.userLogon.strEmail = '';
            $scope.userLogon.strPassword = '';
            $scope.strFirstNameClass = 'form-group';
            $scope.strLastNameClass = 'form-group';
            $scope.strEmailClass = 'form-group';
            $scope.strPasswordClass = 'form-group';
            $scope.strConfirmPasswordClass = 'form-group';
            $scope.strPhoneClass = 'form-group';
            $scope.strCountryClass = 'form-group';
            $scope.strEmailLogonClass = 'form-group';
            $scope.strPasswordLogonClass = 'form-group';
            // Crear nuevo usuario
            $scope.NewUserRegister = function () {
                var booError = false;
                if ($scope.user.strFirstName.trim() == '') {
                    $scope.strFirstNameClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strFirstNameClass = 'form-group'
                }
                if ($scope.user.strLastName.trim() == '') {
                    $scope.strLastNameClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strLastNameClass = 'form-group'
                }
                if (!$scope.ValidateEmail($scope.user.strEmail.trim())) {
                    $scope.strEmailClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailClass = 'form-group'
                }
                if ($scope.user.strPassword.trim() == '' || $scope.user.strPassword.trim() != $scope.user.strConfirmPassword.trim()) {
                    $scope.strPasswordClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPasswordClass = 'form-group'
                }
                if ($scope.user.strPhoneNumber.trim() == '') {
                    $scope.strPhoneNumberClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPhoneNumberClass = 'form-group'
                }
                if (typeof $scope.country.selected.name == 'undefined') {
                    $scope.strCountryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strCountryClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.user = $scope.user;
                Data.user.strCountry = $scope.country.selected.name;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/NewUserRegister',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        window.location.href = '/home.html';
                    }
                    else if (response.data.Result == 'userExist') {
                        alert('Éste usuario existe pana');
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.Logon = function () {
                var booError = false;
                if (!$scope.ValidateEmail($scope.userLogon.strEmail.trim())) {
                    $scope.strEmailLogonClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailLogonClass = 'form-group'
                }
                if ($scope.userLogon.strPassword.trim() == '') {
                    $scope.strPasswordLogonClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strPasswordLogonClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.userLogon = $scope.userLogon;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/Logon',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        window.location.href = '/home.html';
                    }
                    else if (response.data.Result == 'userDoesNotExist') {
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            // Modal de mensajes
            $scope.MessagesModalInterface = {};
            $scope.animationsEnabled = true;
            $scope.open = function (size, Solicitud, parentSelector) {
                $scope.MessagesModalInterface.Message = '';
                var parentElem = parentSelector ?
                  angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'messagemodal.html',
                    controller: 'MessagesModalCtrl',
                    controllerAs: '$ctrl',
                    size: size,
                    appendTo: parentElem,
                    resolve: {
                        MessagesModalInterface: function () {
                            return $scope.MessagesModalInterface;
                        }
                    }
                });
            };
            $scope.ValidateEmail = function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }
            // Lista de países (Fijos)
            $scope.countries = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: 'Afghanistan', code: 'AF' },
            { id: 2, name: 'Åland Islands', code: 'AX' },
            { id: 3, name: 'Albania', code: 'AL' },
            { id: 4, name: 'Algeria', code: 'DZ' },
            { id: 5, name: 'American Samoa', code: 'AS' },
            { id: 6, name: 'Andorra', code: 'AD' },
            { id: 7, name: 'Angola', code: 'AO' },
            { id: 8, name: 'Anguilla', code: 'AI' },
            { id: 9, name: 'Antarctica', code: 'AQ' },
            { id: 10, name: 'Antigua and Barbuda', code: 'AG' },
            { id: 11, name: 'Argentina', code: 'AR' },
            { id: 12, name: 'Armenia', code: 'AM' },
            { id: 13, name: 'Aruba', code: 'AW' },
            { id: 14, name: 'Australia', code: 'AU' },
            { id: 15, name: 'Austria', code: 'AT' },
            { id: 16, name: 'Azerbaijan', code: 'AZ' },
            { id: 17, name: 'Bahamas', code: 'BS' },
            { id: 18, name: 'Bahrain', code: 'BH' },
            { id: 19, name: 'Bangladesh', code: 'BD' },
            { id: 20, name: 'Barbados', code: 'BB' },
            { id: 21, name: 'Belarus', code: 'BY' },
            { id: 22, name: 'Belgium', code: 'BE' },
            { id: 23, name: 'Belize', code: 'BZ' },
            { id: 24, name: 'Benin', code: 'BJ' },
            { id: 25, name: 'Bermuda', code: 'BM' },
            { id: 26, name: 'Bhutan', code: 'BT' },
            { id: 27, name: 'Bolivia', code: 'BO' },
            { id: 28, name: 'Bosnia and Herzegovina', code: 'BA' },
            { id: 29, name: 'Botswana', code: 'BW' },
            { id: 30, name: 'Bouvet Island', code: 'BV' },
            { id: 31, name: 'Brazil', code: 'BR' },
            { id: 32, name: 'British Indian Ocean Territory', code: 'IO' },
            { id: 33, name: 'Brunei Darussalam', code: 'BN' },
            { id: 34, name: 'Bulgaria', code: 'BG' },
            { id: 35, name: 'Burkina Faso', code: 'BF' },
            { id: 36, name: 'Burundi', code: 'BI' },
            { id: 37, name: 'Cambodia', code: 'KH' },
            { id: 38, name: 'Cameroon', code: 'CM' },
            { id: 39, name: 'Canada', code: 'CA' },
            { id: 40, name: 'Cape Verde', code: 'CV' },
            { id: 41, name: 'Cayman Islands', code: 'KY' },
            { id: 42, name: 'Central African Republic', code: 'CF' },
            { id: 43, name: 'Chad', code: 'TD' },
            { id: 44, name: 'Chile', code: 'CL' },
            { id: 45, name: 'China', code: 'CN' },
            { id: 46, name: 'Christmas Island', code: 'CX' },
            { id: 47, name: 'Cocos (Keeling) Islands', code: 'CC' },
            { id: 48, name: 'Colombia', code: 'CO' },
            { id: 49, name: 'Comoros', code: 'KM' },
            { id: 50, name: 'Congo', code: 'CG' },
            { id: 51, name: 'Congo, The Democratic Republic of the', code: 'CD' },
            { id: 52, name: 'Cook Islands', code: 'CK' },
            { id: 53, name: 'Costa Rica', code: 'CR' },
            { id: 54, name: 'Cote D\'Ivoire', code: 'CI' },
            { id: 55, name: 'Croatia', code: 'HR' },
            { id: 56, name: 'Cuba', code: 'CU' },
            { id: 57, name: 'Cyprus', code: 'CY' },
            { id: 58, name: 'Czech Republic', code: 'CZ' },
            { id: 59, name: 'Denmark', code: 'DK' },
            { id: 60, name: 'Djibouti', code: 'DJ' },
            { id: 61, name: 'Dominica', code: 'DM' },
            { id: 62, name: 'Dominican Republic', code: 'DO' },
            { id: 63, name: 'Ecuador', code: 'EC' },
            { id: 64, name: 'Egypt', code: 'EG' },
            { id: 65, name: 'El Salvador', code: 'SV' },
            { id: 66, name: 'Equatorial Guinea', code: 'GQ' },
            { id: 67, name: 'Eritrea', code: 'ER' },
            { id: 68, name: 'Estonia', code: 'EE' },
            { id: 69, name: 'Ethiopia', code: 'ET' },
            { id: 70, name: 'Falkland Islands (Malvinas)', code: 'FK' },
            { id: 71, name: 'Faroe Islands', code: 'FO' },
            { id: 72, name: 'Fiji', code: 'FJ' },
            { id: 73, name: 'Finland', code: 'FI' },
            { id: 74, name: 'France', code: 'FR' },
            { id: 75, name: 'French Guiana', code: 'GF' },
            { id: 76, name: 'French Polynesia', code: 'PF' },
            { id: 77, name: 'French Southern Territories', code: 'TF' },
            { id: 78, name: 'Gabon', code: 'GA' },
            { id: 79, name: 'Gambia', code: 'GM' },
            { id: 80, name: 'Georgia', code: 'GE' },
            { id: 81, name: 'Germany', code: 'DE' },
            { id: 82, name: 'Ghana', code: 'GH' },
            { id: 83, name: 'Gibraltar', code: 'GI' },
            { id: 84, name: 'Greece', code: 'GR' },
            { id: 85, name: 'Greenland', code: 'GL' },
            { id: 86, name: 'Grenada', code: 'GD' },
            { id: 87, name: 'Guadeloupe', code: 'GP' },
            { id: 88, name: 'Guam', code: 'GU' },
            { id: 89, name: 'Guatemala', code: 'GT' },
            { id: 90, name: 'Guernsey', code: 'GG' },
            { id: 91, name: 'Guinea', code: 'GN' },
            { id: 92, name: 'Guinea-Bissau', code: 'GW' },
            { id: 93, name: 'Guyana', code: 'GY' },
            { id: 94, name: 'Haiti', code: 'HT' },
            { id: 95, name: 'Heard Island and Mcdonald Islands', code: 'HM' },
            { id: 96, name: 'Holy See (Vatican City State)', code: 'VA' },
            { id: 97, name: 'Honduras', code: 'HN' },
            { id: 98, name: 'Hong Kong', code: 'HK' },
            { id: 99, name: 'Hungary', code: 'HU' },
            { id: 100, name: 'Iceland', code: 'IS' },
            { id: 101, name: 'India', code: 'IN' },
            { id: 102, name: 'Indonesia', code: 'ID' },
            { id: 103, name: 'Iran, Islamic Republic Of', code: 'IR' },
            { id: 104, name: 'Iraq', code: 'IQ' },
            { id: 105, name: 'Ireland', code: 'IE' },
            { id: 106, name: 'Isle of Man', code: 'IM' },
            { id: 107, name: 'Israel', code: 'IL' },
            { id: 108, name: 'Italy', code: 'IT' },
            { id: 109, name: 'Jamaica', code: 'JM' },
            { id: 110, name: 'Japan', code: 'JP' },
            { id: 111, name: 'Jersey', code: 'JE' },
            { id: 112, name: 'Jordan', code: 'JO' },
            { id: 113, name: 'Kazakhstan', code: 'KZ' },
            { id: 114, name: 'Kenya', code: 'KE' },
            { id: 115, name: 'Kiribati', code: 'KI' },
            { id: 116, name: 'Korea, Democratic People\'s Republic of', code: 'KP' },
            { id: 117, name: 'Korea, Republic of', code: 'KR' },
            { id: 118, name: 'Kuwait', code: 'KW' },
            { id: 119, name: 'Kyrgyzstan', code: 'KG' },
            { id: 120, name: 'Lao People\'s Democratic Republic', code: 'LA' },
            { id: 121, name: 'Latvia', code: 'LV' },
            { id: 122, name: 'Lebanon', code: 'LB' },
            { id: 123, name: 'Lesotho', code: 'LS' },
            { id: 124, name: 'Liberia', code: 'LR' },
            { id: 125, name: 'Libyan Arab Jamahiriya', code: 'LY' },
            { id: 126, name: 'Liechtenstein', code: 'LI' },
            { id: 127, name: 'Lithuania', code: 'LT' },
            { id: 128, name: 'Luxembourg', code: 'LU' },
            { id: 129, name: 'Macao', code: 'MO' },
            { id: 130, name: 'Macedonia, The Former Yugoslav Republic of', code: 'MK' },
            { id: 131, name: 'Madagascar', code: 'MG' },
            { id: 132, name: 'Malawi', code: 'MW' },
            { id: 133, name: 'Malaysia', code: 'MY' },
            { id: 134, name: 'Maldives', code: 'MV' },
            { id: 135, name: 'Mali', code: 'ML' },
            { id: 136, name: 'Malta', code: 'MT' },
            { id: 137, name: 'Marshall Islands', code: 'MH' },
            { id: 138, name: 'Martinique', code: 'MQ' },
            { id: 139, name: 'Mauritania', code: 'MR' },
            { id: 140, name: 'Mauritius', code: 'MU' },
            { id: 141, name: 'Mayotte', code: 'YT' },
            { id: 142, name: 'Mexico', code: 'MX' },
            { id: 143, name: 'Micronesia, Federated States of', code: 'FM' },
            { id: 144, name: 'Moldova, Republic of', code: 'MD' },
            { id: 145, name: 'Monaco', code: 'MC' },
            { id: 146, name: 'Mongolia', code: 'MN' },
            { id: 147, name: 'Montserrat', code: 'MS' },
            { id: 148, name: 'Morocco', code: 'MA' },
            { id: 149, name: 'Mozambique', code: 'MZ' },
            { id: 150, name: 'Myanmar', code: 'MM' },
            { id: 151, name: 'Namibia', code: 'NA' },
            { id: 152, name: 'Nauru', code: 'NR' },
            { id: 153, name: 'Nepal', code: 'NP' },
            { id: 154, name: 'Netherlands', code: 'NL' },
            { id: 155, name: 'Netherlands Antilles', code: 'AN' },
            { id: 156, name: 'New Caledonia', code: 'NC' },
            { id: 157, name: 'New Zealand', code: 'NZ' },
            { id: 158, name: 'Nicaragua', code: 'NI' },
            { id: 159, name: 'Niger', code: 'NE' },
            { id: 160, name: 'Nigeria', code: 'NG' },
            { id: 161, name: 'Niue', code: 'NU' },
            { id: 162, name: 'Norfolk Island', code: 'NF' },
            { id: 163, name: 'Northern Mariana Islands', code: 'MP' },
            { id: 164, name: 'Norway', code: 'NO' },
            { id: 165, name: 'Oman', code: 'OM' },
            { id: 166, name: 'Pakistan', code: 'PK' },
            { id: 167, name: 'Palau', code: 'PW' },
            { id: 168, name: 'Palestinian Territory, Occupied', code: 'PS' },
            { id: 169, name: 'Panama', code: 'PA' },
            { id: 170, name: 'Papua New Guinea', code: 'PG' },
            { id: 171, name: 'Paraguay', code: 'PY' },
            { id: 172, name: 'Peru', code: 'PE' },
            { id: 173, name: 'Philippines', code: 'PH' },
            { id: 174, name: 'Pitcairn', code: 'PN' },
            { id: 175, name: 'Poland', code: 'PL' },
            { id: 176, name: 'Portugal', code: 'PT' },
            { id: 177, name: 'Puerto Rico', code: 'PR' },
            { id: 178, name: 'Qatar', code: 'QA' },
            { id: 179, name: 'Reunion', code: 'RE' },
            { id: 180, name: 'Romania', code: 'RO' },
            { id: 181, name: 'Russian Federation', code: 'RU' },
            { id: 182, name: 'Rwanda', code: 'RW' },
            { id: 183, name: 'Saint Helena', code: 'SH' },
            { id: 184, name: 'Saint Kitts and Nevis', code: 'KN' },
            { id: 185, name: 'Saint Lucia', code: 'LC' },
            { id: 186, name: 'Saint Pierre and Miquelon', code: 'PM' },
            { id: 187, name: 'Saint Vincent and the Grenadines', code: 'VC' },
            { id: 188, name: 'Samoa', code: 'WS' },
            { id: 189, name: 'San Marino', code: 'SM' },
            { id: 190, name: 'Sao Tome and Principe', code: 'ST' },
            { id: 191, name: 'Saudi Arabia', code: 'SA' },
            { id: 192, name: 'Senegal', code: 'SN' },
            { id: 193, name: 'Serbia and Montenegro', code: 'CS' },
            { id: 194, name: 'Seychelles', code: 'SC' },
            { id: 195, name: 'Sierra Leone', code: 'SL' },
            { id: 196, name: 'Singapore', code: 'SG' },
            { id: 197, name: 'Slovakia', code: 'SK' },
            { id: 198, name: 'Slovenia', code: 'SI' },
            { id: 199, name: 'Solomon Islands', code: 'SB' },
            { id: 200, name: 'Somalia', code: 'SO' },
            { id: 201, name: 'South Africa', code: 'ZA' },
            { id: 202, name: 'South Georgia and the South Sandwich Islands', code: 'GS' },
            { id: 203, name: 'Spain', code: 'ES' },
            { id: 204, name: 'Sri Lanka', code: 'LK' },
            { id: 205, name: 'Sudan', code: 'SD' },
            { id: 206, name: 'Suriname', code: 'SR' },
            { id: 207, name: 'Svalbard and Jan Mayen', code: 'SJ' },
            { id: 208, name: 'Swaziland', code: 'SZ' },
            { id: 209, name: 'Sweden', code: 'SE' },
            { id: 210, name: 'Switzerland', code: 'CH' },
            { id: 211, name: 'Syrian Arab Republic', code: 'SY' },
            { id: 212, name: 'Taiwan, Province of China', code: 'TW' },
            { id: 213, name: 'Tajikistan', code: 'TJ' },
            { id: 214, name: 'Tanzania, United Republic of', code: 'TZ' },
            { id: 215, name: 'Thailand', code: 'TH' },
            { id: 216, name: 'Timor-Leste', code: 'TL' },
            { id: 217, name: 'Togo', code: 'TG' },
            { id: 218, name: 'Tokelau', code: 'TK' },
            { id: 219, name: 'Tonga', code: 'TO' },
            { id: 220, name: 'Trinidad and Tobago', code: 'TT' },
            { id: 221, name: 'Tunisia', code: 'TN' },
            { id: 222, name: 'Turkey', code: 'TR' },
            { id: 223, name: 'Turkmenistan', code: 'TM' },
            { id: 224, name: 'Turks and Caicos Islands', code: 'TC' },
            { id: 225, name: 'Tuvalu', code: 'TV' },
            { id: 226, name: 'Uganda', code: 'UG' },
            { id: 227, name: 'Ukraine', code: 'UA' },
            { id: 228, name: 'United Arab Emirates', code: 'AE' },
            { id: 229, name: 'United Kingdom', code: 'GB' },
            { id: 230, name: 'United States', code: 'US' },
            { id: 231, name: 'United States Minor Outlying Islands', code: 'UM' },
            { id: 232, name: 'Uruguay', code: 'UY' },
            { id: 233, name: 'Uzbekistan', code: 'UZ' },
            { id: 234, name: 'Vanuatu', code: 'VU' },
            { id: 235, name: 'Venezuela', code: 'VE' },
            { id: 236, name: 'Vietnam', code: 'VN' },
            { id: 237, name: 'Virgin Islands, British', code: 'VG' },
            { id: 238, name: 'Virgin Islands, U.S.', code: 'VI' },
            { id: 239, name: 'Wallis and Futuna', code: 'WF' },
            { id: 240, name: 'Western Sahara', code: 'EH' },
            { id: 241, name: 'Yemen', code: 'YE' },
            { id: 242, name: 'Zambia', code: 'ZM' },
            { id: 243, name: 'Zimbabwe', code: 'ZW' }
            ];
            // End countries control code 
        }])

        // Controlador de la ventana de modal de mensajes
        .controller('MessagesModalCtrl', function ($uibModalInstance, MessagesModalInterface) {
            var $ctrl = this;
            $ctrl.titleMessage = 'WApprranty says';
            $ctrl.bodyTitleMessage = 'Greate!';
            $ctrl.bodyMessage = 'Your device is now save';
            $ctrl.button1Name = 'Ok';
            $ctrl.button1Class = 'btn btn-primary btn-margen';
            $ctrl.button2Name = '';
            $ctrl.bodyTitleMessageClass1 = 'image-modal-green';
            $ctrl.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
            $ctrl.button1Click = function () {
                $uibModalInstance.close();
            };
            $ctrl.button2Click = function () {
                $uibModalInstance.close();
            };
        })

        .controller('ctrlUploadFile', ['$scope', '$http', 'FileUploader', '$loading', function ($scope, $http, FileUploader, $loading) {
            $scope.regPasswordRepeat = '';
            $scope.States = [{ name: 'Bocas del Toro' }, { name: 'Cocl\u00e9' }, { name: 'Col\u00f3n' }, { name: 'Chiriqu\u00ed' }, { name: 'Dari\u00e9n' }, { name: 'Herrera' }, { name: 'Los Santos' }, { name: 'Panam\u00e1' }, { name: 'Panam\u00e1 Oeste' }, { name: 'Veraguas' }];
            //$scope.States = [{ name: 'Barcelona' }, { name: 'Madrid' }];
            $scope.uploader = new FileUploader();
            $scope.uploader.url = "/upload";
            $scope.uploader.onBeforeUploadItem = function (item) {
                $loading.start('myloading');
            };
            $scope.uploader.onAfterAddingFile = function (item /*{File|FileLikeObject}*/, filter, options) {
                $scope.uploader.uploadAll();
            };
            $scope.uploader.onSuccessItem = function (item, response) {
                $loading.finish('myloading');
                if (response.Result == 'nc') {
                    window.location.href = '/login.html';
                    return 0;
                }
                if (response.Result == 'nd') {
                    swal("Encu\u00e9ntralo dice", "Tu archivo no tiene data.");
                    return 0;
                }
                if (response.Result == 'nt') {
                    swal("Encu\u00e9ntralo dice", "Tu archivo no es ni txt ni csv.");
                    return 0;
                }
                if (response.Result == 'ns') {
                    swal("Encu\u00e9ntralo dice", "Tu archivo es muy grande.");
                    return 0;
                }
                if (response.Result == 'nx') {
                    $scope.Products = response.Products;
                    swal("Encu\u00e9ntralo dice", "No se pudo importar tu archivo. Detalles en la tabla al cerrar \u00e9sta ventana.");
                    return 0;
                }
                $scope.Products = response.Products;
                $scope.uploader.clearQueue();
                swal("Encu\u00e9ntralo dice", "Tus productos fueron cargados.");
            };
            $scope.CloseSession = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/closeSession',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    if (response.data.result == 'Ok') {
                        window.location.href = '/';
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetUserData = function () {
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/getUserData',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    if (response.data.Result == 'nc') {
                        window.location.href = '/login.html';
                        return 0;
                    }
                    else {
                        $scope.ActiveUser = response.data.Email;
                        $scope.regEnterprise = response.data.Enterprise;
                        $scope.regPhone = response.data.Phone;
                        $scope.selectedState = $scope.States.filter(function (el) { return el.name == response.data.State })[0];
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.updateUserData = function () {
                if ($scope.regEnterprise.trim() == '') {
                    swal("Encu\u00e9ntralo dice", "Coloca un nombre de empresa.");
                    return 0;
                }
                $loading.start('myloading');
                var Data = {};
                Data.Enterprise = $scope.regEnterprise;
                Data.State = $scope.selectedState.name;
                Data.Phone = $scope.regPhone;
                $http({
                    method: 'POST',
                    url: '/updateUserData',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    if (response.data.Result == 'nc') {
                        window.location.href = '/login.html';
                        return 0;
                    }
                    else {
                        if (response.data.Result == 'Ok') {
                            swal("Encu\u00e9ntralo dice", "Tus datos fueron actualizados.");
                        };
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.updatePassword = function () {
                if ($scope.regPassword.trim() != $scope.regPasswordRepeat.trim()) {
                    swal("Encu\u00e9ntralo dice", "Contrase\u00f1as no coinciden.");
                    return 0;
                }
                $loading.start('myloading');
                var Data = {};
                Data.Password = $scope.regPassword;
                $http({
                    method: 'POST',
                    url: '/updatePassword',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    if (response.data.Result == 'nc') {
                        window.location.href = '/login.html';
                        return 0;
                    }
                    else {
                        if (response.data.Result == 'Ok') {
                            swal("Encu\u00e9ntralo dice", "Tu contrase\u00f1a fue actualizada.");
                        };
                    }
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetUserData();
        }])

        .controller('ctrlProducts', ['$scope', '$http', 'FileUploader', '$loading', function ($scope, $http, FileUploader, $loading) {
            $scope.showFinder = false;
            $scope.NewFind = function () {
                $scope.txtFind = undefined;
                $scope.txtFind = '';
                $scope.States = [];
                $scope.Makes = [];
                $scope.Models = [];
                $scope.Products = [];
                $scope.Orders = [{ "text": "Menor Precio", name: 'Precio', dir: 'asc' }, { "text": "Mayor Cantidad", name: 'Cantidad', dir: 'desc' }];
                $scope.chkNew = true;
                $scope.chkUsed = true;
            }
            $scope.onSelect = function ($item, $model, $label) {
                $scope.GetProducts();
            }
            $scope.loadOrders = function (query) {
                var Orders = [];
                Orders = [{ "text": "Menor Precio", name: 'Precio', dir: 'asc' }, { "text": "Mayor Cantidad", name: 'Cantidad', dir: 'desc' }, { "text": "Menor Cantidad", name: 'Cantidad', dir: 'asc' }, { "text": "Mayor Precio", name: 'Precio', dir: 'desc' }];
                Orders = Orders.filter(function (el) {
                    return (el.text.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return Orders;
            };
            $scope.loadStates = function (query) {
                var States = [];
                States = $scope.ProductStates;
                States = States.filter(function (el) {
                    return (el.State.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return States;
            };
            $scope.loadMakes = function (query) {
                var Makes = [];
                Makes = $scope.ProductMakes;
                Makes = Makes.filter(function (el) {
                    return (el.Marca.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                console.log('Vale');
                console.log(Makes);
                return Makes;
            };
            $scope.loadModels = function (query) {
                var Models = [];
                Models = $scope.ProductModels;
                Models = Models.filter(function (el) {
                    return (el.Modelo.toUpperCase().indexOf(query.toUpperCase()) > -1)
                });
                return Models;
            };
            $scope.forceOneTag = function forceOneTag() {
                return ($scope.States.length == 0);
            }
            $scope.GetProducts = function () {
                var txtFind = '';
                if (typeof ($scope.txtFind) == 'object') {
                    txtFind = $scope.txtFind._id;
                }
                else {
                    txtFind = $scope.txtFind;
                }
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/GetProducts',
                    headers: { 'Content-Type': 'application/json' },
                    data: { Nombre: txtFind }
                }).then(function successCallback(response) {
                    $scope.NewFind();
                    $scope.showFinder = true;
                    $scope.Products = response.data.Products;
                    $scope.ProductsAll = $scope.Products;
                    $scope.ProductMakes = _.orderBy(_.uniqBy($scope.Products, 'Marca'), ['Marca'], ['asc']).filter(function (el) { return el.Marca.trim() != '' });
                    $scope.ProductStates = _.orderBy(_.uniqBy($scope.Products, 'State'), ['State'], ['asc']).filter(function (el) { return el.State.trim() != '' });
                    $scope.ProductModels = _.orderBy(_.uniqBy($scope.Products, 'Modelo'), ['Modelo'], ['asc']).filter(function (el) { return el.Modelo.trim() != '' });
                    $scope.FilterProduct();
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetSuggestProducts = function () {
                $scope.NewFind();
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/GetSuggestProducts',
                    headers: { 'Content-Type': 'application/json' },
                    data: {}
                }).then(function successCallback(response) {
                    $scope.txtProducts = response.data.SuggestProducts;
                    $loading.finish('myloading');
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.GetSuggestProducts();
            $scope.tagAdded = function (tag) {
                $scope.FilterProduct();
            };
            $scope.FilterProduct = function () {
                var FinalResult = [];
                if ($scope.Makes.length > 0) {
                    var result = [];
                    _.forEach($scope.ProductsAll, function (n, key) {
                        _.forEach($scope.Makes, function (n2, key2) {
                            if (n.Marca === n2.Marca) {
                                result.push(n);
                            }
                        });
                    });
                    FinalResult = result;
                }
                else {
                    FinalResult = $scope.ProductsAll;
                }
                if ($scope.Models.length > 0) {
                    var result = [];
                    _.forEach(FinalResult, function (n, key) {
                        _.forEach($scope.Models, function (n2, key2) {
                            if (n.Modelo === n2.Modelo) {
                                result.push(n);
                            }
                        });
                    });
                    FinalResult = result;
                }
                if ($scope.States.length > 0) {
                    var result = [];
                    _.forEach(FinalResult, function (n, key) {
                        _.forEach($scope.States, function (n2, key2) {
                            if (n.State === n2.State) {
                                result.push(n);
                            }
                        });
                    });
                    FinalResult = result;
                }
                if ($scope.chkNew != $scope.chkUsed) {
                    if ($scope.chkNew == true) {
                        FinalResult = FinalResult.filter(function (el) {
                            return el.Estado == 'Nuevo';
                        })
                    }
                    else {
                        FinalResult = FinalResult.filter(function (el) {
                            return el.Estado == 'Usado';
                        })
                    }
                }
                var OrderByValue = [];
                var OrderByDirection = [];
                _.forEach($scope.Orders, function (n2, key2) {
                    OrderByValue.push(n2.name);
                    OrderByDirection.push(n2.dir);
                });
                if (OrderByValue.length == 0)
                {
                    OrderByValue = ['Precio', 'Cantidad'];
                    OrderByDirection = ['asc', 'desc'];
                }
                FinalResult = _.orderBy(FinalResult, OrderByValue, OrderByDirection);
                $scope.Products = FinalResult;
            }
        }])

        .controller('ctrlLogin', ['$scope', '$http', '$loading', function ($scope, $http, $loading) {
            $scope.showlogin = true;
            $scope.logEmail = '';
            $scope.logPassword = '';
            $scope.regEmail = '';
            $scope.regPhone = '';
            $scope.regEnterprise = '';
            $scope.ForgotPassword = function () {
                if ($scope.ValidateEmail($scope.logEmail) == false) {
                    swal("Encu\u00e9ntralo dice", "Coloca un correo v\u00e1lido.");
                    return 0;
                }
                var Data = {};
                Data.Email = $scope.logEmail;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/RecoverPassword',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'Ok') {
                        swal("Encu\u00e9ntralo dice", "Una nueva clave fue generada y enviada a tu correo electr\u00f3nico.");
                    }
                    else {
                        swal("Encu\u00e9ntralo dice", "Ocurri\u00f3 un error inesperado.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            //$scope.States = [{ name: 'Barcelona' }, { name: 'Madrid' }];
            $scope.States = [{ name: 'Bocas del Toro' }, { name: 'Cocl\u00e9' }, { name: 'Col\u00f3n' }, { name: 'Chiriqu\u00ed' }, { name: 'Dari\u00e9n' }, { name: 'Herrera' }, { name: 'Los Santos' }, { name: 'Panam\u00e1' }, { name: 'Panam\u00e1 Oeste' }, { name: 'Veraguas' }];
            $scope.Registration = function () {
                if ($scope.ValidateEmail($scope.regEmail) == false) {
                    swal("Encu\u00e9ntralo dice", "Coloca un correo v\u00e1lido.");
                    return 0;
                }
                if (typeof $scope.selectedState == 'undefined') {
                    swal("Encu\u00e9ntralo dice", "Coloca un Estado.");
                    return 0;
                }
                if ($scope.regEnterprise.trim() == '') {
                    swal("Encu\u00e9ntralo dice", "Coloca un nombre de empresa.");
                    return 0;
                }
                var Data = {};
                Data.Email = $scope.regEmail;
                Data.Phone = $scope.regPhone;
                Data.Enterprise = $scope.regEnterprise;
                Data.State = $scope.selectedState.name;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/Registration',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'Ok') {
                        swal("Encu\u00e9ntralo dice", "Tu cuenta fue creada. Te hemos enviado un correo con datos de acceso.");
                    }
                    else if (response.data.Result == 'Re') {
                        swal("Encu\u00e9ntralo dice", "Lo siento, ya existe otro registro con esa cuenta de correo. Intenta con otro.");
                    }
                    else {
                        swal("Mensaje de la aplicacion de recibos", "Ocurri\u00f3 un error inesperado.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.Login = function () {
                if ($scope.ValidateEmail($scope.logEmail) == false) {
                    swal("Encu\u00e9ntralo dice", "Coloca un correo v\u00e1lido.");
                    return 0;
                }
                if ($scope.logPassword.trim() == '') {
                    swal("Encu\u00e9ntralo dice", "Coloca un password.");
                    return 0;
                }
                $loading.start('myloading');
                var Data = {};
                Data.Email = $scope.logEmail;
                Data.Password = $scope.logPassword;
                $http({
                    method: 'POST',
                    url: '/Login',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Login == true) {
                        window.location.href = '/uploadfile.html';
                    }
                    else {
                        swal("Encu\u00e9ntralo dice", "Clave inv\u00e1lida.");
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.ValidateEmail = function validateEmail(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }
        }])

