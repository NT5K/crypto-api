const path = require('path');
const express = require('express');
const router = express.Router();

module.exports = router;

router.get('/', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/index.html'));
});
router.get('/form', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/form.html'));
});
router.get('/form2', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/form2.html'));
});
router.get('/pkgen', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/pkgen.html'));
});
router.get('/circulating/statera', (__, res) => {
    res.sendFile(path.join(__dirname, '/../public/html/statera.html'));
});