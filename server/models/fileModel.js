'use strict';

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const FileSchema = new mongoose.Schema({
  fileEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionAlgorithm: {
    type: String,
    enum: ['AES-256-GCM', 'AES-256-CBC'],
    default: 'AES-256-GCM'
  },
  keyHash: {
    type: String,
    default: ''
  },
  standardUpload: {
    type: Boolean,
    default: false
  },
  expireAt: {
    type: Date,
    required: true,
    index: { expires: '0s' }
  },
  fileId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  userId: String,
  fileName: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    required: true,
    index: true
  },
  fileEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionAlgorithm: {
    type: String,
    enum: ['AES-256-GCM', 'AES-256-CBC'],
    default: 'AES-256-GCM'
  },
  keyHash: {
    type: String,
    index: true
  },
  chunkInfo: [{
    chunkNumber: Number,
    chunkPath: String,
    uploaded: {
      type: Boolean,
      default: false
    }
  }],
  storagePath: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  expireAt: {
    type: Date,
    index: { expires: '7d' }
  }
});

const ShareLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    default: uuidv4,
    unique: true
  },
  fileId: String,
  accessToken: String,
  expires: Date,
  downloadLimit: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = {
  File: mongoose.model('File', FileSchema),
  ShareLink: mongoose.model('ShareLink', ShareLinkSchema)
};