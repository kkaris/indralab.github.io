/* awsServices.js - Organizes all functions relevant for AWS

Functions in this file are relevant to using AWS capabilites made available 
as javascript SDK. The functions are either wrapper/helper functions or 
direct implementations of the different services.

General Docs: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/

Docs for the S3 serivce:
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

Docs for the cognito services:
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentity.html
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityServiceProvider.html
https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CognitoIdentityCredentials.html

In order to work and test this file there are three alternatives:
1.  Create an untracked directory (e.g. 'temp') in the same path as the html 
    you want to test it with, then load like 'src="temp/myJSfile.js"'
2.  Run 'python -m http.server 5000 --bind 127.0.0.1' and load through 
    'src="http://localhost/myJSfile.js"'
    see https://docs.python.org/3/library/http.server.html for more info
3.  Upload it to AWS S3 and load it through:
    'src="https://s3.amazonaws.com/my-bucket/path/myJSfile.js"'

*/

// Check where script is loaded
var ENV = '';

var APP_CLIENT_ID = '';
var IDENTITY_POOL_ID = '';
var AUTH_ENDPOINT_BASE_URL = '';
var USER_POOL_ID = '';
var USER_POOL_ARN = '';
var IDENTITY_POOL_ID = '';
var STATE_COOKIE_NAME = '';
var ACCESSTOKEN_COOKIE_NAME = '';
var IDTOKEN_COOKIE_NAME = '';
var CUSTOM_SCOPE = '';

function setEnv(env) {
  if (env) ENV = env;
  if (ENV == 'indra') {
      console.log('case INDRALAB')
      APP_CLIENT_ID = APP_CLIENT_ID_INDRALAB_POOL;
      IDENTITY_POOL_ID = IDENTITY_POOL_ID_INDRALAB;
      AUTH_ENDPOINT_BASE_URL = AUTH_ENDPOINT_BASE_URL_INDRALAB;
      USER_POOL_ID = USER_POOL_ID_INDRALAB;
      USER_POOL_ARN = USER_POOL_ARN_INDRALAB
      IDENTITY_POOL_ID = IDENTITY_POOL_ID_INDRALAB;
      STATE_COOKIE_NAME = INDRALAB_STATE_COOKIE_NAME;
      ACCESSTOKEN_COOKIE_NAME = INDRALAB_ACCESSTOKEN_COOKIE_NAME;
      IDTOKEN_COOKIE_NAME = INDRALAB_IDTOKEN_COOKIE_NAME;
      CUSTOM_SCOPE = CUSTOM_SCOPE_INDRALAB;
      FALLBACK_URL = INDRALAB_FALLBACK_URL;
      return true;
  } else if (ENV = 'emmaa') {
    console.log('case EMMAA')
      APP_CLIENT_ID = APP_CLIENT_ID_EMMAA_POOL;
      IDENTITY_POOL_ID = IDENTITY_POOL_ID_EMMAA;
      AUTH_ENDPOINT_BASE_URL = AUTH_ENDPOINT_BASE_URL_EMMAA;
      USER_POOL_ID = USER_POOL_ID_EMMAA;
      USER_POOL_ARN = USER_POOL_ARN_EMMAA;
      IDENTITY_POOL_ID = IDENTITY_POOL_ID_EMMAA;
      STATE_COOKIE_NAME = EMMAA_STATE_COOKIE_NAME;
      ACCESSTOKEN_COOKIE_NAME = EMMAA_ACCESSTOKEN_COOKIE_NAME;
      IDTOKEN_COOKIE_NAME = EMMAA_IDTOKEN_COOKIE_NAME;
      CUSTOM_SCOPE = CUSTOM_SCOPE_EMMAA;
      FALLBACK_URL = EMMAA_FALLBACK_URL;
      return true;
  } else {
    console.log('No environment set')
    return false;
  }
}

// Delete once the client pages set the environment themselves
$(document).ready(function(){
  setEnv() // Temporary usage to not break pages dependent on previous implemenations
})

