"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _records = require("../modules/records");

let SupportedArtifactTypes = {};

for (let artifact in _records.Artifacts) {
  let type = _records.Artifacts[artifact].getArtifactType() + '-' + _records.Artifacts[artifact].getArtifactSubtype();

  SupportedArtifactTypes[type.toLowerCase()] = _records.Artifacts[artifact];
}

const BaseArtifact = SupportedArtifactTypes['artifact-'];
/**
 * Parses json to return an Artifact class
 * @param {object} json - json artifact
 * @return {Artifact}
 * @example
 * let txid = "32dd84b5d756801b8050c7e2757c06cf73f1e5544e7c25afb0ef87e6ddbfba57"
 * let res = (await api.get(`snowflake.oip.fun:1606/artifact/get/${txid}`)).data
 * let [json] = res.results
 * let artifact = decodeArtifact(json)
 * artifact instanceof Artifact //true
 */

function decodeArtifact(json) {
  if (!json.artifact || !json.meta) {
    return new BaseArtifact(json);
  }

  if (json.meta.type === 'alexandria-media') {
    let artifactType = json.artifact.type.toLowerCase();
    return decode(artifactType, json);
  } else if (json.meta.type === 'oip041') {
    let artifactType = json.artifact.type.toLowerCase();
    return decode(artifactType, json);
  } else if (json.meta.type === 'oip042') {
    let type = json.artifact.type;
    let subtype = json.artifact.subtype || '';
    let artifactType = (type + '-' + subtype).toLowerCase();
    return decode(artifactType, json);
  } else {
    return new BaseArtifact['artifact-'](json); // eslint-disable-line
  }
}

function decode(aType, json) {
  for (let btype in SupportedArtifactTypes) {
    if (SupportedArtifactTypes.hasOwnProperty(btype) && btype === aType) {
      return new SupportedArtifactTypes[btype](json);
    }
  }

  return new BaseArtifact(json);
}

var _default = decodeArtifact;
exports.default = _default;