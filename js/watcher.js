/**
 * Watcher订阅者
 * @param {*} vm 
 * @param {*} expOrFn 
 * @param {*} cb 
 * 功能：
 *      1、将自己添加到订阅器中(读取被劫持数据的属性的时候将触发添加订阅者操作)
 *      2、更新功能
 */
function Watcher(vm, expOrFn, cb) {
	this.depIds = {};
	console.log(this.depIds, ' ', expOrFn, '每个订阅者')
	this.cb = cb;
	this.expOrFn = expOrFn;
	this.$vm = vm;

	if (typeof expOrFn == 'function') {
		this.getter = expOrFn;
	} else {
		this.getter = this.parseGetter(expOrFn.trim());
	}

	this.value = this.get();
}

Watcher.prototype = {
	addDep: function (dep) {
		if (!this.depIds.hasOwnProperty(dep.id)) {
			dep.addSub(this);
			this.depIds[dep.id] = dep;
		}
	},
	update: function () {
		this.run();
	},
	run: function () {
		var oldvalue = this.value;
		var newValue = this.get();
		if (oldvalue == newValue) return;
		this.cb.call(this.$vm, newValue, oldvalue);
	},
	get: function () {
		Dep.target = this;
		var value = this.getter.call(this.$vm, this.$vm);
		Dep.target = null;
		return value;
	},
	parseGetter: function (exp) {
		if (/[^\w.$]/.test(exp)) return;

		var exps = exp.split('.');
		return function (vm) {
			exps.forEach(function (key) {
				if (!vm) return;
				vm = vm[key];
			});
			return vm;
		}
	}
}