// CONSTANTS AND IDs
var EMMMAA_BUCKET = 'emmaa';
var NOTIFY_TAG_ID = 'status-notify';
var EMMAA_STATE_COOKIE_NAME = 'emmaaStateCookie=';
var EMMAA_ACCESSTOKEN_COOKIE_NAME = 'emmaaAccessCookie=';
var EMMAA_IDTOKEN_COOKIE_NAME = 'emmaaIdCookie=';
var EMMAA_FALLBACK_URL = 'https://indralab.github.io/emmaa/dashboard';
var INDRALAB_STATE_COOKIE_NAME = 'indralabStateCookie=';
var INDRALAB_ACCESSTOKEN_COOKIE_NAME = 'indralabAccessCookie=';
var INDRALAB_IDTOKEN_COOKIE_NAME = 'indradb-authorization=';
var INDRALAB_FALLBACK_URL = 'https://db.indra.bio';
var STATE_VALUE = '' // State value to secure requests to cognito endpoints
var ACCESS_TOKEN_STRING = ''; // access token string
var ACCESS_TOKEN = {}; // access token
var ID_TOKEN_STRING = ''; // id token string
var ID_TOKEN = {}; // id token
var REFRESH_TOKEN = ''; // refresh token (only provided using username/password or App client secret authorization)
var USER_SIGNED_IN = false;
var SIGN_IN_ALERT_MESSAGE = 'Must be signed in to see page. Click OK to proceed to login.'

// cognito parameters
var APP_CLIENT_ID_EMMAA_POOL = '3ej6b95mbsu28e5nkcb6oa8fnp';
var APP_CLIENT_ID_INDRALAB_POOL = '45rmn7pdon4q4g2o1nr7m33rpv';
var AUTH_ENDPOINT_BASE_URL_EMMAA = 'https://emmaa.auth.us-east-1.amazoncognito.com/oauth2/authorize?';
var AUTH_ENDPOINT_BASE_URL_INDRALAB = 'https://auth.indra.bio/login?';
var identityId = '' // 
var USER_POOL_ID_EMMAA = 'us-east-1_5sb1590b6'; // User pool ID; User info lives here
var USER_POOL_ID_INDRALAB = 'us-east-1_ZROvpv8jf'; // User pool ID; User info lives here
var USER_POOL_ARN_EMMAA = 'arn:aws:cognito-idp:us-east-1:292075781285:userpool/us-east-1_5sb1590b6';
var USER_POOL_ARN_INDRALAB = 'arn:aws:cognito-idp:us-east-1:292075781285:userpool/us-east-1_ZROvpv8jf';
var IDENTITY_POOL_ID_EMMAA = 'us-east-1:76854655-a365-4e69-b080-0f8ca94a46fc';
var IDENTITY_POOL_ID_INDRALAB = ''; // NOT SET UP YET
var CUSTOM_SCOPE_EMMAA = '+https://s3.console.aws.amazon.com/s3/buckets/emmaa/results.read';
var CUSTOM_SCOPE_INDRALAB = '';
AWS.config.region = 'us-east-1' // Set region

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
});
var cogIdServiceProvider = new AWS.CognitoIdentityServiceProvider();

function _getNewStateValue() {
  let state = ''
  let numArray = window.crypto.getRandomValues(new Uint32Array(4))
  for (num of numArray) {
    state = state + window.btoa(num).replace(/=/g, '');
  }
  return state;
}

function _readCookie(cookieName) {
  console.log('function _readCookie()')
  var nameEQ = cookieName;
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) {
      console.log('function _readCookie() resolved cookie value ' + c.substring(nameEQ.length, c.length))
      return c.substring(nameEQ.length, c.length)
    };
  }
  console.log('function _readCookie() did not resolve cookie value')
  return;
}

function _writeCookie(cookieName, value, hours) {
  console.log('function _writeCookie(cookieName, value, hours)')
  if (hours) {
    let _hours = 0;
    maxHours = 24;
    if (hours > maxHours) {
      _hours = maxHours;
    } else {
      _hours = hours;
    } 
    // console.log('hours to expiration: ' + _hours)
    var date = new Date();
    date.setTime(date.getTime() + (_hours*60*60*1000))
    var expires = '; expires=' + date.toGMTString();
    // console.log('cookie expiration date: ' + date.toGMTString());
  } else var expires = '';  // No expiration or infinite?

  var cookieString = cookieName + value + expires + '; path=/'
  // console.log('cookieString: ' + cookieString);
  document.cookie = cookieString;
}

function _deleteCookie(cookieName) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}

// CHANGE TEXT
function notifyUser(outputNode, outputText) {
  // Add other things here
  outputNode.textContent = outputText;
}

function getDictFromUrl(url) {
  console.log('function getDictFromUrl(url)')
  // No url provided
  if (!url) return;
  let returnArray = [];
  var query = {};
  var usedSplit = '';
  // Check if (authorization) code flow or token (implicit) flow
  if (url.split('#')[1]) {
    query = url.split('#')[1];
    usedSplit = '#'
  } else if (url.split('?')[1]) {
    query = url.split('?')[1];
    usedSplit = '?'
  } else return;
  
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });

  returnArray.push(result)
  returnArray.push(usedSplit)
  // console.log('returnArray: ')
  // console.log(returnArray)
  return returnArray;
}

