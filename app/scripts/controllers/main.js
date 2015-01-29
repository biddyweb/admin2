'use strict';

/**
 * @ngdoc function
 * @name dreamfactoryApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the dreamfactoryApp
 */
angular.module('dreamfactoryApp')

    // MainCtrl is the parent controller of everything.  Checks routing and deals with navs
    .controller('MainCtrl', ['$scope', 'UserDataService', 'SystemConfigDataService', '$location', '$http', 'DSP_URL', 'dfApplicationData', 'dfNotify', 'dfIconService',
        function ($scope, UserDataService, SystemConfigDataService, $location, $http, DSP_URL, dfApplicationData, dfNotify, dfIconService) {

        // So child controllers can set the app section title
        $scope.title = '';

        // CurrentUser
        $scope.currentUser = UserDataService.getCurrentUser();

        // Top Level Links
        $scope.topLevelLinks = [

            {
                path: '#/launchpad',
                label: 'LaunchPad',
                name: 'launchpad',
                icon: dfIconService().launchpad,
                show: false
            },
            {
                path: '#/quickstart',
                label: 'Admin',
                name: 'admin',
                icon: dfIconService().quickstart,
                show: false
            },
//            {
//                path: '#/dashboard',
//                label: 'Admin',
//                name: 'admin',
//                show: false
//            },
            {
                path: '#/login',
                label: 'Login',
                name: 'login',
                icon: dfIconService().login,
                show: false
            },
            {
                path: '#/logout',
                label: 'Logout',
                name: 'logout',
                icon: dfIconService().logout,
                show: false
            },
            {
                path: '#/register',
                label: 'Register',
                name: 'register',
                icon: dfIconService().register,
                show: false
            },
            {
                path: '#/profile',
                label: UserDataService.getCurrentUser().display_name || 'Guest',
                name: 'profile',
                icon: dfIconService().profile,
                show: false
            }

        ];


        $scope.topLevelNavOptions = {
            links: $scope.topLevelLinks
        };

        // Component links.  Displayed under the top bar.
        // plan is to have these loaded by role access eventually
        // Right now they are all hard coded
        $scope.componentLinks = [

            {
                name: 'quickstart',
                label: 'Quickstart',
                path: '/quickstart'
            },
//            {
//                name: 'dashboard',
//                label: 'Dashboard',
//                path: '/dashboard'
//            },
            {
                name: 'apps',
                label: 'Apps',
                path: '/apps'
            },
            {
                name: 'users',
                label: 'Users',
                path: '/users'
            },
            {
                name: 'roles',
                label: 'Roles',
                path: '/roles'
            },
            {
                name: 'services',
                label: 'Services',
                path: '/services'
            },
            {
                name: 'schema',
                label: 'Schema',
                path: '/schema'
            },
            {
                name: 'data',
                label: 'Data',
                path: '/data'
            },
            {
                name: 'file-manager',
                label: 'Files',
                path: '/file-manager'

            },
            {
                name: 'scripts',
                label: 'Scripts',
                path: '/scripts'
            },
            {
                name: 'apidocs',
                label: 'API Docs',
                path: '/apidocs'
            },
            {
                name: 'config',
                label: 'Config',
                path: '/config'
            },

            {
                name: 'package-manager',
                label: 'Packages',
                path: '/package-manager'
            },

        ];
        $scope.componentNavOptions = {
            links: $scope.componentLinks
        };


        // View options
        $scope.showAdminComponentNav = false;


        // PRIVATE API
        // Sets links for navigation
        $scope._setActiveLinks = function(linksArr, activeLinksArr) {

            angular.forEach(linksArr, function(link) {

                var i = 0;

                while (i < activeLinksArr.length) {

                    if (link.name === activeLinksArr[i]) {

                        link.show = true;
                        break;
                    }
                    else {
                        link.show = false;
                    }

                    i++;
                }
            })
        };

        // Sets a property on a link in the top level links
        $scope.setTopLevelLinkValue = function (linkName, linkProp, value) {


            for (var i = 0;  i < $scope.topLevelLinks.length; i++) {

                if ($scope.topLevelLinks[i].name === linkName) {

                    $scope.topLevelLinks[i][linkProp] = value;
                    break;
                }
            }
        }


        // WATCHERS


        $scope.$watch('currentUser', function(newValue, oldValue) {

            // There is no currentUser and we allow guest users
            if (!newValue && SystemConfigDataService.getSystemConfig().allow_guest_user) {

                // Do we allow open registration
                if (SystemConfigDataService.getSystemConfig().allow_open_registration) {

                    // yes
                    $scope._setActiveLinks($scope.topLevelLinks, ['launchpad', 'login', 'register']);

                }
                else {

                    // no
                    $scope._setActiveLinks($scope.topLevelLinks, ['launchpad', 'login']);
                }

            }
            // There is no currentUser and we don't allow guest users
            else if (!newValue && !SystemConfigDataService.getSystemConfig().allow_guest_user) {

                // Do we allow open registration
                if (SystemConfigDataService.getSystemConfig().allow_open_registration) {

                    // yes
                    $scope._setActiveLinks($scope.topLevelLinks, ['login', 'register']);

                    // check if we are resetting a password
                    if ($location.path() === '/reset-password') {

                        $location.url('/reset-password');
                    }
                    else if ($location.path() === '/user-invite'){

                        $location.url('/user-invite')
                    }
                    else if ($location.path() === '/register-confirm'){

                        $location.url('/register-confirm')
                    }
                    else {

                        $location.url('/login');
                    }
                }
                else {

                    // no
                    $scope._setActiveLinks($scope.topLevelLinks, ['login']);
                }

            }

            // we have a current user.  Is that user an admin
            else if (newValue.is_sys_admin) {

                // Have to set this explicitly
                $scope.setTopLevelLinkValue('profile', 'label', newValue.display_name);

                // Set active links fpr this user in the UI
                $scope._setActiveLinks($scope.topLevelLinks, ['launchpad', 'admin', 'profile']);

            }

            // is it a regular user
            else if (!newValue.is_sys_admin) {

                // Have to set this explicitly
                $scope.setTopLevelLinkValue('profile', 'label', newValue.display_name);

                // Sets active links for user in the UI
                $scope._setActiveLinks($scope.topLevelLinks, ['launchpad', 'profile']);
            }
        })

        $scope.$watch(function () {return UserDataService.getCurrentUser().display_name}, function (n, o) {


            if (!n) return;

            $scope.setTopLevelLinkValue('profile', 'label', n);
        })

        // on routechangesuccess deal with hide showing admin nav
        $scope.$on('$routeChangeSuccess', function (e) {

            if ($location.path() === '/launchpad') {
                $scope.showAdminComponentNav = false;
                return;
            }

            if ($location.path() === '/profile') {
                $scope.showAdminComponentNav = false;
                return;
            }

            if ($location.path() === '/logout') {

                $scope.showAdminComponentNav = false;
                return;
            }

            // this is not a launchpad or logout route so check is user is sys admin
            if ($scope.currentUser.is_sys_admin) {

                // yes.  show the component nav
                $scope.showAdminComponentNav = true;
                return;
            }
        })
    }])

    // Our LoginCtrl controller inherits from our TopLevelAppCtrl controller
    // This controller provides an attachment point for our Login Functionality
    // We inject $location because we'll want to update our location on a successful
    // login and the UserEventsService from our DreamFactory User Management Module to be able
    // to respond to events generated from that module
    .controller('LoginCtrl', ['dfAvailableApis', '$scope', '$location', '$timeout', 'UserDataService', 'UserEventsService', 'dfApplicationData', 'dfApplicationPrefs', 'SystemConfigDataService', 'dfNotify', function(dfAvailableApis, $scope, $location, $timeout, UserDataService, UserEventsService, dfApplicationData, dfApplicationPrefs, SystemConfigDataService, dfNotify) {

        // Login options array
        $scope.loginOptions = {
            showTemplate: true
        };

        // Listen for a password set success message
        // This returns a user credentials object which is just the email and password
        // from the register form
        // on success we...
        $scope.$on(UserEventsService.password.passwordSetSuccess, function(e, userCredsObj) {

            // alert success to user
            var messageOptions = {
                module: 'Users',
                type: 'success',
                provider: 'dreamfactory',
                message: 'Password reset successful.'
            }

            dfNotify.success(messageOptions);

            // Send a message to our login directive requesting a login.
            // We send our user credentials object that we received from our successful
            // registration along to it can log us in.
            $scope.$broadcast(UserEventsService.login.loginRequest, userCredsObj);
        });

        // Handle a login error
        // The directive will handle showing the message.  We just have to
        // stop the event propagation
        $scope.$on(UserEventsService.login.loginError, function (e) {
            e.stopPropagation();
        });


        // Listen for the login success message which returns a user data obj
        // When we have a successful login...
        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            // Set our parent's current user var
            $scope.$parent.currentUser = userDataObj;

            // API Options
            var options = {
                apis: []
            };

            // Set services on application object
            // are we an admin
            if (userDataObj.is_sys_admin) {

                // Hide our login template while services build
                $scope.loginOptions.showTemplate = false;

                // 250ms delay to allow the login screen to process
                // and disappear
                $timeout(function () {

                    // Set the apis we want
                    options.apis = dfAvailableApis.getApis().apis;

                    if (SystemConfigDataService.getSystemConfig().is_hosted) {
                        options.apis = dfAvailableApis.getApis().addEventApi().apis;
                    }

                    // Init the app
                    dfApplicationData.init(options.apis).then(
                        function () {

                            // Change our app location back to the home page
                            $location.url('/quickstart');
                            // $location.url('/dashboard');
                        }
                    );

                }, 250);
            }

            // not an admin.
            else {

                // Set our parent's current user var
                $scope.$parent.currentUser = userDataObj;

                // Init the application
                dfApplicationData.init();

                // Send em to launchpad
                $location.url('/launchpad');
            }
        });

    }])

    // Our LogoutCtrl controller inherits from out TopLevelAppCtrl controller
    // This controller provides an attachment point for our logout functionality
    // We inject $location and the UserEventsService...same as the LoginCtrl.
    .controller('LogoutCtrl', ['$scope', '$location', 'UserEventsService', 'dfApplicationData', 'SystemConfigDataService', function($scope, $location, UserEventsService, dfApplicationData, SystemConfigDataService) {

        // Listen for the logout success message
        // then we...
        $scope.$on(UserEventsService.logout.logoutSuccess, function(e, userDataObj) {

            // Set the current user var on the parent
            // the userDataObj passed with the success message is just a boolean
            // and should be 'false'
            $scope.$parent.currentUser = userDataObj;

            // Remove Application Object from sessionStorage on successful logout
            dfApplicationData.destroyApplicationObj();

            // redirect
            $location.url('/login')
        });
    }])

    // Our RegisterCtrl controller inherits from our TopLevelAppCtrl controller
    // This controller provides an attachment point for our register users functionality
    // We inject $location and UserEventService for the same reasons as stated in the LoginCtrl controller
    // description.
    .controller('RegisterCtrl', ['$scope', '$location', 'UserEventsService', 'SystemConfigDataService', function($scope, $location, UserEventsService, SystemConfigDataService) {


        // If we have an email service registered with open registration then
        // we require confirmation.  If that value is null...then we do not require
        // confirmation
        $scope.options = {
            confirmationRequired: SystemConfigDataService.getSystemConfig().open_reg_email_service_id
        };

        // Listen for a register success message
        // This returns a user credentials object which is just the email and password
        // from the register form
        // on success we...
        $scope.$on(UserEventsService.register.registerSuccess, function(e, userCredsObj) {

            // Send a message to our login directive requesting a login.
            // We send our user credentials object that we received from our successful
            // registration along to it can log us in.
            $scope.$broadcast(UserEventsService.login.loginRequest, userCredsObj);
        });


        // Listen for a register confirmation message
        // on confirmation required we...
        $scope.$on(UserEventsService.register.registerConfirmation, function(e) {

            // redirect to our registration thanks page
            // that contains more directions
            $location.url('/register-complete')
        });

        // We handle login the same way here as we did in the LoginCtrl controller
        // While this breaks the DRY(Don't repeat yourself) rule... we don't have access
        // to the LoginCtrl to do this for us and although we could ping from route to route
        // in order not to write the same code twice...the user experience would suffer and
        // we would probably write more code trying not to repeat ourselves.
        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            // Assign the user to the parent current user var
            $scope.$parent.currentUser = userDataObj;

            // redirect to the app home page
            $location.url('/launchpad');
        })

        $scope.$on(UserEventsService.login.loginError, function (e) {
            e.stopPropagation();
        });
    }])

    // displays our thanks for registering page
    .controller('RegisterCompleteCtrl', ['$scope', function($scope) {

        // Don't need anything in here.  Just yet anyway.
    }])

    // Controls confirmation flow
    .controller('RegisterConfirmCtrl', ['$scope', '$location', 'dfApplicationData', 'UserEventsService', 'SystemConfigDataService', 'dfNotify',  function($scope, $location, dfApplicationData, UserEventsService, SystemConfigDataService, dfNotify) {


        $scope.confirmOptions = {

            showTemplate: true,
            title: 'Registration Confirmation'
        };

        $scope.loginOptions = {
            showTemplate: false
        };

        $scope.registerLoginErrorMsg = '';


        // Listen for a confirmation success message
        // This returns a user credentials object which is just the email and password
        // from the register form
        // on success we...
        $scope.$on(UserEventsService.confirm.confirmationSuccess, function(e, userCredsObj) {

            // Send a message to our login directive requesting a login.
            // We send our user credentials object that we received from our successful
            // registration along to it can log us in.
            $scope.$broadcast(UserEventsService.login.loginRequest, userCredsObj);
        });


        // We handle login the same way here as we did in the LoginCtrl controller
        // While this breaks the DRY(Don't repeat yourself) rule... we don't have access
        // to the LoginCtrl to do this for us and although we could ping from route to route
        // in order not to write the same code twice...the user experience would suffer and
        // we would probably write more code trying not to repeat ourselves.
        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            // alert success to user
            var messageOptions = {
                module: 'Users',
                type: 'success',
                provider: 'dreamfactory',
                message: 'Registration Confirmation successful.'
            }

            dfNotify.success(messageOptions);

            // Assign the user to the parent current user var
            $scope.$parent.currentUser = userDataObj;

            // setup the app
            dfApplicationData.init();

            // redirect to the app home page
            $location.url('/launchpad');
        })

        // Handle a login error
        $scope.$on(UserEventsService.login.loginError, function(e, errMsg) {

            e.stopPropagation();
            $scope.registerLoginErrorMsg = errMsg.data.error[0].message;
        });
    }])

    // Controls Reset of password
    .controller('ResetPasswordEmailCtrl', ['$scope', '$location', 'dfApplicationData', 'dfAvailableApis', 'UserEventsService', 'SystemConfigDataService', 'dfNotify', '$timeout',  function($scope, $location, dfApplicationData, dfAvailableApis, UserEventsService, SystemConfigDataService, dfNotify, $timeout) {

        // Login options array
        $scope.loginOptions = {
            showTemplate: false
        };

        $scope.resetPasswordLoginErrorMsg = '';

        // Listen for a confirmation success message
        // This returns a user credentials object which is just the email and password
        // from the register form
        // on success we...
        $scope.$on(UserEventsService.password.passwordSetSuccess, function(e, userCredsObj) {

            e.stopPropagation();


            // Send a message to our login directive requesting a login.
            // We send our user credentials object that we received from our successful
            // registration along to it can log us in.
            $scope.$broadcast(UserEventsService.login.loginRequest, userCredsObj);
        });


        // We handle login the same way here as we did in the LoginCtrl controller
        // While this breaks the DRY(Don't repeat yourself) rule... we don't have access
        // to the LoginCtrl to do this for us and although we could ping from route to route
        // in order not to write the same code twice...the user experience would suffer and
        // we would probably write more code trying not to repeat ourselves.
        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            // alert success to user
            var messageOptions = {
                module: 'Users',
                type: 'success',
                provider: 'dreamfactory',
                message: 'Password reset successful.'
            }

            dfNotify.success(messageOptions);

            // Set our parent's current user var
            $scope.$parent.currentUser = userDataObj;

            // API Options
            var options = {
                apis: []
            };

            // Set services on application object
            // are we an admin
            if (userDataObj.is_sys_admin) {

                // Hide our login template while services build
                $scope.loginOptions.showTemplate = false;

                // 250ms delay to allow the login screen to process
                // and disappear
                $timeout(function () {

                    // Set the apis we want
                    options.apis = dfAvailableApis.getApis().apis;

                    if (SystemConfigDataService.getSystemConfig().is_hosted) {
                        options.apis = dfAvailableApis.getApis().addEventApi().apis;
                    }

                    // Init the app
                    dfApplicationData.init(options.apis).then(
                        function () {

                            // Change our app location back to the home page
                            $location.url('/quickstart');
                            // $location.url('/dashboard');
                        }
                    );

                }, 250);
            }

            // not an admin.
            else {

                // Set our parent's current user var
                $scope.$parent.currentUser = userDataObj;

                // Init the application
                dfApplicationData.init();

                // Send em to launchpad
                $location.url('/launchpad');
            }
        });


        // Handle a login error
        $scope.$on(UserEventsService.login.loginError, function(e, errMsg) {

            e.stopPropagation();
            $scope.resetPasswordLoginErrorMsg = errMsg.data.error[0].message;
        });

    }])

    // Controls User Invite Page
    .controller('UserInviteCtrl', ['$scope', '$location', 'dfApplicationData', 'UserEventsService', 'SystemConfigDataService', 'dfNotify',  function($scope, $location, dfApplicationData, UserEventsService, SystemConfigDataService, dfNotify) {

        $scope.confirmOptions = {

            showTemplate: true,
            title: 'Invitation Confirmation'
        };

        $scope.loginOptions = {
            showTemplate: false
        };

        $scope.confirmLoginErrorMsg = '';

        // Listen for a confirmation success message
        // This returns a user credentials object which is just the email and password
        // from the register form
        // on success we...
        $scope.$on(UserEventsService.confirm.confirmationSuccess, function(e, userCredsObj) {

            // Send a message to our login directive requesting a login.
            // We send our user credentials object that we received from our successful
            // registration along to it can log us in.
            $scope.$broadcast(UserEventsService.login.loginRequest, userCredsObj);
        });


        // We handle login the same way here as we did in the LoginCtrl controller
        // While this breaks the DRY(Don't repeat yourself) rule... we don't have access
        // to the LoginCtrl to do this for us and although we could ping from route to route
        // in order not to write the same code twice...the user experience would suffer and
        // we would probably write more code trying not to repeat ourselves.
        $scope.$on(UserEventsService.login.loginSuccess, function(e, userDataObj) {

            // alert success to user
            var messageOptions = {
                module: 'Users',
                type: 'success',
                provider: 'dreamfactory',
                message: 'User Confirmation successful.'
            }

            dfNotify.success(messageOptions);

            // Assign the user to the parent current user var
            $scope.$parent.currentUser = userDataObj;

            // setup the app
            dfApplicationData.init();

            // redirect to the app home page
            $location.url('/launchpad');
        });


        // Handle a login error
        $scope.$on(UserEventsService.login.loginError, function(e, errMsg) {

            e.stopPropagation();
            $scope.confirmLoginErrorMsg = errMsg.data.error[0].message;
        });
    }]);




















