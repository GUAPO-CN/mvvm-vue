function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function(data) {
        var me = this;
        Object.keys(data).forEach(function(key) {
            me.convert(key,data[key]);
        })
    },
    convert:function(key,value) {
        this.defineReactive(this.data,key,value);
    },
    defineReactive:function(data,key,value) {
        var dep = new Dep(),
            child = observer(value);
        Object.defineProperty(data,key,{
            enumerable:true,
            configurable:false,
            get:function() {
                if(Dep.target){
                    dep.depend()
                }
                return value;
            },
            set:function(newValue) {
                if(value == newValue) return;
                value = newValue;
                child = observer(newValue);
                dep.notify();
            }
        })
    },
}

var uid = 0;
function Dep(params) {
    this.subs = [];
    this.id = uid ++ ;
    console.log(this.subs,"id"+uid)
}

Dep.prototype = {
    addSub: function(sub) {
        this.subs.push(sub);
    },
    depend: function() {
        Dep.target.addDep(this);
    },
    removeSub: function(sub) {
        var index = this.subs.indexOf(sub);
        if(index != -1){
            this.subs.splice(index,1);
        }
    },
    notify: function() {
        this.subs.forEach(function(sub) {
            sub.update();
        })
    }
}
























function observer(data) {
    if(!data || typeof data != 'object') return
    return new Observer(data)
}

