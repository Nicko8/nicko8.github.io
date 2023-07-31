function ping (ip, callBack) {
  var img = new Image();
  var start = new Date().getTime();
  var flag = false;
  var isCloseWifi = true;
  var hasFinish = false;
  img.onload = function () {
    if (!hasFinish) {
      flag = true;
      hasFinish = true;
      img.src = 'X:\\';
      console.log('Ping ' + ip + ' success. ');
      callBack(true)
    }
  };
  img.onerror = function () {
    if (!hasFinish) {
      if (!isCloseWifi) {
        flag = true;
        img.src = 'X:\\';
        console.log('Ping ' + ip + ' success. ');
        callBack(true)
      } else {
        console.log('network is not working!');
        callBack(false)
      }
      hasFinish = true;
    }
  };
  setTimeout(function () {
    isCloseWifi = false;
    console.log('network is working, start ping...');
  }, 2);
  img.src = 'http://' + ip + '/' + start;
  var timer = setTimeout(function () {
    if (!flag) {
      hasFinish = true;
      img.src = 'X://';
      flag = false;
      console.log('Ping ' + ip + ' fail. ');
      callBack(false)
    }
  }, 1500);
}
