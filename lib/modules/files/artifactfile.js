"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.regexp.split");

class ArtifactFile {
  constructor(json, parent) {
    this.file = {};

    if (json) {
      if (typeof json === 'object') {
        this.fromJSON(json);
      } else if (typeof json === 'string') {
        try {
          this.fromJSON(JSON.parse(json));
        } catch (e) {}
      }
    } // Check if we are being passed a parent
    // If we are, compare the class names


    if (parent && typeof parent === 'object' && parent.getClassName() === 'Artifact') {
      this.parent = parent;
    }
  }

  getParent() {
    return this.parent;
  }

  setFilename(filename) {
    this.file.fname = filename;
  }

  getFilename() {
    return this.file.fname;
  }

  setDisplayName(displayName) {
    this.file.dname = displayName;
  }

  getDisplayName() {
    if (!this.file.dname || this.file.dname === '') {
      return this.getFilename();
    }

    return this.file.dname;
  }

  setDuration(seconds) {
    if (isNaN(seconds)) {
      return;
    }

    this.file.duration = seconds;
  }

  getDuration() {
    return this.file.duration;
  }

  setType(type) {
    this.file.type = this.capitalizeFirstLetter(type);
  }

  getType() {
    return this.file.type;
  }

  setSubtype(subtype) {
    if (subtype === 'cover') {
      subtype = 'Thumbnail';
    }

    this.file.subtype = this.capitalizeFirstLetter(subtype);
  }

  getSubtype() {
    return this.file.subtype;
  }

  setFilesize(filesize) {
    this.file.fsize = filesize;
  }

  getFilesize() {
    return this.file.fsize;
  }

  setContentType(contentType) {
    this.file.ctype = contentType;
  }

  getContentType() {
    return this.file.ctype;
  }

  setFileNotes(notes) {
    this.file.fnotes = notes;
  }

  getFileNotes() {
    return this.file.fnotes;
  }

  setSoftware(software) {
    this.file.software = software;
  }

  getSoftware() {
    return this.file.software;
  }

  setNetwork(network) {
    this.file.network = network;
  }

  getNetwork() {
    return this.file.network;
  }

  setLocation(loc) {
    this.file.location = loc;
  }

  getLocation() {
    if (this.file.location) {
      return this.file.location;
    }

    if (this.parent) {
      return this.parent.getLocation();
    }

    return undefined;
  }

  setPaymentScale(newScale) {
    this.file.scale = newScale;
  }

  getPaymentAddresses() {
    if (this.file.payment && this.file.payment.addresses && this.file.payment.addresses !== []) {
      return this.file.payment.addresses;
    }

    if (this.parent) {
      return this.parent.getPaymentAddresses();
    } else {
      return [];
    }
  }

  getPaymentScale() {
    //  Check if scale is a string
    //    If so, check if the string is a number, or represented as a ratio
    //      return the parsed number or ratio bound
    if (this.file.scale) {
      if (typeof this.file.scale === 'string') {
        if (isNaN(this.file.scale) && this.file.scale.split(':').length === 2) {
          return this.file.scale.split(':')[1];
        } else if (!isNaN(this.file.scale)) {
          return parseInt(this.file.scale);
        }
      }

      return this.file.scale;
    } else {
      // If the local file scale is undefined, return the parent scale
      if (this.parent) {
        return this.parent.getPaymentScale();
      } else {
        return 1;
      } // Default return one if we can't get the parents payment scale, and our payment scale is not set either

    }
  }

  setSuggestedPlayCost(suggestedPlayCostFiat) {
    this.file.sugPlay = suggestedPlayCostFiat;
  }

  getSuggestedPlayCost() {
    if (this.file.sugPlay && !isNaN(this.file.sugPlay)) {
      return this.file.sugPlay / this.getPaymentScale();
    } else {
      return 0;
    }
  }

  setSuggestedBuyCost(suggestedBuyCostFiat) {
    this.file.sugBuy = suggestedBuyCostFiat;
  }

  getSuggestedBuyCost() {
    if (this.file.sugBuy && !isNaN(this.file.sugBuy)) {
      return this.file.sugBuy / this.getPaymentScale();
    } else {
      return 0;
    }
  }

  setDisallowPlay(disallowPlay) {
    this.file.disPlay = disallowPlay;
  }

  getDisallowPlay() {
    return this.file.disPlay || false;
  }

  setDisallowBuy(disallowBuy) {
    this.file.disBuy = disallowBuy;
  }

  getDisallowBuy() {
    return this.file.disBuy || false;
  }

  isValid() {
    if (!this.file.fname) {
      return {
        success: false,
        error: 'No Filename!'
      };
    }

    return true;
  }

  isPaid() {
    let paid = false;

    if (this.file.sugPlay) {
      paid = true;
    }

    if (this.file.sugBuy) {
      paid = true;
    }

    return paid;
  }

  toJSON() {
    return JSON.parse(JSON.stringify(this.file));
  }

  fromJSON(fileObj) {
    if (fileObj) {
      if (fileObj.fname) {
        this.setFilename(fileObj.fname);
      }

      if (fileObj.dname) {
        this.setDisplayName(fileObj.dname);
      }

      if (fileObj.fsize) {
        this.setFilesize(fileObj.fsize);
      }

      if (fileObj.duration) {
        this.setDuration(fileObj.duration);
      }

      if (fileObj.type) {
        this.setType(fileObj.type);
      }

      if (fileObj.subtype) {
        this.setSubtype(fileObj.subtype);
      }

      if (fileObj.network) {
        this.setNetwork(fileObj.network);
      }

      if (fileObj.location) {
        this.setLocation(fileObj.location);
      }

      if (fileObj.cType) {
        this.setContentType(fileObj.cType);
      }

      if (fileObj.ctype) {
        this.setContentType(fileObj.ctype);
      }

      if (fileObj.fNotes) {
        this.setFileNotes(fileObj.fNotes);
      }

      if (fileObj.fnotes) {
        this.setFileNotes(fileObj.fnotes);
      }

      if (fileObj.software) {
        this.setSoftware(fileObj.software);
      }

      if (fileObj.sugPlay) {
        this.setSuggestedPlayCost(fileObj.sugPlay);
      }

      if (fileObj.sugBuy) {
        this.setSuggestedBuyCost(fileObj.sugBuy);
      }

      if (fileObj.disPlay) {
        this.setDisallowPlay(fileObj.disPlay);
      }

      if (fileObj.disBuy) {
        this.setDisallowBuy(fileObj.disBuy);
      }
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }

}

exports.default = ArtifactFile;