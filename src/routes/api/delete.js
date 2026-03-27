const express = require('express');
const router = express.Router();

const { Fragment } = require('../../model/fragment');

router.delete('/fragments/:id', async (req, res) => {
  try {
    const ownerId = req.user;
    const { id } = req.params;

    console.log('Deleting fragment:', id);

    await Fragment.delete(ownerId, id);

    res.status(200).json({
      status: 'ok',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: 'error',
      error: {
        message: err.message,
      },
    });
  }
});

module.exports = router;