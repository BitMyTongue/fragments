const { createErrorResponse, createSuccessResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

module.exports = async (req, res) => {
  const { id } = req.params;

  let fragment;
  try {
    fragment = await Fragment.byId(req.user, id);
  } catch {
    return res.status(404).json(createErrorResponse(404, 'not found'));
  }

  return res.status(200).json(
    createSuccessResponse({
      fragment,
    })
  );
};
