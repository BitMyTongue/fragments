const contentType = require('content-type');

const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

function getBaseUrl(req) {
  // locally runs on 8080, but different on AWS
  const base = process.env.API_URL || `http://${req.headers.host}`;
  return new URL(base);
}

module.exports = async (req, res) => {
  let type;

  logger.debug(
    { user: req.user, contentType: req.get('Content-Type') },
    'POST /v1/fragments received'
  );

  try {
    ({ type } = contentType.parse(req));
  } catch (err) {
    // if we couldn't parse log it
    logger.warn({ err }, 'unable to parse Content-Type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
  
  // log if type is unsupported
  if (!Fragment.isSupportedType(type)) {
    logger.warn({ type }, 'unsupported Content-Type');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // log if request body is not a buffer
  if (!Buffer.isBuffer(req.body)) {
    logger.warn({ type }, 'request body is not a Buffer');
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  // Create fragment
  const fragment = new Fragment({
    ownerId: req.user,
    type: req.get('Content-Type'),
    size: req.body.length,
  });

  // Save fragment and metadata
  try {
    await fragment.save();
    await fragment.setData(req.body);
  } catch (err) {
    logger.error({ err }, 'Failed to save fragment');
    return res.status(500).json(createErrorResponse(500, 'Couldn\'t create fragment'));
  }
  
  logger.info(
    { id: fragment.id, ownerId: fragment.ownerId, size: fragment.size },
    'fragment created successfully'
  );

  // set Location header
  const baseUrl = getBaseUrl(req);
  const location = new URL(`/v1/fragments/${fragment.id}`, baseUrl);

  res.setHeader('Location', location.toString());
  
  return res.status(201).json(
    createSuccessResponse({
      fragment,
    })
  );
};