# app-seed-v1
comproDLS App SEED, with Angular 1.x & NodeJS

https://appseedv1.comprodls.com/

## Pre-requisites 
1. Install [GIT](https://git-scm.com/downloads)
2. Install [NodeJS](https://nodejs.org/en/download/)

## URL Query Parameters
- **embed**: This query parameter is used to launch App in embedded mode (e.g App embedded inside iframe of another LMS / App). When App is launched in embedded mode, Angular rootscope variable **"$rootscope.embedMode"** is set to true. You can use this variable to do customisation in embedded mode e.g. Hiding header and footer.

    `https://appseedv1.comprodls.com?embed`

- **return_url**: When the App is launched from another LMS/App, there may be a requirement for a navigation link (typically a "Go Back" button in header) to go back to parent LMS/App. To acheive this, Parent LMS can set **return_url** parameter to provide a "Go Back" URL. Apps can use Angular rootscope variable **"$rootscope.returnUrl"** to get this value (for setting Go back navigation link).
 
    `https://appseedv1.comprodls.com?return_url=https%3A%2F%2Fcanvas.instructure.com`
      

## Project Config
```javascript
{        
    "app" : {
        //Redirect http to https.
        //REDIRECT_TO_HTTPS environment variable (if set) will take precedence
        "redirectToHttps" : true,
        // User Session related properties
        "session" : {
            // Secret for encrypting session cookie
            "cookie-secret": "secret",
            
            //Max age of Stay SignIn cookie (7 days)
            "staySignInAge": 604800000, 
            // Redis URLs and Credentials
            // This is used to store user sessions on backend
            "redis" : {
                // Redis URL
                // REDIS_URL environment variable (if set) will take precedence
                "url": "redis://username:password@redishost:redisport"
            }
        },
        // Authentication related propeties
        "authentication" : {         

            // Authentication Method. Allowed values are "cas" and "local"
            // DEFAULT_AUTHENTICATION_METHOD environment variable (if set) will take precedence
            "defaultMethod" : "local",    

            // Local Authentication
            // App handles authentication itself using a login Page)
            "local" : {
                //To enable cookie-based single sign on 
                "cookieSsoEnabled": false,
                //Domain to use for storing cookies
                "cookieDomain" : ".comprodls.com",
            },

            // CAS Authentication 
            // App Redirects to a Centralised CAS server for authentication
            "cas" : {
                // CAS Host
                "host": "https://sso.comprodls.com",                
                "serviceValidateURL":"/p3/serviceValidate",
                "loginURL" : "/"                
            },

             // Allowed user roles. For all other user roles a 401 Not authorized message will be shown
            "allowedUserRoles" : ['student','teacher','admin'],

             // Org id used for One time authentication Method
             "otaOrgid" : "cdev1",
        }
        
    }            
}
```

## Environment Variables
* **DLS_ENV** - DLS Core environment. Default value is 'production'.
* **APP_ENVIRONMENT** - Application environment. Possible values are prod, stg, qa, local etc.
* **DEFAULT_AUTHENTICATION_METHOD** - Default method for user authentication. Possible values are local and cas.
* **REDIRECT_TO_HTTPS** - Set this to true for redirecting all the http calls to https.
* **REDIS_URL** - Redis URL. This is used for storing user sessions.
* **DLS_UNCOMPRESSED_MODE** - This is used for debugging on production servers. Set this to true for serving uncompressed JS/CSS files.
* **NODE_MODULES_CACHE** - This is set to false to disable npm module caching (used by heroku).
* **NEW_RELIC_NO_CONFIG_FILE** - This is set to false to use default New Relic config.
* **NEW_RELIC_APP_NAME** - Application name on NewRelic e.g. "appseed-v1". Application will be tracked via this name in New Relic.
* **NEW_RELIC_LICENSE_KEY** - NewRelic License key. This is automatically set by NewRelic Heroku Add-on.
* **NEW_RELIC_LOG** - NewRelic logs location. This is automatically set by NewRelic Heroku Add-on.
* **PAPERTRAIL_API_TOKEN** - Papertrail API token. This is used for storing logs and is automatically set by Papertrail Heroku Add-on.

## Setup development environment 
### (1) Setup BLANK repository
* Create a new BLANK repository named after your App (say App1).
* Clone App1 repository to your local folder
```git clone https://github.com/comprodls/app1.git```

### (2) Connect your new repository to the SEED (for recieving updates)
* Navigate to root of above local folder
* Add the SEED repository as a remote, call it "seedv1"
```git remote add seedv1 https://github.com/comprodls/app-seed-v1.git```
* Fetch all the branches of the SEED remote
```git fetch seedv1```

### (3) Create DEVELOP (working) and MASTER (Production/Live/Release) branches 
For branching model, see http://nvie.com/posts/a-successful-git-branching-model/
* Create DEVELOP branch based on SEED master
 ```git checkout -b develop seedv1/master```
* Push DEVELOP branch to remote origin 
```git push origin develop```
* Change the remote of local DEVELOP branch to origin
```git branch develop --set-upstream-to origin/develop```
* Create MASTER branch from DEVELOP
```
git branch master
git push origin master
```

### (4) Deploy and Run the App locally
* Install required libraries: gulp (for automation) and bower (for front end package management) using following command
```npm install -g bower gulp```
* Run ```npm install``` to install node dependencies 
* Run ```bower install``` to install bower dependencies
* Run ```gulp serve``` to start app in development mode (unminified and unbundled files) and open http://localhost:8080/ in your browser to access the app.
* To run app in production mode (minified and bundled files), run following commands
```
gulp build
gulp serve:dist
```
### (5) Make changes/features to the DEVELOP branch
* Make sure you're on the DEVELOP branch (or feature branch created from DEVELOP)
```
   git add ...
   git commit -m "..."
   git push origin develop 
```
### (6) Pull (Merge) new features from SEED
* This merges the latest commits from seedv1/master into your develop branch.
```  
  git checkout develop (Make sure that you are on your develop branch)
  git pull origin develop (Make sure latest updates from develop branch have been synced locally)
  git fetch seedv1 (Make sure latest updates from SEED have been synced locally)
  git merge seedv1/master
  git push origin develop
```

### (7) Release changes to master
Refer to the branching model for advanced workflows around creating release branches & tags. A simplified workflow without release branches is provided below.
* Merge DEVELOP to MASTER
```
git pull origin develop
git pull origin master
git checkout master
git merge develop
git push origin master 
```

* Create a tag on MASTER
``` 
git tag 1.0.0
git push --tags
```

## Project Folders & Files
* src/app/ - Frontend files. Contains frontend angular modules and stylesheets.
* src/app/modules/ - Angular modules and other angular components
* src/app/themes/ - CSS and Less stylesheets.
* src/app/assets/images - Image files
* src/server/ - NodeJS backend
* src/server/app.js - Express app routes and configuration
* src/server/config - Configuration files for different environments
* gulpfile.js - Contains gulp tasks definitions
* bower.json - Frontend dependencies
* package.json - NodeJS dependencies
* .gitignore - Standard gitignore file. Contains list of files and folders to ignore while commiting to GIT

## Coding conventions

https://github.com/comprodls/node-style-guide

https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md

http://nvie.com/posts/a-successful-git-branching-model/


## Making Changes

### Git Release Process for New Features/Issues
* Create a GitHub issue describing the purpose of the change/extension. Provide as many details as possible.
* Create a local branch with the same name as the GitHub issue.
* Switch to the branch
* Make changes and commit
* Push your changes to GitHub
* Generate a Pull Request on GitHub
* Await feedback from code review/audit
* Merge to Master -> triggers deployment

### Adding new environment
* Create a config file for new environment under "src/server/config" folder.
* Set "APP_ENVIRONMENT" environment variable to use this new environment.

### Adding new JS and CSS libraries
* Install the new library using bower.

    ```bower install libraryname --save```

* You dont need to make any other changes. This file should be automtically available in both development and production build modes

### Adding new angular modules
* Create a folder for new module inside "src/app/modules/" folder.
* Add a dependency in src/app/index.js.

```javascript
(function() {
    'use strict';

    angular.module('seedApp', [
        'seedApp.core',
        'seedApp.global',
        'seedApp.dashboard',
        'seedApp.another',
        'seedApp.login',
        'seedApp.error',
        'seedApp.newmodule' // New Module Dependency
    ]);
})();
```
