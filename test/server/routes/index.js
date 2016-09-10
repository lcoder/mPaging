var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(['/','/test'], function(req, res, next) {
  res.render('test.html') ;

});

router.get('/api/test', function(req, res, next) {
  res.json( { total: 100 , title: '服务器返回的数据' } ) ;
});

module.exports = router;
