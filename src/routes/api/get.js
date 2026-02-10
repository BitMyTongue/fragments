// src/routes/api/get.js

/**
 * Get a list of fragments for the current user
 */


const { createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  // if expand user wants the full fragment

  const expand = req.query.expand === '1';
  const fragments = await Fragment.byUser(req.user, expand);

  res.status(200).json(createSuccessResponse({ fragments }));
};