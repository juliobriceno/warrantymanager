angular.element(function() {
    angular.bootstrap(document, ['WarrantyModule']);
});

angular.module('WarrantyModule', ['angularFileUpload', 'darthwade.loading', 'ngTagsInput', 'ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.select'])

        .controller('ctrlWarrantyHome', ['$scope', '$http', '$loading', '$uibModal', 'FileUploader', function ($scope, $http, $loading, $uibModal, FileUploader) {
            // Base de data
            $scope.data = {};
            // Valores por defecto de modales
            $scope.MessagesModalInterface = {};
            $scope.ClearDeviceData = function ClearDeviceData() {
                $scope.device = {};
                $scope.device.make = {};
                $scope.device.model = {};
                $scope.device.category = {};
                $scope.device.subcategory = {};
                $scope.device.warrantytime = {};
                $scope.device.strSerial = '';
                $scope.device.datDatePurchase = new Date();
                $scope.device.strVendor = '';
            };
            // Inicio variables
            $scope.ClearDeviceData();
            $scope.strSerialClass = 'form-group';
            $scope.modelClass = 'form-group';
            $scope.warantyClass = 'form-group';
            $scope.datDatePurchaseClass = 'form-group';
            $scope.subcategoryClass = 'form-group';
            $scope.strVendorClass = 'form-group';
            $scope.user = {};
            $scope.country = {};
            $scope.country.selected = {};
            $scope.user.strFirstName = '';
            $scope.user.strLastName = '';
            $scope.user.strEmail = '';
            $scope.user.strPassword = '';
            $scope.user.strConfirmPassword = '';
            $scope.user.strPhoneNumber = '';
            $scope.strFirstNameClass = 'form-group';
            $scope.strLastNameClass = 'form-group';
            $scope.strEmailClass = 'form-group';
            $scope.strPasswordClass = 'form-group';
            $scope.strConfirmPasswordClass = 'form-group';
            $scope.strPhoneClass = 'form-group';
            $scope.strCountryClass = 'form-group';
            $scope.strEmailLogonClass = 'form-group';
            $scope.strPasswordLogonClass = 'form-group';
            // Función de ejecución al llamar modal
            $scope.CallBackModal = function () { return 0; };
            // Para identificar el serial del producto al que se le suben files. NOTA: Mejorar a guardar en DataUpload event a futuro
            $scope.DeviceActiveSerial = '';
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
                        // Dispositivos del home quedan en un array para filtrar
                        $scope.devicesfiltered = $scope.devices;
                        // Los usuarios de la plataforma para poder transferir el device
                        $scope.transferusers = response.data.transferusers;
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
                if (typeof $scope.device.model.name == 'undefined') {
                    $scope.modelClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.modelClass = 'form-group'
                }
                if (typeof $scope.device.subcategory.name == 'undefined') {
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
                DataDevice.device.email = $scope.user.strEmail;
                DataDevice.device.FileName = '';
                DataDevice.device.Files = [];
                DataDevice.device.Status = 'Active';
                $scope.DeviceActiveSerial = $scope.device.strSerial;
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
                    $scope.messages.push({ email: $scope.user.strEmail, messagetype: 'alert alert-danger alert-dismissible', messagetype2: 'text-danger', messagetype3: 'fa fa-warning', message: $scope.user.strFirstName + ' Hey!', message2: ' I see you have a new device :)  ...', read: false });
                    $scope.ClearDeviceData();
                    if (response.data.Result == 'ok') {
                        $scope.QuantityFiles = $scope.uploader.queue.length;
                        if ($scope.QuantityFiles > 0) {
                            $scope.uploader.uploadAll();
                        }
                        else {
                            $loading.finish('myloading');
                            $scope.MessagesModalInterface.button1Name = 'Ok';
                            $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                            $scope.MessagesModalInterface.button2Name = '';
                            $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                            $scope.MessagesModalInterface.bodyMessage = 'Your Device Warranty is safed now!';
                            $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                            $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                            $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                            $scope.open();
                        }
                        $scope.devices = response.data.Devices;
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
            $scope.UpdateUser = function () {
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
                if (!validateEmail($scope.user.strEmail.trim())) {
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
                if (typeof $scope.user.country.name == 'undefined') {
                    $scope.strCountryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strCountryClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.user = $scope.user;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/UpdateUser',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                        $scope.MessagesModalInterface.bodyMessage = 'Your user account was updated!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                    else if (response.data.Result == 'userExist') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'This account was taken!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Set home devices
            $scope.SetHomeDevices = function () {
                $scope.devicesfiltered = $scope.devices;
            }
            // Set home devices
            $scope.SetListDevice = function () {
                $scope.deviceslistfiltered = $scope.devices;
            }
            // Búsqueda de devices en dashboard y lista de dispositivos
            $scope.SearchDevices = function () {
                $scope.devicesfiltered = $scope.devices;
                $scope.devicesfiltered = $scope.devicesfiltered.filter(function (el) {
                    return el.make.name.toUpperCase().indexOf($scope.strSearchDevice.toUpperCase()) > -1 || el.model.name.toUpperCase().indexOf($scope.strSearchDevice.toUpperCase()) > -1 || el.category.name.toUpperCase().indexOf($scope.strSearchDevice.toUpperCase()) > -1
                })
            }
            // Búsqueda de devices en dashboard y lista de dispositivos para pantalla de listados
            $scope.SearchDevicesList = function () {
                $scope.deviceslistfiltered = $scope.devices;
                $scope.deviceslistfiltered = $scope.deviceslistfiltered.filter(function (el) {
                    return el.make.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.model.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.category.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.subcategory.name.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.strSerial.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1 || el.strVendor.toUpperCase().indexOf($scope.strSearchDeviceList.toUpperCase()) > -1
                })
            }
            // Confirmación de desactivación
            $scope.CallConfirmDeactivate = function (device) {
                $scope.deactivatedevice = device;
                $scope.CallBackModal = $scope.DeactivateDevice;
                $scope.MessagesModalInterface.button1Name = 'Ok';
                $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                $scope.MessagesModalInterface.button2Class = 'btn btn-default btn-margen';
                $scope.MessagesModalInterface.button2Name = 'Cancel';
                $scope.MessagesModalInterface.bodyTitleMessage = 'Sure?';
                $scope.MessagesModalInterface.bodyMessage = 'Are you sure that you like to deactivate this device?';
                $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                $scope.open();
            };
            // Confirmación de traspaso
            $scope.CallConfirmTransfer = function (device) {
                var transferuser = $scope.transferusers.filter(function (el) { return el.email == device.strEmailTransfer });
                if (transferuser.length == 0) {
                    $scope.MessagesModalInterface.button1Name = 'Ok';
                    $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                    $scope.MessagesModalInterface.button2Name = '';
                    $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                    $scope.MessagesModalInterface.bodyMessage = 'You mst select a valid user!';
                    $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                    $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                    $scope.open();
                    return 0;
                }
                $scope.deactivatedevice = device;
                $scope.CallBackModal = $scope.TransferDevice;
                $scope.MessagesModalInterface.button1Name = 'Ok';
                $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                $scope.MessagesModalInterface.button2Class = 'btn btn-default btn-margen';
                $scope.MessagesModalInterface.button2Name = 'Cancel';
                $scope.MessagesModalInterface.bodyTitleMessage = 'Sure?';
                $scope.MessagesModalInterface.bodyMessage = 'Are you sure that you like to transfer this device?';
                $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                $scope.open();
            };
            // Desactiva el dispositivo
            $scope.DeactivateDevice = function () {
                var Data = {};
                Data.strSerial = $scope.deactivatedevice.strSerial;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/DeactivateDevice',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.deactivatedevice.Status = 'Deactivated';
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Ready!';
                        $scope.MessagesModalInterface.bodyMessage = 'Your your devices was deativated! Remember you can re-activate any time.';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Transfiere el dispositivo
            $scope.TransferDevice = function () {
                var Data = {};
                Data.strSerial = $scope.deactivatedevice.strSerial;
                Data.strEmailTransfer = $scope.deactivatedevice.strEmailTransfer;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/api/TransferDevice',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'ok') {
                        $scope.devices = $scope.devices.filter(function (el) { return el.strSerial != Data.strSerial });
                        $scope.deviceslistfiltered = $scope.deviceslistfiltered.filter(function (el) { return el.strSerial != Data.strSerial });
                        $scope.devicesfiltered = $scope.devicesfiltered.filter(function (el) { return el.strSerial != Data.strSerial });
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Ready!';
                        $scope.MessagesModalInterface.bodyMessage = 'The device was transfered!';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            // Modal de mensajes
            $scope.animationsEnabled = true;
            $scope.open = function (size, Solicitud, parentSelector) {
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
                modalInstance.result.then(function (selectedItem) {
                    if (selectedItem.action == 'btn1') {
                        $scope.CallBackModal();
                    }
                    $scope.CallBackModal = function () { return 0; };
                }, function () {
                    $scope.CallBackModal();
                    $scope.CallBackModal = function () { return 0; };
                });
            };
            $scope.QuantityFiles = 0;
            $scope.uploader = new FileUploader();
            $scope.uploader.url = "/api/uploadFile";
            $scope.uploader.onBeforeUploadItem = function (item) {
                var Data = {};
                Data.DeviceActiveSerial = $scope.DeviceActiveSerial;
                item.formData.push(Data);
            };
            $scope.uploader.onSuccessItem = function (item, response) {
                if ($scope.QuantityFiles == 1) {
                    $scope.uploader.clearQueue();
                    $loading.finish('myloading');
                    $scope.devices = response.Devices;
                    $scope.MessagesModalInterface.button1Name = 'Ok';
                    $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                    $scope.MessagesModalInterface.button2Name = '';
                    $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                    $scope.MessagesModalInterface.bodyMessage = 'Your Device Warranty is safed now!';
                    $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                    $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                    $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                    $scope.open();
                }
                $scope.QuantityFiles--;
            }
            $scope.FillModels = function () {
                // Lista de modelos (Fijos por traer de base de datos)
                $scope.device.model = {};
                $scope.models = [ // Taken from https://gist.github.com/unceus/6501985
                { id: 1, name: 'Daewood Modelo 1', code: 'DA', makeid: 1 },
                { id: 2, name: 'Daewood Modelo 2', code: 'FI', makeid: 1 },
                { id: 3, name: 'Fiat Modelo 1', code: 'TO', makeid: 2 },
                ];
            };
            $scope.FillSubCategories = function () {
                // Lista de subcategorías (Fijos por traer de base de datos)
                $scope.device.subcategory = {};
                $scope.subcategories = [ // Taken from https://gist.github.com/unceus/6501985
                { id: 1, name: 'SmartPhone', code: 'DA', categoryid: 1 },
                { id: 2, name: 'Computer', code: 'FI', categoryid: 2 },
                { id: 3, name: 'TV', code: 'FI', categoryid: 2 },
                { id: 4, name: 'Tablet', code: 'FI', categoryid: 2 },
                { id: 5, name: 'Refrigerator', code: 'FI', categoryid: 3 },
                { id: 6, name: 'Light', code: 'FI', categoryid: 3 },
                { id: 7, name: 'Blender', code: 'FI', categoryid: 3 },
                { id: 8, name: 'Baby Carriage', code: 'FI', categoryid: 4 },
                { id: 9, name: 'Batery', code: 'FI', categoryid: 5 },
                { id: 10, name: 'Watch', code: 'FI', categoryid: 6 },
                { id: 11, name: 'Ring', code: 'FI', categoryid: 6 },
                { id: 12, name: 'Hairdryer', code: 'FI', categoryid: 7 },
                { id: 13, name: 'Hair shaver', code: 'FI', categoryid: 7 },
                { id: 15, name: 'Digital thermometer', code: 'FI', categoryid: 8 },
                { id: 16, name: 'Lawn mower', code: 'FI', categoryid: 9 },
                { id: 17, name: 'Barbecue grill', code: 'FI', categoryid: 9 }
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
            { id: 1, name: 'Cell Phone', code: 'DA' },
            { id: 2, name: 'Electronic', code: 'EL' },
            { id: 3, name: 'House & Kitchen', code: 'KI' },
            { id: 4, name: 'Babies', code: 'BA' },
            { id: 5, name: 'Car', code: 'CA' },
            { id: 6, name: 'Jewerly', code: 'JE' },
            { id: 7, name: 'Beauty', code: 'BE' },
            { id: 8, name: 'Health & Personal Care', code: 'HE' },
            { id: 9, name: 'Garden', code: 'GA' }
            ];
            // Lista de Warranty Life
            $scope.WarratyTimes = [ // Taken from https://gist.github.com/unceus/6501985
            { id: 1, name: '1 year', code: 'DA' },
            { id: 2, name: '2 years', code: 'EL' },
            { id: 2, name: '3 years', code: 'EL' },
            { id: 2, name: '4 years', code: 'EL' },
            { id: 2, name: '5 years', code: 'EL' },
            { id: 2, name: '6 years', code: 'EL' },
            { id: 2, name: '7 years', code: 'EL' },
            { id: 2, name: '8 years', code: 'EL' }
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
            // Lista de países (Fijos)
            $scope.countries = lCountries;
            // End countries control code 
        }])

        .controller('ctrlWarrantyLogin', ['$scope', '$http', '$loading', '$uibModal', function ($scope, $http, $loading, $uibModal) {
            // Valores por defecto de modales
            $scope.MessagesModalInterface = {};
            // Inicio variables
            $scope.user = {};
            $scope.user.country = {};
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
                if (!validateEmail($scope.user.strEmail.trim())) {
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
                if (typeof $scope.user.country.name == 'undefined') {
                    $scope.strCountryClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strCountryClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.user = $scope.user;
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
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'This account was taken!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            }
            $scope.Logon = function () {
                var booError = false;
                if (!validateEmail($scope.userLogon.strEmail.trim())) {
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
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'Credentials are invalid!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            $scope.RecoverPassword = function () {
                var booError = false;
                if (!validateEmail($scope.userLogon.strEmail.trim())) {
                    $scope.strEmailLogonClass = 'form-group has-error has-feedback'
                    booError = true;
                }
                else {
                    $scope.strEmailLogonClass = 'form-group'
                }
                if (booError == true) { return 0; }
                var Data = {};
                Data.userLogon = $scope.userLogon;
                $loading.start('myloading');
                $http({
                    method: 'POST',
                    url: '/RecoverPassword',
                    headers: { 'Content-Type': 'application/json' },
                    data: Data
                }).then(function successCallback(response) {
                    $loading.finish('myloading');
                    if (response.data.Result == 'Ok') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Great!';
                        $scope.MessagesModalInterface.bodyMessage = 'We send you a new password to your email account!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-green';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-check fa-4x i-green';
                        $scope.open();
                    }
                    else if (response.data.Result == 'userDoesNotExist') {
                        $scope.MessagesModalInterface.button1Name = 'Ok';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.button2Name = '';
                        $scope.MessagesModalInterface.bodyTitleMessage = 'Oops!';
                        $scope.MessagesModalInterface.bodyMessage = 'This email does not have any account! Please check your email or create an user!';
                        $scope.MessagesModalInterface.button1Class = 'btn btn-primary btn-margen';
                        $scope.MessagesModalInterface.bodyTitleMessageClass1 = 'image-modal-red';
                        $scope.MessagesModalInterface.bodyTitleMessageClass2 = 'fa fa-times fa-4x i-red';
                        $scope.open();
                    }
                }, function errorCallback(response) {
                    alert(response.statusText);
                });
            };
            // Modal de mensajes
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
            // Lista de países (Fijos)
            $scope.countries = lCountries;
            // End countries control code 
        }])

        // Controlador de la ventana de modal de mensajes
        .controller('MessagesModalCtrl', function ($uibModalInstance, MessagesModalInterface) {
            var $ctrl = this;
            $ctrl.titleMessage = MessagesModalInterface.titleMessage;
            $ctrl.bodyTitleMessage = MessagesModalInterface.bodyTitleMessage;
            $ctrl.bodyMessage = MessagesModalInterface.bodyMessage;
            $ctrl.button1Name = MessagesModalInterface.button1Name;
            $ctrl.button1Class = MessagesModalInterface.button1Class;
            $ctrl.button2Name = MessagesModalInterface.button2Name;
            $ctrl.button2Class = MessagesModalInterface.button2Class;
            $ctrl.bodyTitleMessageClass1 = MessagesModalInterface.bodyTitleMessageClass1;
            $ctrl.bodyTitleMessageClass2 = MessagesModalInterface.bodyTitleMessageClass2;
            $ctrl.button1Click = function () {
                $uibModalInstance.close({ action: 'btn1' });
            };
            $ctrl.button2Click = function () {
                $uibModalInstance.close({ action: 'btn2' });
            };
        })
