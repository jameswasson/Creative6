angular.module('myApp', []).controller('myController', ['$scope', '$http',
    function($scope, $http) {
        $http.get('/user/profile')
            .success(function(data, status, headers, config) {
                $scope.user = data;
                $scope.st = data['start_time'];
                $scope.num_purchased = data['num_purchased'];
                $scope.error = "";
                $scope.current_rate = 1;
                $scope.rates = [1, 5, 10, 100];
                $scope.base_prices = [5, 10, 100, 200];
                for (var i = 0; i < $scope.num_purchased.length; i++) {
                    $scope.current_rate += $scope.rates[i] * $scope.num_purchased[i];
                }

                var update_buttons = function() {
                    for (var i = 0; i < $scope.num_purchased.length; i++) {
                        var button_id = 'b' + i;
                        var new_text = "Machine " + (i + 1) +
                            " Owned: " + $scope.num_purchased[i] +
                            " Rate: " + $scope.rates[i] +
                            " Price: " + Math.floor($scope.base_prices[i] * Math.pow(1.1, $scope.num_purchased[i]));
                        document.getElementById(button_id).innerHTML = new_text;
                    }
                };
                update_buttons();

                var looper = function() {
                    var today = new Date().getTime();
                    var time_since_start = Math.floor((today - $scope.st) * $scope.current_rate / 1000);
                    document.getElementById('myCodeHere').innerHTML = "You have had a membership to this site for " +
                        time_since_start + " seconds!";
                    setTimeout(looper, 5);
                };

                $scope.update_server = function() {
                    $scope.user['start_time'] = $scope.st;
                    $scope.user['num_purchased'] = $scope.num_purchased;
                    var data = $scope.user;
                    var url = "/user/update_time/";

                    $http({
                            url: url,
                            method: "POST",
                            data: { 'user': $scope.user }
                        })
                        .then(function(response) {
                                console.log("Success")
                            },
                            function(response) { // optional
                                console.log("failed")
                            });
                };

                $scope.buttonListener = function(index) {
                    var price = Math.floor($scope.base_prices[index] * Math.pow(1.1, $scope.num_purchased[index]));
                    var rate_increase = $scope.rates[index];
                    var today = new Date().getTime();
                    var rate = $scope.current_rate;
                    var time_since_start = Math.floor((today - $scope.st) * $scope.current_rate / 1000);

                    if (time_since_start >= price) {

                        $scope.st = Math.floor((rate * $scope.st + price * 1000) / rate); // updates start_time with the produce reduction
                        $scope.st = today + Math.floor(($scope.st - today) / (1 + rate_increase / rate)); //updates start_time to match new rate

                        $scope.current_rate += rate_increase; //that holy update
                        $scope.num_purchased[index]++;
                        $scope.update_server();
                        update_buttons();
                    }
                };
                looper();
            }).
        error(function(data, status, headers, config) {
            $scope.user = {};
            $scope.error = data;
        });
    }
]);
