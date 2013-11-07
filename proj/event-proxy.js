var EventProxy = function () {
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
			args = [].slice.call(arguments, 1);
		list = list.slice(0); // 拷贝一份，避免trigger的fn中调用off后出现错误
		for (var i = 0, len = list.length; i < len; i++) {
			list[i].apply(null, args);
		}
		return this;
	},

	assign: function () {
		var outerArgs = arguments,
			last = outerArgs.length - 1,
			count = 0,
			finalCallback = outerArgs[last], // 最后一个参数是函数
			type,
			storage = {},
			fns = {},
			that = this;

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
				return function (data) {
					storage[type] = data;
					notify(); 
				};
			})(type);
			that.on(type, fn);
		}

		return this;
	}
};