/**
 * observer 数据监听器
 * @param {*} data
 * 功能：
 *  1、劫持所有数据属性，劫持包括 get、set:
 *          1.get的时候添加一个订阅者到订阅器中
 *          2.set的时候通知所有订阅者，属性值变化，更新对应视图
 *  2、为每个数据属性添加订阅器Dep，订阅器Dep拥有如下功能：
 *          1.添加订阅者sub
 *          2.通知订阅者sub更新视图
 */
function observer(data) {
	if (!data || typeof data != 'object') return
	return new Observer(data)
}

function Observer(data) {
	this.data = data;
	this.walk(data);
}

Observer.prototype = {
	walk: function (data) {
		var me = this;
		Object.keys(data).forEach(function (key) {
			me.convert(key, data[key]);
		})
	},
	convert: function (key, value) {
		this.defineReactive(this.data, key, value);
	},
	defineReactive: function (data, key, value) {
		var dep = new Dep(key),
			child = observer(value);
		Object.defineProperty(data, key, {
			enumerable: true,
			configurable: false,
			get: function () {
				if (Dep.target) {
					dep.depend()
				}
				return value;
			},
			set: function (newValue) {
				if (value == newValue) return;
				value = newValue;
				child = observer(newValue);
				dep.notify();
			}
		})
	},
}

var uid = 0;

function Dep(params) {
	this.name = params;
	this.subs = [];
	this.id = uid++;
	console.log('订阅器' + this.name, this.subs, "id" + uid)
}

Dep.prototype = {
	addSub: function (sub) {
		this.subs.push(sub);
	},
	depend: function () {
		Dep.target.addDep(this);
	},
	removeSub: function (sub) {
		var index = this.subs.indexOf(sub);
		if (index != -1) {
			this.subs.splice(index, 1);
		}
	},
	notify: function () {
		this.subs.forEach(function (sub) {
			sub.update();
		})
	}
}