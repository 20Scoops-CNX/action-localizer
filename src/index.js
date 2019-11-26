const localizer = require('20scoops-localizer')
// GITHUB
const core = require('@actions/core')

try {
  // INPUT FROM ACTIONS
  let clientID = core.getInput('CLIENT_ID')
  let projectID = core.getInput('PROJECT_ID')
  let localizerFile = core.getInput('LOCALIZER_FILE')

  // MESSAGE
  const message = core.info

  if (clientID === '') {
    clientID =
      '566100359694-bou3ui0ph4bdanp2mt0m3jla7vaf5v2t.apps.googleusercontent.com'
  }
  if (projectID === '') {
    projectID = 'quickstart-1573029008546'
  }
  if (localizerFile === '') {
    localizerFile = './localizer.js'
  }

  message('Welcome to Localizer with Github Actions')
  localizer({
    clientID: clientID,
    projectID: projectID,
    localizerFile: localizerFile,
  })
} catch (error) {
  core.setFailed(error.message)
}
