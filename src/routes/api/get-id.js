/**
 * Get a fragment by id
 */

const MarkdownIt = require('markdown-it');
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
  }

  res.setHeader('Content-Type', requestedType);
  res.status(200).send(data);
};