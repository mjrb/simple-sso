# simple-sso
__NOT FOR PRODUCTION USE. THIS IS JUST A PROTOTYPE USE IT AT YOUR OWN RISK__

## motivation
sso systems that i looked into didn't seem to be able to work with signle page applications and backendonly/template based web applications. This does just that.
## how to make examples work
make add the line `127.0.0.1 provider resource` to _/etc/localhosts_
if both were accesed via localhost they would override eachothers cookie jars, so this fixes it.

## how it works
The provider _index.js_ saves a cookie to track if users are logged in and if a user lands on `authorize` without being logged in it sends it to a login form.

### template based apps
example _resource_  
when an end user is not logged in and goes to `/` it redirects them to `http://provider:3000/authorize?redirect=http://resource:3001/login`. once the end user is authenticated they are sent to the redirect url via a urlencoded post request. the resource server accepts the post request and gets the username and token.

### single page apps
example _public/app.html_
in this case `http://provider:3000/app.html` but it could easily be on a different server. The user goes to the single page app and the app fetches `http://provider:3000/authorize`. __important__ fetch sould have the option `credentials: include` sot that the provider can access its own cookie from fetch. if the user was successfully authenticated then the request will return the username and token. if the user was not already logged in it will give the response 401. the spa will send the user to the provider by redirecting them to `http://provider:3000/authorize?get=true&redirect=http://provider:3000/app.html`. __important__ if get=true is not set in the url it will redirect to the app with a post request and some fileservers may not like that (like the default express one). once authenticated the provider will redirect them to the app asif the user was starting from the beginning but now when the app does that first fetch the will get json in the form of `{username, token}`