const fs = require('fs-extra')
const path = require('path')
const {google} = require('googleapis')
const stringifyObject = require('stringify-object')
const xmlBuilder = require('xmlbuilder')
const StringsFile = require('strings-file')
// GITHUB
const core = require('@actions/core')

try {
  // INPUT FROM ACTIONS
  const clientID = core.getInput('CLIENT_ID')
  const projectID = core.getInput('PROJECT_ID')
  const localizerCredentialToken = core.getInput('LOCALIZER_CREDENTIAL_TOKEN')
  const localizerRefreshToken = core.getInput('LOCALIZER_REFRESH_TOKEN')
  const localizerFile = core.getInput('LOCALIZER_FILE')

  // MESSAGE
  const message = core.info
  const introduce = message => core.info(message)

  // CREDENTIAL
  const credentials = {
    client_id: clientID,
    project_id: projectID,
    client_secret: localizerCredentialToken,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    redirect_uris: ['urn:ietf:wg:oauth:2.0:oob', 'http://localhost'],
  }

  // DEFAULT CONFIG
  const defaultConfig = {
    dest: './locales/',
    filename: {
      en: 'en.js',
      de: 'de.js',
    },
    url: '',
    ignoreColumns: [],
    sheetName: '',
    module: 'esm',
  }

  // GET CONFIG FROM LOCALIZER
  let config
  try {
    config = require(path.resolve(process.cwd(), localizerFile))
  } catch (err) {}

  config = {
    ...defaultConfig,
    ...config,
  }

  const tokenPath = path.resolve(__dirname, './token.json')

  introduce('Welcome to Localizer')

  const localizer = () => {
    const refreshToken = {
      refresh_token: localizerRefreshToken,
    }
    fs.writeFile(tokenPath, JSON.stringify(refreshToken)).then(() =>
      message('Create refresh token success'),
    )
    getOauth2Client({
      ...credentials,
    }).then(oAuth2Client => {
      getToken(oAuth2Client).then(token => {
        oAuth2Client.setCredentials(token)
        generateLocales(oAuth2Client)
      })
    })
  }

  const getToken = () => {
    return fs
      .readFile(tokenPath, 'utf-8')
      .then(token => {
        return JSON.parse(token)
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

  const getLocale = (index, rows) => {
    return rows
      .filter(columns => columns.length > 1)
      .reduce((locale, columns) => {
        return {
          ...locale,
          [columns[0]]: columns[index],
        }
      }, {})
  }

  const convertLocaleObjectToFileString = (locale, lang) => {
    switch (config.module) {
      case 'esm':
        return `const ${lang} = ${stringifyObject(
          {translation: locale},
          {
            indent: '  ',
            singleQuotes: true,
          },
        )};
    
    export default ${lang};
    `
      case 'commonjs':
        return `module.exports = ${stringifyObject(locale, {
          indent: '  ',
          singleQuotes: true,
        })};
    `
      case 'android-xml':
        return convertLocalesToAndroidXML(locale)
      case 'ios-strings':
        return convertLocalesToIOS(locale)
      default:
        message('Wrong type module')
        process.exit(0)
    }
  }

  const convertLocalesToAndroidXML = locale => {
    const xml = xmlBuilder.create('resource', {encoding: 'UTF-8'})
    Object.keys(locale).forEach(key => xml.ele(key, locale[key]))
    return xml.end({pretty: true})
  }

  const convertLocalesToIOS = locale => {
    const str = StringsFile.compile(locale)
    return str
  }

  const generateLocales = auth => {
    if (!config.url) {
      message('you need to provide url(google sheet) in localizer.js file')
      return
    }

    const sheets = google.sheets({version: 'v4', auth})
    let spreadsheetId
    try {
      spreadsheetId = config.url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)[1]
    } catch (err) {
      message('url(google sheet) provided in localizer.js is invalid format')
      return
    }

    const getLocaleDataFromSheet = sheetName => {
      return sheets.spreadsheets.values
        .get({
          spreadsheetId: spreadsheetId,
          range: `${sheetName}!B1:1`,
        })
        .then(res => {
          const headColumns = res.data.values[0]
          return sheets.spreadsheets.values
            .get({
              spreadsheetId: spreadsheetId,
              range: `${sheetName}!A2:999`,
            })
            .then(res => {
              const rows = res.data.values
              if (rows.length && headColumns.length) {
                const firstRow = headColumns.filter(column => {
                  return !config.ignoreColumns.includes(column)
                })
                return firstRow.reduce((allLocales, column, index) => {
                  const lang = column.toLowerCase()
                  const position = index + 1
                  const locales = {
                    [lang]: getLocale(position, rows),
                  }

                  return {
                    ...allLocales,
                    ...locales,
                  }
                }, {})
              } else {
                message(`No data found for ${sheetName} sheet name`)
                return null
              }
            })
        })
    }

    if (typeof config.sheetName === 'string') {
      config.sheetName = [config.sheetName]
    }

    const localeDataFromSheets = config.sheetName.map(sheetName => {
      return getLocaleDataFromSheet(sheetName)
    })

    return Promise.all(localeDataFromSheets)
      .then(allLocales => {
        const locales = allLocales
          .filter(locales => !!locales)
          .reduce((prevLocales, locales) => {
            const mergeLocales = {
              ...prevLocales,
            }

            const langs = Object.keys(locales)

            langs.forEach(lang => {
              if (mergeLocales[lang]) {
                mergeLocales[lang] = {
                  ...mergeLocales[lang],
                  ...locales[lang],
                }
              } else {
                mergeLocales[lang] = {
                  ...locales[lang],
                }
              }
            })

            return mergeLocales
          }, {})

        const langs = Object.keys(locales)
        let pathName
        let destination = config.dest
        langs.forEach(lang => {
          if (config.filename[lang]) {
            pathName = config.filename[lang]
          } else {
            pathName = `${lang}.js`
          }
          if (config.module === 'android-xml') {
            pathName = `values-${lang}/strings.xml`
            destination = `res`
          } else if (config.module === 'ios-strings') {
            pathName = `${lang}.lproj/Localizable.strings`
            destination = `Strings`
          }
          fs.outputFileSync(
            path.resolve(destination, pathName.toLowerCase()),
            convertLocaleObjectToFileString(locales[lang], lang),
          )
        })

        message(`Files have saved in ${path.resolve(destination)}`)
        process.exit(0)
      })
      .catch(err => {
        message('The API returned an error: ' + err)
        if (
          err.message === 'Invalid Credentials' ||
          err.message === 'The caller does not have permission'
        ) {
          message("Token is invalid or don't have permission.")
          message('Retry again.')
        }

        if (err.message === 'invalid_client') {
          message(
            'Secret is incorrect, please run again and enter correct secret',
          )
        }
      })
  }

  localizer()
} catch (error) {
  core.setFailed(error.message)
}
