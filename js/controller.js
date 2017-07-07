angular.element(function() {
    angular.bootstrap(document, ['Solicitudes']);
});

angular.module('Solicitudes', ['angularFileUpload', 'darthwade.loading', 'ngTagsInput', 'ngAnimate', 'ngSanitize', 'ui.bootstrap'])

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