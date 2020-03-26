function MVVM(options) {
	this.$options = options;
	var data = this._data = this.$options.data;
	var me = this;

	//this.xxx代理 this.data.xxx
	Object.keys(data).forEach(function (key) {
		me._proxyData(me, key);
	})

	//初始化computed
	this._initComputed();

	/**
	 * 初始化observer 
	 * 首先，Object.defineProperty 进行数据劫持，数据劫持后为每一个属性创造一个Dep(subs)订阅器，
	 */
	observer(data);

	/**
	 * 初始化compile
	 * 其次，进行模板逐行解析，为每一个特殊指令（标识）创造一个watcher订阅者，并且这个watcher回自动将自己添加到对应的订阅器中。
	 * 那么如何自动添加到对应的订阅器中呢？
	 *    其实很简单，只要读取vm（data）中对应的与标识相同的属性，此时会触发data中属性的get，在get中进行watcher订阅者的添加，添加到当前属性对应的订阅器中。
	 */
	this.$compile = new Compile(options.el || document.body, this);
}

MVVM.prototype = {
	$watch: function (exp, cb) {
		new Watcher(this, exp, cb);
	},
	_proxyData: function (me, key) {
		Object.defineProperty(me, key, {
			enumerable: true,
			configurable: false,
			get: function () {
				return me._data[key];
			},
			set: function (value) {
				me._data[key] = value;
			}
		})
	},
	_initComputed: function () {
		var me = this,
			computeds = this.$options.computed;
		if (typeof computeds === 'object') {
			Object.keys(computeds).forEach(function (key) {
				Object.defineProperty(me, key, {
					enumerable: true,
					configurable: false,
					get: typeof computeds[key] == 'function' ? computeds[key] : computeds[key].get,
					set: function () {}
				})
			})
		}
	}
}