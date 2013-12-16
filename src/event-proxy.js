(function (root, ns, factory) {
    "use strict";

    if (typeof (module) !== 'undefined' && module.exports) { // CommonJS
        module.exports = factory(root);
    } else if (typeof (define) === 'function' && define.amd) { // AMD
        define(function () {
            return factory(root);
        });
    } else {
        root[ns] = factory(root);
    }

})(this, "EventProxy", function (root) {
   	var EventProxy = function () {
		if (!(this instanceof EventProxy)) {
			return new EventProxy();
		}
		
		this._events = [];
	};

	EventProxy.prototype = {
		on: function (type, fn) {
			var list = this._events[type] = this._events[type] || [];
			list.push(fn);
			return this;
		},
		
		once: function (type, fn) {
			var that = this,
				_fn = function () {
					fn.apply(null, arguments);
					that.off(type, _fn);
				};
			this.on(type, _fn);
			return this;
		},

		many: function (type, times, fn) {
			var counter = 0,
				that = this,
				_fn = function () {
					counter++;
					fn.apply(type, arguments);
					if (counter >= times) {
						that.off(type, _fn);
					}
				};
			this.on(type, _fn);
			return this;
		},

		off: function (type, fn) {
			var list = this._events[type] = this._events[type] || [];
			for (var i = 0, len = list.length; i < len; i++) {
				if (list[i] === fn) {
					list.splice(i, 1);
					break;
				}
			}
			return this;
		},

		trigger: function (type) {
			var list = this._events[type] = this._events[type] || [],
				args = [].slice.call(arguments, 1),
				toStr = Object.prototype.toString,
				fn;
			list = list.slice(0); // 拷贝一份，避免trigger的fn中调用off后出现错误
			for (var i = 0, len = list.length; i < len; i++) {
				fn = list[i];
				if (toStr.call(fn) === '[object Function]') {
					fn.apply(null, args);
				}
			}
			return this;
		},

		assign: function () {
			var outerArgs = [].slice.call(arguments),
				last = outerArgs.length - 1,
				count = 0,
				finalCallback = outerArgs[last], // 最后一个参数是函数
				type,
				storage = {},
				fns = {},
				that = this;

			// 如果最后的参数不是函数，认为输入错误，不做处理
			if (Object.prototype.toString.call(finalCallback) !== '[object Function]') {
				return ;
			}

			var notify = function () {
				count++;
				if (count === last) {
					clear();
					run(); 
				}
			};

			var run = function () {
				var args = [],
					data;
				for (var i = 0; i < last; i++) {
					data = storage[outerArgs[i]];
					args.push(data);
				}
				finalCallback.apply(null, args);
			};

			var clear = function () {
				for (var type in fns) {
					if (fns.hasOwnProperty(type)) {
						that.off(type, fns[type]);
					}
				}
			};

			for (var i = 0; i < last; i++) {
				type = outerArgs[i];
				var fn = fns[type] = (function (type) {
					return function (value) {
						var data = arguments.length > 1 ? [].slice.call(arguments) : value;
						storage[type] = data;
						notify(); 
					};
				})(type);
				this.on(type, fn);
			}

			return this;
		}
	}; 

	return EventProxy;
});