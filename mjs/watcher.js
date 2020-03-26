function Watcher(vm,exp,cb){
  this.depIds = {};
  this.$vm = vm;
  this.cb = cb;
  this.exp = exp;
  if(typeof exp === 'function'){
    this.getter = exp;
  }else{
    this.getter = this.parseGetter(exp.trim());
  }

  this.value = this.get();
};

Watcher.prototype = {
  addDep:function(sub) {
    if(!this.depIds.hasOwnProperty(sub.id)){
      sub.addSub(this);
      this.depIds[sub.id] = sub;
    }
  },
  update:function() {
    this.run();
  },
  run:function() {
    var oldValue = this.value;
    var newValue = this.get();
    if(oldValue == newValue) return;
    this.cb.call(this.$vm,newValue,oldValue);
  },
  get:function(){
    Dep.target = this;
    var value = this.getter.call(this.$vm,this.$vm);
    Dep.target = null;
    return value;
  },
  parseGetter:function(exp){
    if (/[^\w.$]/.test(exp)) return;
    var exps = exp.split('.');
    return function(vm) {
      exps.forEach(key => {
        if(!vm) return;
        vm = vm[key];
      });
      return vm;
    }
  },
};