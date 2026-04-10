/**
 * Get a fragment by id
 */

const MarkdownIt = require('markdown-it');
const sharp = require('sharp');
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const { id, ext } = req.params;

  let fragment;
  try {
    fragment = await Fragment.byId(req.user, id);
  } catch {
    return res.status(404).json(createErrorResponse(404, 'not found'));
  }

  // For assignment 2, we will need to allow text/*
  // // Assignment 1: only text/plain required
  // if (fragment.type !== 'text/plain') {
  //   return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
  // }
  const extensionMap = {
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  const requestedType = ext ? extensionMap[ext] : fragment.mimeType;

  if (ext && !requestedType) {
    return res.status(415).json(createErrorResponse(415, 'unsupported extension'));
  }

  if (ext && !fragment.formats.includes(requestedType)) {
    return res.status(415).json(createErrorResponse(415, 'unsupported conversion'));
  }

  let data = await fragment.getData();

  if (fragment.mimeType === 'text/markdown' && requestedType === 'text/html') {
    const md = new MarkdownIt();
    data = Buffer.from(md.render(data.toString()));
  } else if (fragment.mimeType === 'text/markdown' && requestedType === 'text/plain') {
    data = Buffer.from(data.toString());
  } else if (fragment.mimeType === 'text/html' && requestedType === 'text/plain') {
    const stripped = data.toString().replace(/<[^>]*>/g, '');
    data = Buffer.from(stripped);
  } else if (fragment.mimeType === 'application/json' && requestedType === 'text/plain') {
    const pretty = JSON.stringify(JSON.parse(data.toString()), null, 2);
    data = Buffer.from(pretty);
  } else if (fragment.mimeType.startsWith('image/') && requestedType.startsWith('image/')) {
    if (requestedType === 'image/png') {
      data = await sharp(data).png().toBuffer();
    } else if (requestedType === 'image/jpeg') {
      data = await sharp(data).jpeg().toBuffer();
    } else if (requestedType === 'image/webp') {
      data = await sharp(data).webp().toBuffer();
    } else if (requestedType === 'image/gif') {
      data = await sharp(data).gif().toBuffer();
    }
  }

  res.setHeader('Content-Type', requestedType);
  res.status(200).send(data);
};