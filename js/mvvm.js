function MVVM(options) {
    this.$options = options;
    var data = this._data = this.$options.data;
    var me = this;

    //this.xxx代理 this.data.xxx
    Object.keys(data).forEach(function(key) {
        me._proxyData(me,key);
    })

    //初始化computed
    this._initComputed();
    //初始化observer 
    observer(data);
    //初始化compile
    this.$compile = new Compile(options.el || document.body,this);
}

MVVM.prototype = {
    $watch: function(exp,cb) {
        new Watcher(this,exp,cb);
    },
    _proxyData:function(me,key) {
        Object.defineProperty(me,key,{
            enumerable:true,
            configurable:false,
            get:function(){
                return me._data[key];
            },
            set:function(value) {
                me._data[key] = value;
            }
        })
    },
    _initComputed:function() {
        var me = this,
        computeds = this.$options.computed;
        if(typeof computeds === 'object'){
            Object.keys(computeds).forEach(function(key) {
                Object.defineProperty(me,key,{
                    enumerable:true,
                    configurable:false,
                    get:typeof computeds[key] == 'function' ? computeds[key] : computeds[key].get,
                    set:function() {}
                })
            })
        }
    }
}