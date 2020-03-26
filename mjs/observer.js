function observer(data){
  if(!data || typeof data != 'object') return;
  return new Observer(data)
};

function Observer(data){
  this.data = data;
  this.walk(data);
};

Observer.prototype = {
  walk:function(data){
    var me = this;
    Object.keys(data).forEach(key => {
      me.convert(key,data[key]);
    });
  },
  convert:function(key,value){
    this.defineReactive(this.data,key,value);
  },
  defineReactive:function(data,key,value){
    var dep = new Dep(),
        child = observer(value);
    Object.defineProperty(data,key,{
      enumerable:true,
      configurable:false,
      get:function(){
        if(Dep.target){
          dep.depend();
        }
        return value;
      },
      set:function(newValue){
        if(value === newValue) return;
        value = newValue;
        child = observer(newValue);
        dep.notify();
      }
    })
  },
};

var UID = 0;

function Dep(){
  this.subs = [];
  this.id = UID++;
};

Dep.prototype = {
  addSub:function(watcher){
    this.subs.push(watcher);
  },
  depend:function(){
    Dep.target.addDep(this);
  },
  removeDep:function(){

  },
  notify:function(){
    this.subs.forEach(item => {
      item.update();
    })
  }
};
