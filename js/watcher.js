function  Watcher(vm,expOrFn,cb) {
    this.depIds = {};
    this.cb = cb;
    this.expOrFn = expOrFn;
    this.$vm = vm;

    if(typeof expOrFn == 'function'){
        this.getter = expOrFn;
    }else{
        this.getter = this.parseGetter(expOrFn.trim());
    }

    this.value = this.get();
}

Watcher.prototype = {
    addDep: function(dep){
        if(!this.depIds.hasOwnProperty(dep.id)){
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    update: function() {
        this.run();
    },
    run: function() {
        var oldvalue = this.value;
        var newValue = this.get();
        if(oldvalue == newValue) return;
        this.cb.call(this.$vm,newValue,oldvalue);
    },
    get:function() {
        Dep.target = this ;
        var value = this.getter.call(this.$vm,this.$vm);
        Dep.target = null;
        return value;
    },
    parseGetter:function(exp) {
        if (/[^\w.$]/.test(exp)) return; 

        var exps = exp.split('.');
        return function (vm) {
            exps.forEach(function(key){
                if(!vm) return;
                vm = vm[key];
            });
            return vm;  
        }
    }
}