let _v = "0.0.0"
let validCache = false

async function getLatestVersion(updateCache = false, returnCacheInfo = false) {
  // Setup cache if it doesn't exist
  if (!validCache) {
    updateCache = true
  }
  if (!updateCache){
    if (returnCacheInfo) {
      return { version: _v, isCached: true };
    }
    return _v
  }

  // Get results + cache them
  let response = await fetch("https://api.fontawesome.com/releases");
  if (!response.ok) {
    throw new Error(`Failed to fetch latest version: ${response.statusText}`);
  }
  let data = (await response.json()).releases
  let latestRelease = data.find(release => release.isLatest)
  if (!latestRelease || !latestRelease.version) {
    throw new Error("Latest version was not found in the response");
  }

  let v = latestRelease.version

  _v = v
  validCache = true

  if (returnCacheInfo) {
    return { version: _v, isCached: true };
  }
  return v
}

module.exports = getLatestVersion;

if (require.main === module) {
  getLatestVersion(false, true)
    .then(data => console.log(data))
    .catch(err => console.error(err));
  getLatestVersion(false, true)
    .then(data => console.log(data))
    .catch(err => console.error(err));
}