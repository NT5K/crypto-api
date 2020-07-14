const path = require('path');
const express = require('express');
const router = express.Router();

module.exports = router;

router.get('/', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/index.html'));
});
router.get('/2', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/index2.html'));
});
