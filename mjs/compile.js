function Compile(el,vm){
  this.$vm = vm ;
  this.$el = this.isElementNode(el) ? el : document.querySelector(el);
  if(this.$el){
    this.$fragment = this.nodeFilterFragment(this.$el);
    this.init();
    this.$el.appendChild(this.$fragment);
  }
};

Compile.prototype = {
  init:function(){
    this.compile(this.$fragment);
  },
  compile:function(el){
    var childNodes = el.childNodes,me = this;
    [].slice.call(childNodes).forEach(node => {
      var text = node.textContent;
      var reg = /\{\{(.*)\}\}/;
      if(me.isElementNode(node)){
        me.compileElement(node);
      }else if(me.isTextNode(node)&&reg.test(text)){
        me.compileText(node, RegExp.$1.trim());
      }
      if(node.childNodes&&node.childNodes.length>0){
        me.compile(node)
      }
    });
  },
  compileElement: function (node) {
		var nodeAttrs = node.attributes,
			me = this;
		[].slice.call(nodeAttrs).forEach(function (attr) {
			var attrName = attr.name;
			if (me.isDirective(attrName)) {
				var exp = attr.value,
					dir = attrName.substring(2); //on:xxx text html class model
				if (me.isEventDirective(dir)) { //事件指令 v-on:   => on:
					CompileUtil.eventDirective(me.$vm, node, exp, dir);
				} else { //普通指令 v-text v-model v-html v-class => text html class model
					CompileUtil[dir](me.$vm, node, exp, dir);
				}
			}
		})
	},
  compileText:function(node, exp){
    CompileUtil.text(this.$vm, node, exp, 'text')
  },
  nodeFilterFragment:function(node){
    var fragment = document.createDocumentFragment();
    while(child = node.firstChild){
      fragment.appendChild(child);
    };
    return fragment;
  },  
  isElementNode: function (node) {
		return node.nodeType == 1;
  },
  isTextNode: function (node) {
		return node.nodeType == 3;
  },
  isEventDirective: function (attr) {
		return attr.indexOf('on') == 0;
	},
	isDirective: function (attr) {
		return attr.indexOf('v-') == 0;
	},
};

CompileUtil = {
  text:function(vm,node,exp,dir){
    this.bind(vm,node,exp,'text')
  },
  model: function (vm, node, exp, dir) {
		this.bind(vm, node, exp, 'model');
		var me = this;
		node.addEventListener('input', function (e) {
			var newValue = e.target.value,
				val = me._getVMVal(vm, exp);
			if (val == newValue) return;
			me._setVMVal(vm, exp, newValue);
		})
	},
	html: function (vm, node, exp, dir) {
		this.bind(vm, node, exp, 'html');
	},
	class: function (vm, node, exp, dir) {
		this.bind(vm, node, exp, 'class');
	},
  bind:function(vm,node,exp,dir){
    var Update = Updaters[dir+'Updater'],
    val = this._getVMVal(vm,exp);
    Update && Update(node,val)
    new Watcher(vm,exp,function(newValue,oldValue){
      Update && Update(node,newValue,oldValue)
    })
  },
  eventDirective: function (vm, node, exp, dir) {
		var fn = vm.$options.methods && vm.$options.methods[exp],
			eventType = dir.split(':')[1];
		node.addEventListener(eventType, fn.bind(vm), false);
	},
  _getVMVal:function(vm,exp){
    var val = vm,
        exps = exp.split('.');
    exps.forEach(key => {
      if (!val) return;
      val = val[key];
    })
    return val;
  },
  _setVMVal: function (vm, exp, newValue) {
		var exps = exp.split('.'), //如果有.连接符的，只给最后一个child赋newvValue值
			val = vm;
		exps.forEach(function (key, i) {
			if (i < exps.length - 1) {
				val = val[key];
			} else {
				val[key] = newValue;
			}
		})
	},
}

Updaters = {
  textUpdater:function(node,val){
    node.textContent = typeof val == 'undefined' ? '' : val;
  },
  htmlUpdater: function (node, val) {
		node.innerHTML = typeof val == 'undefined' ? '' : val;
	},
	modelUpdater: function (node, val) {
		node.value = typeof val == 'undefined' ? '' : val;
	},
	classUpdater: function (node, val, oldvalue) {
		var className = node.className;
		className = className.replace(oldvalue, '').replace(/\s$/, '');

		var space = className && String(val) ? ' ' : '';

		node.className = className + space + val;
	},
}