function checkLatestModelsUpdate() {
  //                               mode, tableBody, testResultTableBody, s3Interface,      bucket, model, prefix, maxKeys, endsWith
  listObjectsInBucketUnAuthenticated('modelsLastUpdated', null, null, new AWS.S3(), EMMMAA_BUCKET, null, 'models', 1000, '.pkl')
}

function listObjectsInBucketUnAuthenticated(mode, tableBody, testResultTableBody, s3Interface, bucket, model, prefix, maxKeys, endsWith) {
  console.log('listObjectsInBucketUnAuthenticated(mode, tableBody, testResultTableBody, s3Interface, bucket, model, prefix, maxKeys, endsWith)')
  let _maxKeys = 1000
  if (maxKeys & maxKeys < _maxKeys) {
    _maxKeys = maxKeys;
  }
  let params = {
    Bucket: bucket,
    MaxKeys: _maxKeys,
    Prefix: prefix
  }
  s3Interface.makeUnauthenticatedRequest('listObjectsV2', params, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      // console.log('List of objects resolved from S3')
      // console.log(data)
      switch (mode) {
        // get last time a specific model was updated
        case 'listModelInfo':
          // Populates the model info table (passed as tableBody)
          listModelInfo(tableBody, data.Contents, bucket, model, endsWith)
          break;
        // List last time models were updated
        case 'modelsLastUpdated': // was 'modelUpdate'
          modelsLastUpdated(data.Contents, endsWith)
          break;
        // List tests for selected model on models page
        case 'listModelTests':
          // tableBody, testResultTableBody, keyMapArray, model, endsWith
          console.log('case "listModelTests"')
          listModelTests(tableBody, testResultTableBody, data.Contents, model, endsWith);
          break;
        // Default behaviour: just list key,value pairs in table
        default:
          let tableBodyTag = document.getElementById(tableBody);
          tableBodyTag.innerHTML = null;
          for (let i = 0; i < data.Contents.length; i++) {
            if (data.Contents[i].Key.endsWith(endsWith)) {
              let tableRow = document.createElement('tr');
              
              let modelColumn = document.createElement('td');

              let modelLink = document.createElement('a');
              modelLink.setAttribute('href', '#'); // LINK TO MODEL
              modelLink.textContent = data.Contents[i].Key.split('/')[1]
              modelColumn.appendChild(modelLink)
              tableRow.appendChild(modelColumn);

              let testColumn = document.createElement('td');
              testColumn.textContent = data.Contents[i].Key.split('/')[2].split('.')[0];
              let testJsonPromise = getPublicJson(bucket, data.Contents[i].Key);
              testJsonPromise.then(function(json){
                if (json[0].passed) {
                  testColumn.setAttribute('bgcolor', '00AA55;'); // Green if passed
                }
                else {
                  testColumn.setAttribute('bgcolor', 'DD4400;'); // Red if not
                }
              });
              tableRow.appendChild(testColumn);

              tableBodyTag.appendChild(tableRow);
            }
          }
      }
    }
  });
};

// Lists object in bucket 'bucket' with prefix 'prefix' and file ending in 'endsWith'
// in table 'tableBody'
function listObjectsInBucket(tableBody, s3Interface, bucket, prefix, maxKeys, endsWith) {
  console.log('function listObjectsInBucket(s3Interface, bucket, prefix, maxKeys, endsWith)')
  let _maxKeys = 1000
  if (maxKeys) {
    _maxKeys = maxKeys;
  }
  let params = {
    Bucket: bucket,
    MaxKeys: _maxKeys,
    Prefix: prefix
  }
  s3Interface.listObjectsV2(params, function(err, data) {
    if (err) console.log(err, err.stack);
    else {
      // console.log('List of objects resolved from S3')
      // console.log(data)
      // let tableBody = document.getElementById('listObjectsTableBody');
      tableBody.innerHTML = null;
      for (let i = 0; i < data.Contents.length; i++) {
        if (data.Contents[i].Key.endsWith(endsWith)) {
          let tableRow = document.createElement('tr');
          
          let modelColumn = document.createElement('td');

          let modelLink = document.createElement('a');
          modelLink.setAttribute('href', '#'); // LINK TO MODEL
          modelLink.textContent = data.Contents[i].Key.split('/')[1]
          modelColumn.appendChild(modelLink)
          tableRow.appendChild(modelColumn);

          let testColumn = document.createElement('td');
          testColumn.textContent = data.Contents[i].Key.split('/')[2].split('.')[0];
          let testJsonPromise = getPublicJson(bucket, data.Contents[i].Key);
          testJsonPromise.then(function(json){
            if (json[0].passed) {
              testColumn.setAttribute('bgcolor', '00AA55;'); // Green if passed
            }
            else {
              testColumn.setAttribute('bgcolor', 'DD4400;'); // Red if not
            }
          });
          tableRow.appendChild(testColumn);

          tableBody.appendChild(tableRow);
        }
      }
    }
  });
};

