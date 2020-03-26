function MVVM(options){
  this.$options = options;
  var data = this._data = options.data;
  var me = this;

  Object.keys(data).forEach(key => {
    me._proxyData(me,key)
  });

  this._initComputed(me);

  observer(data);

  this.$compile = new Compile(options.el || document.body,this);
}

MVVM.prototype = {
  $watch:function(exp,cb){
    new Watcher(this,exp,cb);
  },
  _proxyData:function(me,key){
    Object.defineProperty(me,key,{
      enumerable:true,
      configurable:false,
      get:()=>{
        return me._data[key];
      },
      set:(val)=>{
        me._data[key] = val;
      }
    })
  },
  _initComputed:function(me){
    var computeds = this.$options.computed;
    if(typeof computeds === 'object'){
      Object.keys(computeds).forEach(key => {
        Object.defineProperty(me,key,{
          enumerable:true,
          configurable:false,
          get:typeof computeds[key] === 'function' ? computeds[key] : computeds[key].get ,
          set:()=>{}
        })
      })
    }
  },
}


/**
 * init过程：
initMixin: 初始化全局混入
stateMixin:
    主要做一些方便调用的api $data $props $set $delete $watch
eventsMixin: 
    主要做一些事件相关的api $on $off $once $emit
lifecycleMixin:
	主要做一些生命周期函数 updated forceUpdate destroy
renderMixin:
    暴露$nextTick 声明render
init：
  为每个vue实例添加uid以区分，并根据config.performance配置来开启或关闭性能监控（组件初始化、编译、渲染和打补丁patch的性能追踪）。
  添加isVue避免被observe。
  根据是否为子组件来快速合并options还是需要根据mixin策略进行合并包括extend继承属性。
  
  initProxy 添加些代理来提示用户错误行为，未声明data属性并不是全局允许对象，声明重复config.keycode 
 允许的全局对象'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require'
 添加config.keycode的检测Proxy,若已存在的keycode则提示，不存在则报错，默认有（stop,prevent,self,ctrl,shift,alt,meta）
 那其他修饰符岂不是不检测了？https://github.com/vuejs/vue/blob/1bd6196fb234c28754d9a27095afe0b5b84990ad/src/compiler/codegen/events.js
 需要做下测试。
  initLifecycle 
  赋值parent $root 置空$children $refs watcher 生命周期：_isMounted _isDestroyed _isBeingDestroyed keep-alive的标识（_inactive _directInactive）
  initEvent
  初始化事件，若option.$listener 有值的话绑定在该实例上。
  initRender
  初始化$slots $scopedSlots $createElement  $attrs & $listeners always updated
	回调beforeCreate
  初始化$inject 并添加不可直接修改提示
  initState
    初始化props methods data computed watch
  initInject
    初始化inject并添加不可直接修改提示
	 回调created
 */