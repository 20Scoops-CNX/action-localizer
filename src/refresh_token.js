#!/usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const {google} = require('googleapis')
const readline = require('readline')
const yargs = require('yargs')
// GITHUB
const core = require('@actions/core')
const message = core.info

const organization = yargs.argv

let clientID =
  '566100359694-bou3ui0ph4bdanp2mt0m3jla7vaf5v2t.apps.googleusercontent.com'
let projectID = 'quickstart-1573029008546'

let clientSecret

if (typeof organization.clientID !== 'undefined') {
  clientID = organization.clientID
}

if (typeof organization.projectID !== 'undefined') {
  projectID = organization.projectID
}

if (typeof organization.clientSecret !== 'undefined') {
  clientSecret = organization.clientSecret
} else {
  message(
    'If using under 20Scoops organization. Can input only client_secret. If not 20scoops please input data order by client_id project_id client_secret .',
  )
  message(
    'Example default 20scoops. node refresh_token/index.js --clientSecret=your_client_secret',
  )
  message(
    'Example other organization. node refresh_token/index.js --clientID=your_client_id --projectID=your_project_id --clientSecret=your_client_secret',
  )
  process.exit(1)
}

const credentials = {
  client_id: clientID,
  project_id: projectID,
  client_secret: clientSecret,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost'],
}

const introduce = () => message('Welcome to Localizer for get refresh token')

const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']

const tokenPath = path.resolve(__dirname, './token.json')

introduce()

const localizer = () => {
  getOauth2Client({
    ...credentials,
  }).then(oAuth2Client => {
    getToken(oAuth2Client).then(token => {
      message('LOCALIZER_REFRESH_TOKEN: ' + token.refresh_token)
      message('get refresh token success.')
      clearToken()
    })
  })
}

const getToken = oAuth2Client => {
  return fs
    .readFile(tokenPath, 'utf-8')
    .then(token => {
      return JSON.parse(token)
    })
    .catch(() => {
      return getNewToken(oAuth2Client)
    })
    .catch(errorMessage => {
      message('Error while trying to retrieve access token')
      message(errorMessage)
    })
}

const getOauth2Client = credentials => {
  const {
    client_secret: clientSecret,
    client_id: clientId,
    redirect_uris: redirectUris,
  } = credentials

  return new Promise(resolve => {
    const oAuth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      redirectUris[0],
    )
    resolve(oAuth2Client)
  })
}

const getNewToken = oAuth2Client => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  })

  message('Authorize this app by visiting this url')
  message(authUrl)

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question('Enter the code from that page here: ', code => {
      rl.close()
      oAuth2Client
        .getToken(code)
        .then(({tokens: token}) => {
          return fs
            .writeFile(tokenPath, JSON.stringify(token))
            .then(() => token)
        })
        .then(token => {
          message('Token stored to' + tokenPath)
          resolve(token)
        })
        .catch(reject)
    })
  })
}

const clearToken = () => {
  return fs.remove(tokenPath)
}

localizer()