function getTokenFromAuthEndpoint(currentUrl, redirectUrl) {
  console.log('function getTokenFromAuthEndpoint(currentUrl)')
  STATE_VALUE = _getNewStateValue();
  // console.log('current STATE_VALUE: ' + STATE_VALUE)
  _writeCookie(STATE_COOKIE_NAME, STATE_VALUE, 24)
  base_url = AUTH_ENDPOINT_BASE_URL;
  resp_type = 'response_type=token';
  client_id='client_id=' + APP_CLIENT_ID;
  if (redirectUrl) redirect = 'redirect_uri=' + redirectUrl;
  else if (currentUrl) redirect = 'redirect_uri=' + currentUrl;
  else redirect = 'redirect_uri=' + FALLBACK_URL;
  console.log('redirect_uri set to: ' + redirect);
  state = 'state=' + STATE_VALUE;
  custom_scope = CUSTOM_SCOPE;
  scope = 'scope=aws.cognito.signin.user.admin+openid+profile' + custom_scope;
  // scope = 'scope=aws.cognito.signin.user.admin+openid+profile';
  let get_url = base_url + resp_type + '&' + client_id + '&' + redirect + '&' + state + '&' + scope;
  console.log('get_url=' + get_url);
  window.location.replace(get_url) // Redirect
}

// Signing in using username/password, return JWTs
function signIn(uname, pwd) {
  console.log('Sign in button')
  cogIdServiceProvider.initiateAuth({
    'AuthFlow': 'USER_PASSWORD_AUTH', // What type of authentication to use
    'ClientId': APP_CLIENT_ID, // AppClientId for UserPool
    
    AuthParameters: {
      'USERNAME': uname,
      'PASSWORD': pwd
      /* '<StringType>': ... */
    }
  }, function(err, data) {
    return responseResolve(err, data);
  });
}

function responseResolve(err, data) {
  if (err) {
    console.log('Error occured while trying to initiate auth:')
    console.log(err, err.stack)
    return err
  } else {
    console.log('Auth data:')
    console.log(data)
    tokenData = data.AuthenticationResult;
    verifyUser(tokenData.AccessToken, tokenData.IdToken);
    return tokenData;
  }
}

// CHECK SIGN IN
// this function checks if there are tokens, if they are valid and either shows the user logged in or (if enforced) redirects user to login
function checkSignIn(forceLogin) {
  console.log('function checkSignIn(forceLogin)')
  STATE_VALUE = _readCookie(STATE_COOKIE_NAME);
  ID_TOKEN_STRING = _readCookie(IDTOKEN_COOKIE_NAME)
  ACCESS_TOKEN_STRING = _readCookie(ACCESSTOKEN_COOKIE_NAME)
  let dict_split = getDictFromUrl(window.location.href);
  if (dict_split) var return_url = window.location.href.split(dict_split[1]);
  else var return_url = window.location.href;
  console.log('Return url: ' + return_url);

  // Check if tokens in fragment
  if (dict_split && dict_split[0]['state'] != STATE_VALUE) {
    console.log('State Value does not match');
    if (forceLogin) {
      // Non-matching state values could be casued by traffic interception!
      cancelPageLoad();
      getTokenFromAuthEndpoint(return_url)
    } else {
      let outputNode = document.getElementById(NOTIFY_TAG_ID)
      notifyUser(outputNode, 'State Value does not match');
    }
  } else if (dict_split && 
             dict_split[0]['state'] == STATE_VALUE && 
             dict_split[0]['access_token']) {
    verifyUser(dict_split[0]['access_token'], dict_split[0]['id_token'])
    return true;
  }

  // If no fragment tokens, check if tokens are in cookie
  if (ID_TOKEN_STRING &&  ACCESS_TOKEN_STRING) {
    verifyUser(ACCESS_TOKEN_STRING, ID_TOKEN_STRING)
    return true;
  }

  // If all fails, do nothing or redirect to login
  if (forceLogin) {
    cancelPageLoad();
    getTokenFromAuthEndpoint(return_url)
  } else {
    let outputNode = document.getElementById(NOTIFY_TAG_ID)
    notifyUser(document.getElementById('status-notify'), 'Unable to retreive session/session expired. Please log in again.');
    return;
  }
}

