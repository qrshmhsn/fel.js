require("./json2");

var Db = {};

Db.set = function(key, value){
  window.localStorage.setItem(key, JSON.stringify(value));
};
Db.get = function(key){
  var v = window.localStorage.getItem(key);
  if(!v)
    return null;
  else
    return JSON.parse(v);
};
Db.keys = function(){
  var ks = window.localStorage.keys;
  if(ks)
    return ks;
  ks = [];
  for(var i = 0; i < window.localStorage.length; ++i)
    ks.push(window.localStorage.key(i));
  return ks;
};
Db.remove = function(key){
  window.localStorage.removeItem(key);
};
Db.clear = function(){
  window.localStorage.clear();
};

exports.Db = Db;