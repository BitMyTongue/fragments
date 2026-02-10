/**
 * Get a fragment by id
 */

const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const { id } = req.params;

  let fragment;
  try {
    fragment = await Fragment.byId(req.user, id);
  } catch {
    return res.status(404).json(createErrorResponse(404, 'not found'));
  }

  // Assignment 1: only text/plain required
  if (fragment.type !== 'text/plain') {
    return res.status(415).json(createErrorResponse(415, 'unsupported media type'));
  }

  const data = await fragment.getData();
  res.setHeader('Content-Type', fragment.type);
  res.status(200).send(data);
};