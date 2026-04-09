const express = require('express');
const router = express.Router();

const { Fragment } = require('../../model/fragment');

router.put('/fragments/:id', async (req, res) => {
  try {
    const ownerId = req.user;
    const { id } = req.params;
    const type = req.get('Content-Type');

    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json({
        status: 'error',
        error: {
          message: 'Unsupported content type',
        },
      });
    }

    const updatedFragment = await Fragment.update(ownerId, id, req.body, type);

    res.status(200).json({
      status: 'ok',
      fragment: updatedFragment,
    });
  } catch (err) {
    console.error(err);

    res.status(err.statusCode || 500).json({
      status: 'error',
      error: {
        message: err.message,
      },
    });
  }
});

module.exports = router;