// VERIFY USER 
function verifyUser(accessTokenString, idTokenString, forceLogin, return_url) {
  console.log('function verifyUser(accessTokenString, idTokenString)');
  cogIdServiceProvider.getUser({'AccessToken': accessTokenString}, function(err, data) {
    if (err) {
      if (forceLogin) {
        cancelPageLoad();
        getTokenFromAuthEndpoint(return_url)
      }
      notifyUser(document.getElementById(NOTIFY_TAG_ID), 'Could not verify user');
      return false;
    } else {
      // console.log('User meta data from cogIdServiceProvider.getUser()');
      // console.log(data);
      username = data.Username;
      let outputNode = document.getElementById(NOTIFY_TAG_ID)
      notifyUser(outputNode, 'Hello ' + username);
      ACCESS_TOKEN_STRING = accessTokenString;
      _writeCookie(ACCESSTOKEN_COOKIE_NAME, ACCESS_TOKEN_STRING, 24);
      ID_TOKEN_STRING = idTokenString;
      _writeCookie(IDTOKEN_COOKIE_NAME, ID_TOKEN_STRING, 24);
      USER_SIGNED_IN = true
      addUserToIdentityCredentials(ID_TOKEN_STRING) // Add user to identity pool 
      return true;
    }
  })
}

// ADD USER TO THE CREDENTIALS LOGIN MAP
function addUserToIdentityCredentials(userIdToken) {
  console.log('Linking user to IdentityPool with ID userIdToken')
  var IdPool = 'cognito-idp.us-east-1.amazonaws.com/' + USER_POOL_ID;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: IDENTITY_POOL_ID,
      Logins: {
        // cognito-idp.<region>.amazonaws.com/<YOUR_USER_POOL_ID>: idToken
        IdPool: userIdToken
      }
  });

  // Call to obtain credentials
  AWS.config.credentials.get(function(){

      // Credentials will be available when this function is called.
      var accessKeyId = AWS.config.credentials.accessKeyId;
      var secretAccessKey = AWS.config.credentials.secretAccessKey;
      var sessionToken = AWS.config.credentials.sessionToken;
  });

  // AWS.config.credentials.identityId should now be available
  console.log('Setting identityId for logged in user')
  identityId = AWS.config.credentials.identityId;
}

function grabJSON(url, callback) {
  return $.ajax({url: url, dataType: "json"});
};

function cancelPageLoad() {
  console.log('function cancelPageLoad ()')
  console.log('HIT window.stop()')
  // window.stop();
}

// Can be used when something is public on S3
function getPublicJson(bucket, key) {
  console.log('function getPublicJson(bucket, key)')
  console.log('bukcet: ' + bucket + ', key: ' + key)
  // For production: get list of results and select based on some criteria
  base_url = 'https://s3.amazonaws.com'
  pathString = '/' + bucket + '/' + key;
  url = base_url +  pathString.replace(/\/\//g, '/'); // Avoid double slashes
  // console.log('getting json from ' + url);
  return grabJSON(url);
}

function sortByCol(arr, colIndex){
  arr.sort(sortFunction)
  function sortFunction(a, b) {
    a = a[colIndex]
    b = b[colIndex]
    return (a === b) ? 0 : (a < b) ? -1 : 1
  }
}

// When and object needs credentials to be read from S3
function readFromS3(bucket, key) {
  s3InterfaceOptions = {
    credentials: AWS.config.credentials
  }
  console.log('New s3 interface object using the following AWS.config.credentials:');
  console.log(AWS.config.credentials);
  var s3Interface = new AWS.S3(s3InterfaceOptions);
  var params = {
    Bucket: bucket,
    Key: key
    // Bucket: 'emmaa-test',
    // Key: 'test-results-public/test_json_on_S3.json',
  }

  // Documentation for s3.getObject():
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  s3Interface.getObject(params, function(err, data){
    if (err) {
      console.log(err);
      return;
    }
    else {
      console.log('S3 getOjbect resolved successfully');
      console.log(data);
      let s3ObjectJSON = data.Body;
      return s3ObjectJSON;
    }
  });
}
